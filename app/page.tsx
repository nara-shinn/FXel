'use client'

import { useState, useCallback, useEffect } from 'react'
import { track } from '@/lib/mixpanel'
import Header from '@/components/Header'
import CurrentRateCard from '@/components/CurrentRateCard'
import ExchangeRateChart from '@/components/ExchangeRateChart'
import IssueSection from '@/components/IssueSection'
import AlertSettings from '@/components/AlertSettings'
import ExchangeRateCalculator from '@/components/ExchangeRateCalculator'
import Toast from '@/components/Toast'
import {
  getCurrencyRateData,
  getCurrencyCurrentRate,
  getCurrencyPrevRate,
  issues as mockIssues,
} from '@/data/mockData'
import type { CurrencyCode, Issue } from '@/types'

interface LiveRates {
  current: Record<CurrencyCode, number>
  prev: Record<CurrencyCode, number> | null
  date: string
}

export default function HomePage() {
  const [currency, setCurrency] = useState<CurrencyCode>('USD')

  const handleCurrencyChange = useCallback((c: CurrencyCode) => {
    setCurrency(c)
    track('Currency Tab Click', { currency: c })
  }, [])

  const handleIssueChipClick = useCallback((id: number) => {
    setOpenIssueId(id)
    track('Issue Chip Click', { issueId: id })
  }, [])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [openIssueId, setOpenIssueId] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // ── 실시간 환율 ──
  const [liveRates, setLiveRates] = useState<LiveRates | null>(null)
  const [ratesLoading, setRatesLoading] = useState(true)

  // ── 실시간 뉴스 이슈 ──
  const [liveIssues, setLiveIssues] = useState<Issue[] | null>(null)
  const [liveHeadline, setLiveHeadline] = useState<string | null>(null)

  // ── 환율 fetch ──
  useEffect(() => {
    setRatesLoading(true)
    fetch('/api/rates')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: LiveRates) => { setLiveRates(data); setRatesLoading(false) })
      .catch(err => { console.warn('Live rates unavailable:', err); setRatesLoading(false) })
  }, [])

  // ── 뉴스 이슈 fetch (선택적 — ANTHROPIC_API_KEY 필요) ──
  useEffect(() => {
    fetch('/api/news')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        if (data.issues?.length) setLiveIssues(data.issues)
        if (data.headline) setLiveHeadline(data.headline)
      })
      .catch(() => { /* API 키 없으면 mock 사용 */ })
  }, [])

  // 현재 환율 (실시간 우선, 폴백 mock)
  const currentRate = liveRates?.current[currency] ?? getCurrencyCurrentRate(currency)
  const prevRate = liveRates?.prev?.[currency] ?? getCurrencyPrevRate(currency)
  const isUp = currentRate >= prevRate
  const trendColor = '#1475F5'

  // 차트 active point
  const rateData = getCurrencyRateData(currency) // chart가 내부에서 실API 사용하므로 placeholder
  const activePoint = activeIndex !== null ? rateData[activeIndex] : null

  const handleAlertTriggered = useCallback((msg: string) => {
    setToast(msg)
  }, [])

  const displayIssues = liveIssues ?? mockIssues

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      <Header />
      <Toast message={toast} onDismiss={() => setToast(null)} />

      {/* 실시간 연동 상태 배너 */}
      {!ratesLoading && liveRates && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-3">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            실시간 환율 연동 중 · Frankfurter (ECB) ·{' '}
            {new Date(liveRates.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 기준
            {liveIssues && (
              <span className="ml-2 text-blue-500">· 뉴스 AI 요약 적용됨</span>
            )}
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-4">

        {/* Top row: Rate card + chart */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <CurrentRateCard
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              activeRate={activePoint?.rate ?? null}
              activeDate={activePoint?.date ?? null}
              trendColor={trendColor}
              isUp={isUp}
              currentRate={currentRate}
              prevRate={prevRate}
              lastUpdated={liveRates?.date}
            />
          </div>
          <div className="lg:col-span-3">
            <ExchangeRateChart
              currency={currency}
              activeIndex={activeIndex}
              onActiveIndexChange={setActiveIndex}
              onInsightClick={(issueId) => setOpenIssueId(issueId)}
              trendColor={trendColor}
            />
          </div>
        </div>

        {/* Bottom row: Issues + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <IssueSection
              issues={displayIssues}
              headline={liveHeadline}
              activeIndex={activeIndex}
              openIssueId={openIssueId}
              onChipClick={handleIssueChipClick}
              onClose={() => setOpenIssueId(null)}
              trendColor={trendColor}
            />
          </div>
          <div className="lg:col-span-2">
            <AlertSettings onAlertTriggered={handleAlertTriggered} />
          </div>
        </div>

        {/* Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <ExchangeRateCalculator liveRates={liveRates?.current ?? null} />
          </div>
        </div>

      </main>

      <footer className="text-center py-8 text-xs text-gray-400">
        Fixel · 환율 데이터: Frankfurter (ECB) · 뉴스: Yahoo Finance RSS
      </footer>
    </div>
  )
}
