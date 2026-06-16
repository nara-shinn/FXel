import { NextResponse } from 'next/server'

const BASE = 'https://api.frankfurter.app'

function getStartDate(period: string): string {
  const d = new Date()
  if (period === '1W') d.setDate(d.getDate() - 7)
  else if (period === '1M') d.setMonth(d.getMonth() - 1)
  else if (period === '3M') d.setMonth(d.getMonth() - 3)
  else d.setFullYear(d.getFullYear() - 1) // 1Y
  return d.toISOString().split('T')[0]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const currency = (searchParams.get('currency') || 'USD').toUpperCase()
  const period = searchParams.get('period') || '1Y'

  const startDate = getStartDate(period)
  const endDate = new Date().toISOString().split('T')[0]

  try {
    // Always include KRW, plus the target currency if it's not USD
    const toList = currency === 'USD' ? 'KRW' : `KRW,${currency}`
    const url = `${BASE}/${startDate}..${endDate}?from=USD&to=${toList}`

    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`Frankfurter error: ${res.status}`)
    const data = await res.json()

    const points = Object.entries(data.rates)
      .map(([date, rates]: [string, any]) => {
        let rate: number
        if (currency === 'USD') rate = Math.round(rates.KRW)
        else if (currency === 'JPY') rate = parseFloat((rates.KRW / rates.JPY).toFixed(2))
        else if (currency === 'EUR') rate = Math.round(rates.KRW / rates.EUR)
        else if (currency === 'CNY') rate = parseFloat((rates.KRW / rates.CNY).toFixed(1))
        else rate = Math.round(rates.KRW)

        return { date, rate, issueId: null as null }
      })
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json(points)
  } catch (err) {
    console.error('[/api/history]', err)
    return NextResponse.json({ error: 'History fetch failed' }, { status: 502 })
  }
}
