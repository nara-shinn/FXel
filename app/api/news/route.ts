import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Google News RSS — 서버사이드 요청 차단 없음, API 키 불필요
const RSS_URLS = [
  'https://news.google.com/rss/search?q=KRW+USD+won+dollar+exchange+rate&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=원달러+환율+연준+금리&hl=ko&gl=KR&ceid=KR:ko',
]

interface RssItem {
  title: string
  description: string
  link: string
  pubDate: string
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
    if (title) items.push({ title, description: get('description'), link: get('link'), pubDate: get('pubDate') })
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
        if (!r.ok) throw new Error(`RSS fetch failed: ${r.status}`)
        return r.text()
      })
    )
  )
  const items: RssItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...parseRss(r.value))
    else console.warn('[/api/news] RSS fetch error:', r.reason)
  }
  const seen = new Set<string>()
  return items
    .filter(i => { if (seen.has(i.title)) return false; seen.add(i.title); return true })
    .slice(0, 10)
}

export async function GET() {
  const googleKey = process.env.GOOGLE_AI_API_KEY
  if (!googleKey) {
    return NextResponse.json({ error: 'GOOGLE_AI_API_KEY not configured' }, { status: 503 })
  }

  try {
    const items = await fetchRssItems()
    if (items.length === 0) {
      console.warn('[/api/news] No RSS items fetched')
      return NextResponse.json({ issues: [] })
    }

    const genAI = new GoogleGenerativeAI(googleKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const today = new Date().toISOString().split('T')[0]

    const prompt = `다음 영문/한국어 금융 뉴스 기사들을 분석해서 원/달러 환율에 영향을 준 핵심 이슈 최대 6개를 골라 한국어로 요약해줘.

반드시 아래 JSON 배열 형식만 반환 (다른 텍스트 없이):
[
  {
    "keyword": "핵심 키워드 (한국어, 12자 이내)",
    "category": "연준|관세|지정학|경제지표|정치 중 하나",
    "headline": "한 줄 뉴스 헤드라인 (25자 이내, 핵심 숫자 포함)",
    "tags": ["태그1", "태그2", "태그3"],
    "question": "왜 ~했나요? 형식의 질문 (20자 이내)",
    "summary": "핵심 내용 한 줄 요약 (40자 이내)",
    "cause": "원인 한 문장 (30자 이내)",
    "effect": "원화 환율 영향 한 문장 (30자 이내)",
    "impact": "up|down|volatile 중 하나",
    "source": "뉴스 출처 매체명",
    "newsTitle": "원문 기사 제목",
    "newsUrl": "기사 URL"
  }
]

뉴스 기사:
${items.map((item, i) => `[${i + 1}] ${item.title}\n${item.description ? item.description.slice(0, 200) : ''}\nURL: ${item.link}`).join('\n\n')}`

    const result = await model.generateContent(prompt)
    const raw = result.response.text()
    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('Gemini returned no JSON array')
    const parsed: any[] = JSON.parse(jsonMatch[0])

    const reflection = [
      '이 이슈가 지속된다면 환율은 어떤 방향으로 움직일까요?',
      '비슷한 상황에서 개인 투자자는 어떤 결정을 내려야 할까요?',
    ]

    const issues = parsed.map((item, i) => ({
      id: 100 + i,
      keyword: item.keyword || '뉴스 이슈',
      category: item.category || '경제지표',
      headline: item.headline || item.newsTitle || '',
      tags: Array.isArray(item.tags) ? item.tags : [],
      question: item.question || '어떤 영향이 있나요?',
      summary: item.summary || '',
      cause: item.cause || '',
      effect: item.effect || '',
      reflection,
      impact: item.impact || 'volatile',
      source: item.source || 'Google News',
      newsTitle: item.newsTitle || item.keyword,
      newsUrl: item.newsUrl || '#',
      startDate: today,
      endDate: today,
    }))

    return NextResponse.json({ issues }, {
      headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600' },
    })
  } catch (err) {
    console.error('[/api/news]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
