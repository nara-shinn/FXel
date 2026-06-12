'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ReferenceDot, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { getCurrencyRateData, insights, currencies } from '@/data/mockData'
import type { RateDataPoint, ChartPeriod, CurrencyCode } from '@/types'

const ACCENT = '#1475F5'

interface Props {
  currency: CurrencyCode
  activeIndex: number | null
  onActiveIndexChange: (index: number | null) => void
  onInsightClick: (issueId: number) => void
  trendColor: string
}

const PERIODS: { label: string; value: ChartPeriod }[] = [
  { label: '1주', value: '1W' },
  { label: '1달', value: '1M' },
  { label: '3달', value: '3M' },
  { label: '1년', value: '1Y' },
]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function ExchangeRateChart({
  currency,
  activeIndex,
  onActiveIndexChange,
  onInsightClick,
  trendColor,
}: Props) {
  const [period, setPeriod] = useState<ChartPeriod>('3M')
  const allData = useMemo(() => getCurrencyRateData(currency), [currency])
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredData = useMemo(() => {
    const days = period === '1W' ? 7 : period === '1M' ? 30 : allData.length
    return allData.slice(-days)
  }, [allData, period])

  const cfg = currencies.find(c => c.code === currency)!

  const periodInsights = useMemo(
    () => insights.filter(ins => filteredData.some(d => d.date === ins.date)),
    [filteredData]
  )

  const fmtRate = (r: number) => cfg.decimals === 0
    ? r.toLocaleString('ko-KR')
    : r.toLocaleString('ko-KR', { minimumFractionDigits: cfg.decimals, maximumFractionDigits: cfg.decimals })

  const maxRate = useMemo(() => Math.max(...filteredData.map(d => d.rate)), [filteredData])
  const minRate = useMemo(() => Math.min(...filteredData.map(d => d.rate)), [filteredData])
  const yPad = cfg.decimals === 0 ? 15 : maxRate * 0.01
  const yMin = cfg.decimals === 0
    ? Math.floor((minRate - yPad) / 5) * 5
    : Math.floor((minRate - yPad) * 100) / 100
  const yMax = cfg.decimals === 0
    ? Math.ceil((maxRate + yPad) / 5) * 5
    : Math.ceil((maxRate + yPad) * 100) / 100

  const tickCount = Math.min(5, filteredData.length)
  const xTicks = Array.from({ length: tickCount }, (_, i) =>
    filteredData[Math.floor((i / (tickCount - 1)) * (filteredData.length - 1))]?.date
  ).filter(Boolean)

  const gradientId = `grad-${currency}`
  const lastPoint = filteredData[filteredData.length - 1]

  // ── Touch scrubbing (Robinhood-style) ──
  // Chart margin: left=0 (no Y-axis), right=16 — matched to <AreaChart margin> below
  const CHART_MARGIN_LEFT = 0
  const CHART_MARGIN_RIGHT = 16

  const getIndexFromX = useCallback((clientX: number): number => {
    if (!containerRef.current || filteredData.length === 0) return filteredData.length - 1
    const rect = containerRef.current.getBoundingClientRect()
    const plotWidth = rect.width - CHART_MARGIN_LEFT - CHART_MARGIN_RIGHT
    const fraction = Math.max(0, Math.min(1, (clientX - rect.left - CHART_MARGIN_LEFT) / plotWidth))
    return Math.round(fraction * (filteredData.length - 1))
  }, [filteredData.length])

  // Register non-passive touch listeners so preventDefault() works (prevents page scroll during scrubbing)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const idx = getIndexFromX(e.touches[0].clientX)
      onActiveIndexChange(idx)
    }

    const onTouchEnd = () => {
      // Snap back to current
      onActiveIndexChange(null)
    }

    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    return () => {
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [getIndexFromX, onActiveIndexChange])

  const handleMouseMove = (e: any) => {
    if (e?.activeTooltipIndex !== undefined && e.activeTooltipIndex !== null) {
      onActiveIndexChange(e.activeTooltipIndex)
    }
  }

  const handleClick = (e: any) => {
    if (e?.activeTooltipIndex !== undefined) {
      const clicked = filteredData[e.activeTooltipIndex]
      const insight = insights.find(ins => ins.date === clicked?.date)
      if (insight) onInsightClick(insight.issueId)
    }
  }

  const activePoint = activeIndex !== null ? filteredData[activeIndex] : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <span className="text-[12px] font-semibold text-gray-400 tracking-wide uppercase">{currency}/KRW</span>
          {activePoint && (
            <p className="text-[11px] text-gray-400 mt-0.5 tabular-nums">
              {new Date(activePoint.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
        {/* Period tabs */}
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className="text-[11px] font-bold px-2.5 py-1 rounded-md transition-all duration-150"
              style={
                period === p.value
                  ? { backgroundColor: 'white', color: '#111827', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }
                  : { color: '#9CA3AF' }
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Robinhood-style chart: no grid, full bleed ── */}
      <div
        ref={containerRef}
        className="select-none cursor-crosshair"
        onMouseLeave={() => onActiveIndexChange(null)}
        onMouseMove={() => {}}
        style={{ userSelect: 'none' }}
      >
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={filteredData}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity={0.18} />
                <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* No CartesianGrid — Robinhood style */}

            {/* Y-axis hidden (keeps domain calculation but renders nothing) */}
            <YAxis domain={[yMin, yMax]} hide />

            {/* Minimal X-axis: only dates, no lines */}
            <XAxis
              dataKey="date"
              ticks={xTicks}
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: '#D1D5DB' }}
              axisLine={false}
              tickLine={false}
              dy={4}
              height={22}
            />

            {/* Tooltip disabled visually — mouse tracking still works */}
            <Tooltip cursor={false} content={() => null} isAnimationActive={false} />

            {/* Main area line */}
            <Area
              type="monotone"
              dataKey="rate"
              stroke={ACCENT}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />

            {/* Cursor line — follows mouse AND touch via activeIndex */}
            {activePoint && (
              <ReferenceLine
                x={activePoint.date}
                stroke={ACCENT}
                strokeWidth={1}
                strokeOpacity={0.35}
              />
            )}

            {/* Active scrubbing dot */}
            {activePoint && (
              <ReferenceDot
                x={activePoint.date}
                y={activePoint.rate}
                r={5}
                fill={ACCENT}
                stroke="white"
                strokeWidth={2}
              />
            )}

            {/* Current price dot (when not scrubbing) */}
            {!activePoint && lastPoint && (
              <ReferenceDot
                x={lastPoint.date}
                y={lastPoint.rate}
                r={5}
                fill={ACCENT}
                stroke="white"
                strokeWidth={2}
              />
            )}

            {/* Insight event dots */}
            {periodInsights.map(ins => {
              const dp = filteredData.find(d => d.date === ins.date)
              if (!dp) return null
              return (
                <ReferenceDot
                  key={ins.id}
                  x={ins.date}
                  y={dp.rate}
                  r={4.5}
                  fill="rgba(107,114,128,0.18)"
                  stroke="rgba(107,114,128,0.45)"
                  strokeWidth={1.5}
                />
              )
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer hint */}
      <div className="px-5 pb-4 pt-1">
        <p className="text-[11px] text-gray-300">
          드래그해서 과거 환율 탐색 · 회색 도트 클릭 시 이슈 확인
        </p>
      </div>
    </div>
  )
}
