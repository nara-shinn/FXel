import type { RateDataPoint, Issue, Alert, Insight, CurrencyConfig, CurrencyCode } from '@/types'

export const mainTheme = '미중 무역 갈등과 국내 경기 둔화로 원화 변동성 확대'

export const currencies: CurrencyConfig[] = [
  { code: 'USD', name: '미국 달러', decimals: 0, scale: 1 },
  { code: 'JPY', name: '일본 엔', decimals: 2, scale: 9.22 / 1395 },
  { code: 'EUR', name: '유로', decimals: 0, scale: 1455 / 1395 },
  { code: 'CNY', name: '중국 위안', decimals: 1, scale: 182 / 1395 },
]

export const issues: Issue[] = [
  {
    id: 1,
    keyword: '미 연준 금리 동결',
    category: '연준',
    headline: '연준 금리 동결로 달러 강세 기대 이어져',
    tags: ['금리 동결', '달러 강세', '통화정책'],
    question: '왜 환율 상승 압력이 생겼나요?',
    summary: '미 연준이 금리를 동결하며 추가 인상 가능성을 열어뒀어요',
    cause: '인플레이션 목표 미달성으로 금리 동결 결정, 달러 강세 기대 유지',
    effect: '달러 강세 기대가 지속되며 원달러 환율이 상승 압력을 받았어요',
    reflection: [
      '연준이 금리를 내리기 시작하면 달러는 어떻게 변할까요?',
      '지금 달러를 사두는 것이 유리할까요, 기다리는 게 나을까요?',
    ],
    source: '연합인포맥스, 로이터',
    newsTitle: '연준, 금리 동결…"인플레 목표 아직 멀었다"',
    newsUrl: '#',
    startDate: '2026-03-11',
    endDate: '2026-03-17',
    impact: 'up',
  },
  {
    id: 2,
    keyword: '한국 무역수지 적자',
    category: '경제지표',
    headline: '2월 무역수지 적자 발표, 원달러 1,396원까지 급등',
    tags: ['무역수지', '반도체', '수출 부진'],
    question: '왜 환율이 갑자기 올랐나요?',
    summary: '2월 한국 무역수지가 반도체 수출 부진으로 예상 밖 적자를 기록했어요',
    cause: '반도체 수출 부진으로 무역수지 악화, 원화 수요 감소',
    effect: '원화 수요가 줄어들며 환율이 1,390원대까지 빠르게 올라갔어요',
    reflection: [
      '무역수지가 개선되면 환율에는 어떤 영향이 생길까요?',
      '한국 수출 기업의 실적이 원화 환율과 어떻게 연결될까요?',
    ],
    source: '한국경제, Bloomberg',
    newsTitle: '2월 무역수지 -8억 달러…수출 회복 지연',
    newsUrl: '#',
    startDate: '2026-03-18',
    endDate: '2026-03-25',
    impact: 'up',
  },
  {
    id: 3,
    keyword: '트럼프 관세 완화 시사',
    category: '관세',
    headline: '트럼프 관세 완화 시사에 원화 1,365원으로 강세 전환',
    tags: ['관세 완화', '무역 협상', '위험자산 선호'],
    question: '왜 환율이 내려갔나요?',
    summary: '트럼프 대통령이 일부 국가와의 무역 협상 타결 가능성을 언급했어요',
    cause: '관세 완화 기대감으로 위험자산 선호 심리가 회복',
    effect: '원화가 강세로 전환되어 환율이 1,365원까지 내려왔어요',
    reflection: [
      '관세 갈등이 완화되면 나의 해외 직구 비용은 어떻게 바뀔까요?',
      '원화 강세 시기에 달러 자산을 갖고 있다면 어떤 일이 벌어질까요?',
    ],
    source: 'AP통신, 연합뉴스',
    newsTitle: '트럼프 "한국과 협상 잘 되고 있다"…시장 반응 긍정적',
    newsUrl: '#',
    startDate: '2026-03-26',
    endDate: '2026-04-04',
    impact: 'down',
  },
  {
    id: 4,
    keyword: '미중 관세 전쟁 재점화',
    category: '관세',
    headline: '미중 전기차 관세 100% 부과, 원화 1,410원 돌파',
    tags: ['전기차 관세', '미중 갈등', '아시아 통화 약세'],
    question: '왜 원화가 급격히 약해졌나요?',
    summary: '미국이 중국산 전기차에 관세 100%를 부과하며 무역 갈등이 재점화됐어요',
    cause: '미중 무역 갈등 고조로 아시아 통화 전반의 위험 회피',
    effect: '달러 강세 가속화로 환율이 1,410원을 돌파했어요',
    reflection: [
      '미중 갈등이 심화될수록 아시아 통화는 어떤 방향으로 움직일까요?',
      '한국은 미국과 중국 사이에서 어떤 영향을 받을까요?',
    ],
    source: 'WSJ, 연합인포맥스',
    newsTitle: '미, 중국산 전기차 관세 100%…중국 보복 예고',
    newsUrl: '#',
    startDate: '2026-04-05',
    endDate: '2026-04-18',
    impact: 'up',
  },
  {
    id: 5,
    keyword: '중동 지정학 리스크',
    category: '지정학',
    headline: '중동 충돌 격화로 안전자산 수요 폭발, 1,425원',
    tags: ['지정학 리스크', '안전자산', '국제 유가'],
    question: '왜 달러 수요가 급등했나요?',
    summary: '이란-이스라엘 갈등이 다시 격화되며 안전자산 수요가 급증했어요',
    cause: '중동 불안정으로 국제 유가 급등, 안전자산 선호 심리 폭발',
    effect: '달러 수요 급증으로 환율이 1,425원까지 치솟았어요',
    reflection: [
      '전쟁이나 지정학 위기가 발생하면 왜 달러가 오르는 걸까요?',
      '유가가 오르면 원화 환율에는 어떤 영향이 있을까요?',
    ],
    source: 'Reuters, 중앙일보',
    newsTitle: '이란, 이스라엘에 드론 공격…원유 공급 차질 우려',
    newsUrl: '#',
    startDate: '2026-04-19',
    endDate: '2026-04-28',
    impact: 'up',
  },
  {
    id: 6,
    keyword: '한미 정상회담',
    category: '정치',
    headline: '한미 반도체 협력 합의로 원화 1,400원 아래로',
    tags: ['한미 협력', '반도체 공급망', '관세 면제'],
    question: '왜 원화가 강세로 돌아섰나요?',
    summary: '한미 정상회담에서 반도체 공급망 협력과 관세 예외 합의가 나왔어요',
    cause: '한미 경제 협력 강화로 한국 경제 펀더멘털 개선 전망',
    effect: '원화 강세 전환으로 환율이 1,400원 아래로 내려왔어요',
    reflection: [
      '한미 관계 강화가 내 해외 여행이나 직구에 좋은 소식인가요?',
      '반도체 협력이 원화에 미치는 영향은 어떤 경로로 발생할까요?',
    ],
    source: '청와대 브리핑, AP',
    newsTitle: '한미 정상, 반도체·배터리 협력 합의…관세 일부 면제',
    newsUrl: '#',
    startDate: '2026-04-29',
    endDate: '2026-05-10',
    impact: 'down',
  },
  {
    id: 7,
    keyword: '美 4월 CPI 하회',
    category: '연준',
    headline: '美 CPI 2.8% 충격, 금리 인하 기대에 달러 약세',
    tags: ['인플레이션 둔화', '금리 인하 기대', '달러 약세'],
    question: '왜 달러가 약세로 바뀌었나요?',
    summary: '미국 4월 물가지수가 예상(3.1%)보다 크게 낮은 2.8%로 나왔어요',
    cause: '인플레이션 둔화 신호로 연준 금리 인하 기대 급상승',
    effect: '달러 수요 감소로 환율이 1,385원대로 하락했어요',
    reflection: [
      '인플레이션이 잡히면 금리가 내려가는 이유가 뭘까요?',
      '달러가 약세가 되면 지금 해외여행을 가는 게 유리할까요?',
    ],
    source: 'BLS, Bloomberg',
    newsTitle: '美 4월 CPI 2.8%…금리 인하 기대 재부상',
    newsUrl: '#',
    startDate: '2026-05-11',
    endDate: '2026-05-22',
    impact: 'down',
  },
  {
    id: 8,
    keyword: '한국 1분기 GDP',
    category: '경제지표',
    headline: 'GDP 0.3% 성장 쇼크, 원화 약세 압력 지속',
    tags: ['성장 둔화', '내수 침체', '원화 약세'],
    question: '왜 환율이 계속 불안하게 움직이나요?',
    summary: '한국 1분기 GDP 성장률이 예상(0.6%)의 절반인 0.3%에 그쳤어요',
    cause: '수출 부진과 내수 침체로 경제 성장 둔화 심화',
    effect: '원화 약세 압력이 지속되며 환율이 1,395원 수준을 유지하고 있어요',
    reflection: [
      'GDP가 낮게 나오면 왜 원화가 약해질까요?',
      '경제 성장이 둔화될 때 개인 투자에서 주의해야 할 점은 뭘까요?',
    ],
    source: '한국은행, 연합뉴스',
    newsTitle: '1분기 GDP 0.3% 성장…내수 부진 심화',
    newsUrl: '#',
    startDate: '2026-05-23',
    endDate: '2026-06-10',
    impact: 'volatile',
  },
]

export const insights: Insight[] = [
  { id: 'ins_1', date: '2026-03-20', label: '무역수지 적자', issueId: 2 },
  { id: 'ins_2', date: '2026-04-07', label: '관세 전쟁', issueId: 4 },
  { id: 'ins_3', date: '2026-04-22', label: '중동 리스크', issueId: 5 },
  { id: 'ins_4', date: '2026-05-14', label: 'CPI 발표', issueId: 7 },
]

function generateRates(): RateDataPoint[] {
  const data: RateDataPoint[] = []
  const segments = [
    { start: '2026-03-11', end: '2026-03-17', startRate: 1381, endRate: 1388, issueId: 1 },
    { start: '2026-03-18', end: '2026-03-25', startRate: 1389, endRate: 1396, issueId: 2 },
    { start: '2026-03-26', end: '2026-04-04', startRate: 1394, endRate: 1366, issueId: 3 },
    { start: '2026-04-05', end: '2026-04-18', startRate: 1370, endRate: 1412, issueId: 4 },
    { start: '2026-04-19', end: '2026-04-28', startRate: 1414, endRate: 1425, issueId: 5 },
    { start: '2026-04-29', end: '2026-05-10', startRate: 1422, endRate: 1398, issueId: 6 },
    { start: '2026-05-11', end: '2026-05-22', startRate: 1396, endRate: 1385, issueId: 7 },
    { start: '2026-05-23', end: '2026-06-10', startRate: 1387, endRate: 1395, issueId: 8 },
  ]
  for (const seg of segments) {
    const start = new Date(seg.start)
    const end = new Date(seg.end)
    const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
    for (let i = 0; i < days; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      if (d.getDay() === 0 || d.getDay() === 6) continue
      const t = days === 1 ? 0 : i / (days - 1)
      const base = seg.startRate + (seg.endRate - seg.startRate) * t
      const noise = (Math.sin(i * 2.7 + seg.issueId * 1.3) * 3) + (Math.cos(i * 1.9) * 2)
      data.push({
        date: d.toISOString().split('T')[0],
        rate: Math.round(base + noise),
        issueId: seg.issueId,
      })
    }
  }
  return data
}

export const usdRateData: RateDataPoint[] = generateRates()

export function getCurrencyRateData(currency: CurrencyCode): RateDataPoint[] {
  const cfg = currencies.find(c => c.code === currency)!
  if (currency === 'USD') return usdRateData
  return usdRateData.map(d => ({
    ...d,
    rate: parseFloat((d.rate * cfg.scale).toFixed(cfg.decimals)),
  }))
}

export function getCurrencyCurrentRate(currency: CurrencyCode): number {
  const data = getCurrencyRateData(currency)
  return data[data.length - 1]?.rate ?? 0
}

export function getCurrencyPrevRate(currency: CurrencyCode): number {
  const data = getCurrencyRateData(currency)
  return data[data.length - 2]?.rate ?? data[data.length - 1]?.rate ?? 0
}

// Legacy aliases
export const rateData = usdRateData
export const currentRate = getCurrencyCurrentRate('USD')
export const maxRate = Math.max(...usdRateData.map(d => d.rate))
export const minRate = Math.min(...usdRateData.map(d => d.rate))

export function getPositionDescription(rate: number, data: RateDataPoint[]): string {
  const rates = data.map(d => d.rate)
  const max = Math.max(...rates)
  const min = Math.min(...rates)
  const position = (rate - min) / ((max - min) || 1)
  if (position >= 0.9) return '최근 3개월 중 가장 높은 수준이에요'
  if (position >= 0.75) return '최근 3개월 중 상위권에 있어요'
  if (position >= 0.6) return '최근 3개월 평균보다 조금 높은 수준이에요'
  if (position >= 0.4) return '최근 3개월 중 중간 수준이에요'
  if (position >= 0.25) return '최근 3개월 평균보다 조금 낮은 수준이에요'
  if (position >= 0.1) return '최근 3개월 중 하위권에 있어요'
  return '최근 3개월 중 가장 낮은 수준이에요'
}

export function getAlertPresets(currencyData: RateDataPoint[]) {
  const rates = currencyData.map(d => d.rate)
  const last30 = rates.slice(-30)
  const last7 = rates.slice(-7)
  const avg30 = Math.round(last30.reduce((a, b) => a + b, 0) / last30.length * 10) / 10
  const min90 = Math.min(...rates)
  const min7 = Math.min(...last7)
  const fmt = (n: number) => n.toLocaleString('ko-KR')
  return [
    {
      id: 'average_below' as const,
      name: '최근 평균보다 낮을 때',
      description: `최근 30일 평균 ${fmt(avg30)}원보다 낮아지면 알림`,
      lowerBound: Math.round(avg30 * 0.9 * 10) / 10,
      upperBound: avg30,
    },
    {
      id: 'three_month_low' as const,
      name: '3개월 최저점 근처',
      description: `3개월 최저 ${fmt(min90)}원 근처에 오면 알림`,
      lowerBound: Math.round(min90 * 0.98 * 10) / 10,
      upperBound: Math.round(min90 * 1.02 * 10) / 10,
    },
    {
      id: 'week_low' as const,
      name: '1주일 최저점 근처',
      description: `이번 주 최저 ${fmt(min7)}원 근처에 오면 알림`,
      lowerBound: Math.round(min7 * 0.99 * 10) / 10,
      upperBound: Math.round(min7 * 1.01 * 10) / 10,
    },
  ]
}

export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    currency: 'USD',
    label: '최근 평균보다 낮을 때',
    preset: 'average_below',
    lowerBound: 1350,
    upperBound: 1475,
    active: true,
  },
]
