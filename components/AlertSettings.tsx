'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCurrencyCurrentRate, getAlertPresets, getCurrencyRateData, currencies } from '@/data/mockData'
import type { Alert, CurrencyCode } from '@/types'
import clsx from 'clsx'

interface Props {
  onAlertTriggered: (msg: string) => void
}

const STORAGE_KEY = 'fixel_alerts'

function loadAlerts(): Alert[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveAlerts(alerts: Alert[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts)) } catch {}
}

export default function AlertSettings({ onAlertTriggered }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showPresets, setShowPresets] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [customLower, setCustomLower] = useState('')
  const [customUpper, setCustomUpper] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD')

  // Hydrate from localStorage
  useEffect(() => {
    const saved = loadAlerts()
    setAlerts(saved.length > 0 ? saved : [])
  }, [])

  // Persist on change
  useEffect(() => {
    saveAlerts(alerts)
  }, [alerts])

  // Check alert conditions
  useEffect(() => {
    if (alerts.length === 0) return
    alerts.forEach(alert => {
      if (!alert.active) return
      const rate = getCurrencyCurrentRate(alert.currency as CurrencyCode)
      if (rate >= alert.lowerBound && rate <= alert.upperBound) {
        onAlertTriggered(
          `원하던 환율에 거의 다 왔어요! ${alert.currency}/KRW ${rate.toLocaleString('ko-KR')}원`
        )
      }
    })
  }, [alerts])

  const currentRate = getCurrencyCurrentRate(selectedCurrency)
  const currencyData = getCurrencyRateData(selectedCurrency)
  const presets = getAlertPresets(currencyData)

  const updateAlerts = useCallback((fn: (prev: Alert[]) => Alert[]) => {
    setAlerts(fn)
  }, [])

  const toggleAlert = (id: string) =>
    updateAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))

  const removeAlert = (id: string) =>
    updateAlerts(prev => prev.filter(a => a.id !== id))

  const addPresetAlert = (preset: typeof presets[number]) => {
    const alert: Alert = {
      id: `alert-${Date.now()}`,
      currency: selectedCurrency,
      label: preset.name,
      preset: preset.id,
      lowerBound: preset.lowerBound,
      upperBound: preset.upperBound,
      active: true,
    }
    updateAlerts(prev => [...prev, alert])
    setShowPresets(false)
    setShowCustom(false)
  }

  const addCustomAlert = () => {
    const lower = parseFloat(customLower)
    const upper = parseFloat(customUpper)
    if (!lower || !upper || lower >= upper) return
    const alert: Alert = {
      id: `alert-${Date.now()}`,
      currency: selectedCurrency,
      label: `직접 설정`,
      preset: 'custom',
      lowerBound: lower,
      upperBound: upper,
      active: true,
    }
    updateAlerts(prev => [...prev, alert])
    setCustomLower('')
    setCustomUpper('')
    setShowCustom(false)
    setShowPresets(false)
  }

  const startEdit = (alert: Alert) => {
    setEditingId(alert.id)
    setCustomLower(String(alert.lowerBound))
    setCustomUpper(String(alert.upperBound))
  }

  const saveEdit = (id: string) => {
    const lower = parseFloat(customLower)
    const upper = parseFloat(customUpper)
    if (!lower || !upper || lower >= upper) return
    updateAlerts(prev => prev.map(a => a.id === id ? { ...a, lowerBound: lower, upperBound: upper } : a))
    setEditingId(null)
    setCustomLower('')
    setCustomUpper('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setCustomLower('')
    setCustomUpper('')
  }

  const isInRange = (alert: Alert) => {
    const rate = getCurrencyCurrentRate(alert.currency as CurrencyCode)
    return rate >= alert.lowerBound && rate <= alert.upperBound
  }

  const isNear = (alert: Alert) => {
    const rate = getCurrencyCurrentRate(alert.currency as CurrencyCode)
    const margin = (alert.upperBound - alert.lowerBound) * 0.2
    return rate >= alert.lowerBound - margin && rate <= alert.upperBound + margin
  }

  const cfg = currencies.find(c => c.code === selectedCurrency)!
  const fmtRate = (n: number) => cfg.decimals === 0
    ? n.toLocaleString('ko-KR')
    : n.toLocaleString('ko-KR', { minimumFractionDigits: cfg.decimals, maximumFractionDigits: cfg.decimals })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">구간 알림</h2>
            <p className="text-xs text-gray-400 mt-0.5">원하는 환율 도달 시 알려드려요</p>
          </div>
          <button
            onClick={() => { setShowPresets(v => !v); setShowCustom(false); setEditingId(null) }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span className="text-base leading-none">+</span> 추가
          </button>
        </div>
      </div>

      {/* Add presets panel */}
      {showPresets && (
        <div className="px-5 py-4 bg-blue-50 border-b border-blue-100 space-y-2 animate-slide-up">
          {/* Currency selector */}
          <div className="flex gap-1 mb-3">
            <p className="text-xs font-semibold text-gray-600 mr-2 self-center">통화:</p>
            {currencies.map(c => (
              <button
                key={c.code}
                onClick={() => setSelectedCurrency(c.code)}
                className={clsx(
                  'text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all duration-150',
                  selectedCurrency === c.code
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                )}
              >
                {c.code}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 mb-1">
            현재 {selectedCurrency}/KRW <span className="font-semibold text-gray-700">{fmtRate(currentRate)}원</span>
          </p>

          {presets.map(preset => (
            <button
              key={preset.id}
              onClick={() => addPresetAlert(preset)}
              className="w-full text-left px-4 py-3.5 rounded-xl border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-150 group"
            >
              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">{preset.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{preset.description}</p>
            </button>
          ))}

          <button
            onClick={() => setShowCustom(v => !v)}
            className="w-full text-left px-4 py-3 rounded-xl border border-dashed border-gray-300 bg-white hover:border-blue-400 transition-all text-sm text-gray-500 hover:text-blue-600"
          >
            직접 구간 설정하기
          </button>

          {showCustom && (
            <div className="space-y-2 pt-1 animate-slide-up">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1">하한 ({selectedCurrency} 기준)</label>
                  <input
                    type="number" value={customLower} onChange={e => setCustomLower(e.target.value)}
                    placeholder={`예: ${fmtRate(currentRate * 0.95)}`}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1">상한</label>
                  <input
                    type="number" value={customUpper} onChange={e => setCustomUpper(e.target.value)}
                    placeholder={`예: ${fmtRate(currentRate * 1.05)}`}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />
                </div>
              </div>
              {customLower && customUpper && parseFloat(customLower) >= parseFloat(customUpper) && (
                <p className="text-xs text-red-500">하한은 상한보다 낮아야 해요</p>
              )}
              <button
                onClick={addCustomAlert}
                className="w-full bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                알림 설정 완료
              </button>
            </div>
          )}
        </div>
      )}

      {/* Alert list */}
      <div className="px-5 py-3 space-y-2">
        {alerts.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-5">
            아직 설정한 알림이 없어요. <br />+ 추가를 눌러 구간을 설정해보세요.
          </p>
        )}

        {alerts.map(alert => {
          const inRange = isInRange(alert)
          const near = isNear(alert)
          const alertCfg = currencies.find(c => c.code === alert.currency)!
          const alertFmt = (n: number) => alertCfg.decimals === 0
            ? n.toLocaleString('ko-KR')
            : n.toLocaleString('ko-KR', { minimumFractionDigits: alertCfg.decimals, maximumFractionDigits: alertCfg.decimals })
          const isEditing = editingId === alert.id

          return (
            <div
              key={alert.id}
              className={clsx(
                'rounded-xl border transition-all duration-200',
                !alert.active && 'opacity-50',
                inRange && alert.active ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'
              )}
            >
              {isEditing ? (
                <div className="p-3 space-y-2 animate-slide-up">
                  <p className="text-xs font-semibold text-gray-600">알림 구간 수정</p>
                  <div className="flex gap-2">
                    <input
                      type="number" value={customLower} onChange={e => setCustomLower(e.target.value)}
                      placeholder="하한"
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                    <span className="self-center text-gray-400">~</span>
                    <input
                      type="number" value={customUpper} onChange={e => setCustomUpper(e.target.value)}
                      placeholder="상한"
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(alert.id)}
                      className="flex-1 bg-blue-600 text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      저장
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-gray-400">{alert.currency}</span>
                        <span className="text-xs font-semibold text-gray-700">{alert.label}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 tabular-nums">
                        {alertFmt(alert.lowerBound)} ~ {alertFmt(alert.upperBound)}원
                      </p>

                      {inRange && alert.active && (
                        <p className="text-xs font-semibold text-blue-600 mt-1.5 animate-fade-in">
                          🔔 지금 이 범위 안에 있어요!
                        </p>
                      )}
                      {!inRange && near && alert.active && (
                        <p className="text-xs font-semibold text-amber-600 mt-1.5 animate-fade-in">
                          📍 목표 구간에 가까워지고 있어요
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => startEdit(alert)}
                        className="text-xs text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => toggleAlert(alert.id)}
                        className={clsx(
                          'w-9 h-5 rounded-full transition-colors duration-200 relative',
                          alert.active ? 'bg-blue-600' : 'bg-gray-300'
                        )}
                      >
                        <span className={clsx(
                          'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200',
                          alert.active ? 'right-0.5' : 'left-0.5'
                        )} />
                      </button>
                      <button onClick={() => removeAlert(alert.id)} className="text-gray-300 hover:text-gray-500 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="px-5 pb-4">
        <p className="text-xs text-gray-400">
          알림 설정은 이 브라우저에 저장돼요
        </p>
      </div>
    </div>
  )
}
