export interface RateDataPoint {
  date: string
  rate: number
  issueId: number | null
}

export interface Issue {
  id: number
  keyword: string
  category: '연준' | '관세' | '지정학' | '경제지표' | '정치'
  question: string
  summary: string
  cause: string
  effect: string
  headline: string
  tags: string[]
  reflection: string[]
  source: string
  newsTitle: string
  newsUrl: string
  startDate: string
  endDate: string
  impact: 'up' | 'down' | 'volatile'
}

export interface Insight {
  id: string
  date: string
  label: string
  issueId: number
}

export interface Alert {
  id: string
  currency: string
  label: string
  preset: 'average_below' | 'three_month_low' | 'week_low' | 'custom'
  lowerBound: number
  upperBound: number
  active: boolean
}

export type ChartPeriod = '1W' | '1M' | '3M' | '1Y'

export type CurrencyCode = 'USD' | 'JPY' | 'EUR' | 'CNY'

export interface CurrencyConfig {
  code: CurrencyCode
  name: string
  decimals: number
  scale: number
}
