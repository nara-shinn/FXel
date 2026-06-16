import { NextResponse } from 'next/server'

const BASE = 'https://api.frankfurter.app'

const toKrw = (data: any, currency: string): number => {
  if (currency === 'USD') return Math.round(data.rates.KRW)
  if (currency === 'JPY') return parseFloat((data.rates.KRW / data.rates.JPY).toFixed(2))
  if (currency === 'EUR') return Math.round(data.rates.KRW / data.rates.EUR)
  if (currency === 'CNY') return parseFloat((data.rates.KRW / data.rates.CNY).toFixed(1))
  return Math.round(data.rates.KRW)
}

// 직전 영업일 계산 (주말 스킵)
function prevBusinessDay(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export async function GET() {
  try {
    const prevDate = prevBusinessDay()

    const [latestRes, prevRes] = await Promise.all([
      fetch(`${BASE}/latest?from=USD&to=KRW,JPY,EUR,CNY`, { next: { revalidate: 60 } }),
      fetch(`${BASE}/${prevDate}?from=USD&to=KRW,JPY,EUR,CNY`, { next: { revalidate: 3600 } }),
    ])

    if (!latestRes.ok) throw new Error('Frankfurter /latest failed')

    const latest = await latestRes.json()
    const prev = prevRes.ok ? await prevRes.json() : null

    return NextResponse.json({
      date: latest.date,
      current: {
        USD: toKrw(latest, 'USD'),
        JPY: toKrw(latest, 'JPY'),
        EUR: toKrw(latest, 'EUR'),
        CNY: toKrw(latest, 'CNY'),
      },
      prev: prev ? {
        USD: toKrw(prev, 'USD'),
        JPY: toKrw(prev, 'JPY'),
        EUR: toKrw(prev, 'EUR'),
        CNY: toKrw(prev, 'CNY'),
      } : null,
    })
  } catch (err) {
    console.error('[/api/rates]', err)
    return NextResponse.json({ error: 'Rate fetch failed' }, { status: 502 })
  }
}
