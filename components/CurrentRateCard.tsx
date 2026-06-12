'use client'

import { getCurrencyRateData, getCurrencyCurrentRate, getCurrencyPrevRate, getPositionDescription, currencies } from '@/data/mockData'
import type { CurrencyCode } from '@/types'
import clsx from 'clsx'

interface Props {
  currency: CurrencyCode
  onCurrencyChange: (c: CurrencyCode) => void
  activeRate?: number | null
  activeDate?: string | null
  trendColor: string
  isUp: boolean
}

const CHANGE_COLORS = {
  up: { text: '#F04452', bg: '#FFF0F1' },
  down: { text: '#1475F5', bg: '#EEF4FF' },
}

export default function CurrentRateCard({ currency, onCurrencyChange, activeRate, activeDate, trendColor, isUp }: Props) {
  const cfg = currencies.find(c => c.code === currency)!
  const rateData = getCurrencyRateData(currency)
  const currentRate = getCurrencyCurrentRate(currency)
  const prevRate = getCurrencyPrevRate(currency)

  const displayRate = activeRate ?? currentRate
  const isHistorical = activeRate !== null && activeRate !== undefined

  const change = currentRate - prevRate
  const changePct = prevRate ? ((change / prevRate) * 100) : 0

  const positionText = getPositionDescription(displayRate, rateData)
  const rates = rateData.map(d => d.rate)
  const rangeMin = Math.min(...rates)
  const rangeMax = Math.max(...rates)

  const formattedDate = activeDate
    ? new Date(activeDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
    : null

  const formatRate = (r: number) => {
    if (cfg.decimals === 0) return r.toLocaleString('ko-KR')
    return r.toLocaleString('ko-KR', { minimumFractionDigits: cfg.decimals, maximumFractionDigits: cfg.decimals })
  }

  const formatChange = (n: number) => {
    if (cfg.decimals === 0) return Math.abs(Math.round(n)).toLocaleString('ko-KR')
    return Math.abs(n).toLocaleString('ko-KR', { minimumFractionDigits: cfg.decimals, maximumFractionDigits: cfg.decimals })
  }

  const changeColor = isUp ? CHANGE_COLORS.up : CHANGE_COLORS.down

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col overflow-hidden"
      style={{ borderTop: `3px solid ${trendColor}` }}
    >
      {/* Currency tabs */}
      <div className="flex gap-0.5 px-4 pt-4 mb-4">
        {currencies.map(c => (
          <button
            key={c.code}
            onClick={() => onCurrencyChange(c.code)}
            className="flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-all duration-150"
            style={currency === c.code
              ? { backgroundColor: trendColor, color: 'white' }
              : { color: '#9CA3AF' }
            }
          >
            {c.code}
          </button>
        ))}
      </div>

      <div className="px-5 flex-1 flex flex-col">
        {/* Date label — fades in during scrubbing, fades out on snap-back */}
        <p
          className="text-[11px] font-semibold tracking-wide uppercase mb-1 transition-opacity duration-200"
          style={{
            color: trendColor,
            opacity: isHistorical ? 1 : 0,
            height: '16px',
          }}
        >
          {formattedDate ?? ''}
        </p>

        {/* Rate number + unit */}
        <div className="flex items-end gap-1.5 mb-2">
          <span
            className="text-[42px] font-bold text-gray-900 tabular-nums leading-none"
            style={{ transition: 'opacity 0.15s ease-out' }}
          >
            {formatRate(displayRate)}
          </span>
          <span className="text-lg text-gray-400 mb-0.5">원</span>
        </div>

        {/* Change indicator — fades out during historical scrubbing */}
        <div
          className="flex items-center gap-2 mb-4 transition-opacity duration-200"
          style={{ opacity: isHistorical ? 0 : 1 }}
        >
          <span
            className="text-sm font-bold tabular-nums px-2.5 py-1 rounded-lg"
            style={{ color: changeColor.text, backgroundColor: changeColor.bg }}
          >
            {isUp ? '▲' : '▼'} {formatChange(change)}원
          </span>
          <span className="text-xs font-semibold tabular-nums" style={{ color: changeColor.text }}>
            {isUp ? '+' : ''}{changePct.toFixed(2)}%
          </span>
          <span className="text-xs text-gray-400">전일 대비</span>
        </div>

        {/* Position */}
        <div className="flex-1 pt-3 border-t border-gray-50">
          <p className="text-[13px] font-semibold text-gray-800 leading-snug mb-1 transition-all duration-300">
            {positionText}
          </p>
          <p className="text-xs text-gray-400 tabular-nums">
            3개월 범위 {formatRate(rangeMin)} ~ {formatRate(rangeMax)}원
          </p>
        </div>
      </div>

      {/* Last update */}
      <div className="px-5 pb-4 mt-3 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-gray-400">1분 전 업데이트</span>
      </div>
    </div>
  )
}
