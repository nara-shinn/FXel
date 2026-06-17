import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const RSS_URLS = [
  'https://news.google.com/rss/search?q=KRW+USD+won+dollar+exchange+rate&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=원달러+환율+연준+금리&hl=ko&gl=KR&ceid=KR:ko',
]

interface RssItem {
  title: string
  description: string
  link: string
}

function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = []
  const blocks = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g))
  for (const block of blocks) {
    const c = block[1]
    const get = (tag: string) =>
      c.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`))?.[1] ||
      c.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1]?.replace(/<[^>]+>/g, '').trim() || ''
    const title = get('title')
    if (title) items.push({ title, description: get('description'), link: get('link') })
  }
  return items
}

async function fetchRssItems(): Promise<RssItem[]> {
  const results = await Promise.allSettled(
    RSS_URLS.map(url =>
      fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
        next: { revalidate: 1800 },
      }).then(r => {
        if (!r.ok) throw new Error(`RSS ${r.status}`)
        return r.text()
      })
    )
  )
  const items: RssItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...parseRss(r.value))
    else console.warn('[/api/news] RSS error:', r.reason)
  }
  const seen = new Set<string>()
  return items
    .filter(i => { if (seen.has(i.title)) return false; seen.add(i.title); return true })
    .slice(0, 12)
}

const SYSTEM_PROMPT = `# ROLE
당신은 경제 초보자를 위한 환율 뉴스 에디터다.
입력된 뉴스 기사들을 분석하여 환율에 영향을 준 핵심 원인을 추출한다.
사용자는 경제 지식이 거의 없다.
경제 기사나 전문가가 아니라, 초등학생에게 설명하는 선생님처럼 작성한다.

# 목표
사용자가
1. 칩(키워드)만 보고도 현재 상황을 이해하고
2. 모달을 열면 환율이 움직인 이유를 이해하도록 만든다.

뉴스 자체를 요약하지 말고, "환율에 영향을 준 이유"를 설명한다.

# 칩(키워드) 작성 규칙
* 최대 6글자
* 명사 나열 금지
* 경제 용어 최소화
* 누구나 이해 가능
* 중복 금지
* 최대 5개
* 중요도 순 정렬

좋은 예: 전쟁 걱정, 달러 강세, 물가 걱정, 금리 유지, 정부 경고, 유가 상승, 수출 둔화, 달러 몰림
나쁜 예: 지정학적 리스크, 통화정책, 달러인덱스, 외환시장 변동성

# 모달 제목: [상황] + [환율 영향] 형식
예: "전쟁 걱정 커지며 환율 상승", "미국 경제 호조로 달러 강세"

# 왜 중요했나요?: 30자 이내, 경제 지식 없는 사람도 이해 가능
# 원인: 20자 이내, 실제 원인만
# 영향: 20자 이내, 환율 관점에서

# 출력 JSON (JSON 외 텍스트 절대 금지)
{
  "headline": "오늘 환율 상황을 한 줄로 요약 (30자 이내)",
  "chips": ["칩1", "칩2", "칩3"],
  "details": [
    {
      "chip": "칩1",
      "title": "모달 제목",
      "summary": "왜 중요했나요 (30자 이내)",
      "cause": "원인 (20자 이내)",
      "impact": "영향 (20자 이내)"
    }
  ]
}`

export async function GET() {
  const googleKey = process.env.GOOGLE_AI_API_KEY
  if (!googleKey) {
    return NextResponse.json({ error: 'GOOGLE_AI_API_KEY not configured' }, { status: 503 })
  }

  try {
    const items = await fetchRssItems()
    if (items.length === 0) {
      console.warn('[/api/news] No RSS items')
      return NextResponse.json({ issues: [], headline: null })
    }

    const genAI = new GoogleGenerativeAI(googleKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    })
    const today = new Date().toISOString().split('T')[0]

    const result = await model.generateContent(
      `뉴스 기사:\n${items.map((item, i) => `[${i + 1}] ${item.title}\n${item.description?.slice(0, 150) || ''}`).join('\n\n')}`
    )

    const raw = result.response.text()
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    const parsed = JSON.parse(jsonMatch[0])

    // 새 구조 → 기존 Issue 타입으로 매핑
    const issues = (parsed.details ?? []).map((d: any, i: number) => ({
      id: 100 + i,
      keyword: d.chip || '',
      category: '경제지표' as const,
      headline: d.title || '',
      tags: [],
      question: d.summary || '',
      summary: d.summary || '',
      cause: d.cause || '',
      effect: d.impact || '',
      reflection: [
        '이 이슈가 지속된다면 환율은 어떤 방향으로 움직일까요?',
        '비슷한 상황에서 개인 투자자는 어떤 결정을 내려야 할까요?',
      ],
      impact: 'volatile' as const,
      source: 'Google News',
      newsTitle: d.title || '',
      newsUrl: '#',
      startDate: today,
      endDate: today,
    }))

    return NextResponse.json(
      { issues, headline: parsed.headline ?? null },
      { headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600' } }
    )
  } catch (err) {
    console.error('[/api/news]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
