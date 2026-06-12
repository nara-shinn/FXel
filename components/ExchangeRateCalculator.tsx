'use client'

import { useState, useCallback } from 'react'

const CALC_CURRENCIES = [
  { code: 'KRW', country: '대한민국', flag: '🇰🇷', unit: '원', decimals: 0, rateToKRW: 1 },
  { code: 'USD', country: '미국', flag: '🇺🇸', unit: '달러', decimals: 2, rateToKRW: 1395 },
  { code: 'JPY', country: '일본', flag: '🇯🇵', unit: '엔', decimals: 0, rateToKRW: 9.22 },
  { code: 'EUR', country: '유로존', flag: '🇪🇺', unit: '유로', decimals: 2, rateToKRW: 1455 },
  { code: 'CNY', country: '중국', flag: '🇨🇳', unit: '위안', decimals: 1, rateToKRW: 182 },
]

function getCfg(code: string) {
  return CALC_CURRENCIES.find(c => c.code === code)!
}

function formatNumber(value: number, code: string): string {
  const cfg = getCfg(code)
  if (cfg.decimals === 0) return value.toLocaleString('ko-KR', { maximumFractionDigits: 0 })
  return value.toLocaleString('ko-KR', { minimumFractionDigits: cfg.decimals, maximumFractionDigits: cfg.decimals })
}

function formatWithUnit(value: number, code: string): string {
  return `${formatNumber(value, code)} ${getCfg(code).unit}`
}

function CurrencyBox({
  code,
  value,
  isInput,
  onChange,
  onCurrencyChange,
}: {
  code: string
  value: string | number
  isInput: boolean
  onChange?: (v: string) => void
  onCurrencyChange: (code: string) => void
}) {
  const cfg = getCfg(code)
  const numericVal = typeof value === 'string' ? (parseFloat(value) || 0) : value

  return (
    <div className="border border-[#E5EBEE] rounded-[6px] overflow-hidden">
      {/* Currency header — clickable to change */}
      <div className="relative bg-[#F7F9FA] border-b border-[#E5EBEE] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[18px] leading-none">{cfg.flag}</span>
          <span className="text-[13px] font-semibold text-[#222222]">{cfg.country}</span>
          <span className="text-[11px] text-[#878787] font-medium">{cfg.code}</span>
        </div>
        {/* Chevron */}
        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
          width="12" height="12" viewBox="0 0 12 12" fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="#B3B9C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* Transparent select overlay */}
        <select
          value={code}
          onChange={e => onCurrencyChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          aria-label="통화 선택"
        >
          {CALC_CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.country} ({c.code})</option>
          ))}
        </select>
      </div>

      {/* Amount area */}
      <div className="px-4 pt-3 pb-2.5 flex flex-col items-end gap-0.5 bg-white">
        {isInput ? (
          <input
            type="number"
            value={value as string}
            onChange={e => onChange?.(e.target.value)}
            placeholder="0"
            min="0"
            className="text-[22px] font-bold text-[#222222] text-right w-full outline-none bg-transparent tabular-nums"
            style={{ caretColor: '#1066FF' }}
          />
        ) : (
          <span className="text-[22px] font-bold text-[#222222] tabular-nums">
            {numericVal > 0 ? formatNumber(numericVal, code) : '—'}
          </span>
        )}
        <span className="text-[12px] text-[#878787] tabular-nums">
          {numericVal > 0 ? formatWithUnit(numericVal, code) : `0 ${cfg.unit}`}
        </span>
      </div>
    </div>
  )
}

export default function ExchangeRateCalculator() {
  const [fromCurrency, setFromCurrency] = useState('KRW')
  const [toCurrency, setToCurrency] = useState('USD')
  const [fromAmount, setFromAmount] = useState('1000')
  const [copied, setCopied] = useState(false)

  const fromCfg = getCfg(fromCurrency)
  const toCfg = getCfg(toCurrency)
  const numericFrom = parseFloat(fromAmount) || 0
  const result = numericFrom * (fromCfg.rateToKRW / toCfg.rateToKRW)

  const swap = () => {
    const prev = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(prev)
    setFromAmount(result > 0 ? formatNumber(result, toCurrency).replace(/,/g, '') : '0')
  }

  const copy = useCallback(() => {
    const text = `${formatWithUnit(result, toCurrency)}`
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [result, toCurrency])

  const exchangeRateLabel = (() => {
    if (fromCurrency === toCurrency) return null
    const rate = fromCfg.rateToKRW / toCfg.rateToKRW
    const formatted = rate < 0.01
      ? rate.toFixed(6)
      : rate < 10
      ? rate.toFixed(4)
      : rate.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
    return `1 ${fromCurrency} = ${formatted} ${toCurrency}`
  })()

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Section header — Figma 1:167 */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-1.5">
        <h2
          className="font-bold text-[#222222] tracking-[-0.3px]"
          style={{ fontSize: '20px', lineHeight: '24px' }}
        >
          환율계산기
        </h2>
        <button
          className="text-[#B3B9C4] hover:text-[#878787] transition-colors ml-0.5"
          aria-label="환율계산기 안내"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 7.2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="8" cy="5" r="0.7" fill="currentColor" />
          </svg>
        </button>
      </div>

      <div className="px-5 pb-5">
        {/* From box — Figma 1:176 */}
        <CurrencyBox
          code={fromCurrency}
          value={fromAmount}
          isInput={true}
          onChange={setFromAmount}
          onCurrencyChange={setFromCurrency}
        />

        {/* Separator with swap — Figma 더블바 */}
        <div className="relative flex items-center justify-center py-3.5">
          <div
            className="h-[10px] w-[25px]"
            style={{
              borderTop: '3px solid #B3B9C4',
              borderBottom: '3px solid #B3B9C4',
            }}
          />
          <button
            onClick={swap}
            className="absolute right-0 w-8 h-8 rounded-full border border-[#E5EBEE] bg-white flex items-center justify-center transition-all hover:bg-[#F7F9FA] hover:border-[#B3B9C4]"
            aria-label="통화 교체"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M3 8l4 4 4-4M3 6l4-4 4 4" stroke="#B3B9C4" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* To box */}
        <CurrencyBox
          code={toCurrency}
          value={result}
          isInput={false}
          onCurrencyChange={setToCurrency}
        />

        {/* Rate info + copy */}
        <div className="flex items-center justify-between mt-3.5 pt-0.5">
          <p className="text-[12px] text-[#878787]">
            {exchangeRateLabel && (
              <>
                <span className="font-semibold text-[#222222]">{exchangeRateLabel.split('=')[0]}=</span>
                {exchangeRateLabel.split('=')[1]}
              </>
            )}
            {exchangeRateLabel && (
              <>
                <span className="mx-1.5 text-[#E5EBEE]">·</span>
                <span>1분 전</span>
              </>
            )}
          </p>
          <button
            onClick={copy}
            className="text-[12px] font-bold text-[#1066FF] hover:opacity-70 transition-opacity flex items-center gap-1"
          >
            {copied ? (
              <span className="text-emerald-500">✓ 복사됨</span>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M1 8V2a1 1 0 0 1 1-1h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                결과 복사
              </>
            )}
          </button>
        </div>
      </div>

      <div className="px-5 pb-4 -mt-1">
        <p className="text-[11px] text-[#B3B9C4]">Mock 환율 데이터 · 실제 거래 환율과 다를 수 있어요</p>
      </div>
    </div>
  )
}
