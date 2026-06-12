'use client'

import { useState, useCallback } from 'react'
import Header from '@/components/Header'
import CurrentRateCard from '@/components/CurrentRateCard'
import ExchangeRateChart from '@/components/ExchangeRateChart'
import IssueSection from '@/components/IssueSection'
import AlertSettings from '@/components/AlertSettings'
import ExchangeRateCalculator from '@/components/ExchangeRateCalculator'
import Toast from '@/components/Toast'
import { getCurrencyRateData, getCurrencyCurrentRate, getCurrencyPrevRate } from '@/data/mockData'
import type { CurrencyCode } from '@/types'

export default function HomePage() {
  const [currency, setCurrency] = useState<CurrencyCode>('USD')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [openIssueId, setOpenIssueId] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const rateData = getCurrencyRateData(currency)
  const activePoint = activeIndex !== null ? rateData[activeIndex] : null

  const currentRate = getCurrencyCurrentRate(currency)
  const prevRate = getCurrencyPrevRate(currency)
  const isUp = currentRate >= prevRate
  const trendColor = '#1475F5'

  const handleAlertTriggered = useCallback((msg: string) => {
    setToast(msg)
  }, [])

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      <Header />
      <Toast message={toast} onDismiss={() => setToast(null)} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Top row: Rate card + chart */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <CurrentRateCard
              currency={currency}
              onCurrencyChange={setCurrency}
              activeRate={activePoint?.rate ?? null}
              activeDate={activePoint?.date ?? null}
              trendColor={trendColor}
              isUp={isUp}
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
              activeIndex={activeIndex}
              openIssueId={openIssueId}
              onChipClick={(id) => setOpenIssueId(id)}
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
            <ExchangeRateCalculator />
          </div>
        </div>

      </main>

      <footer className="text-center py-8 text-xs text-gray-400">
        Fixel · 환율 정보는 실제와 다를 수 있어요 · Mock 데이터 기반
      </footer>
    </div>
  )
}
