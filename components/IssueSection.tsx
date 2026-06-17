'use client'

import { useState, useEffect } from 'react'
import { issues as issuesMock, usdRateData, mainTheme } from '@/data/mockData'
import type { Issue } from '@/types'
import clsx from 'clsx'

interface Props {
  issues?: Issue[]
  headline?: string | null
  activeIndex: number | null
  openIssueId: number | null
  onChipClick: (issueId: number) => void
  onClose: () => void
  trendColor?: string
}

const impactIcon = { up: '↑', down: '↓', volatile: '↕' }
const impactColor = { up: '#F04452', down: '#1475F5', volatile: '#F59E0B' }

type FeedbackType = 'helpful' | 'difficult'
type FeedbackStore = Record<number, { helpful: number; difficult: number; mine: FeedbackType | null }>

const SEED_COUNTS: Record<number, { helpful: number; difficult: number }> = {
  1: { helpful: 24, difficult: 3 }, 2: { helpful: 18, difficult: 7 },
  3: { helpful: 31, difficult: 2 }, 4: { helpful: 15, difficult: 9 },
  5: { helpful: 22, difficult: 4 }, 6: { helpful: 28, difficult: 1 },
  7: { helpful: 35, difficult: 5 }, 8: { helpful: 12, difficult: 8 },
}

function loadFeedback(): FeedbackStore {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('fixel_feedback') || '{}') } catch { return {} }
}
function saveFeedback(store: FeedbackStore) {
  try { localStorage.setItem('fixel_feedback', JSON.stringify(store)) } catch {}
}

function IssueModal({ issue, onClose }: { issue: Issue; onClose: () => void }) {
  const [feedback, setFeedback] = useState<FeedbackStore>(() => loadFeedback())

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const seed = SEED_COUNTS[issue.id] ?? { helpful: 0, difficult: 0 }
  const stored = feedback[issue.id] ?? { helpful: seed.helpful, difficult: seed.difficult, mine: null }

  const handleFeedback = (type: FeedbackType) => {
    setFeedback(prev => {
      const cur = prev[issue.id] ?? { helpful: seed.helpful, difficult: seed.difficult, mine: null }
      let { helpful, difficult } = cur
      if (cur.mine === 'helpful') helpful--
      if (cur.mine === 'difficult') difficult--
      const nextMine = cur.mine === type ? null : type
      if (nextMine === 'helpful') helpful++
      if (nextMine === 'difficult') difficult++
      const next = { ...prev, [issue.id]: { helpful, difficult, mine: nextMine } }
      saveFeedback(next)
      return next
    })
  }

  const mine = stored.mine

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-2xl mx-auto">
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">

          {/* Handle + close */}
          <div className="sticky top-0 bg-white rounded-t-3xl pt-3 pb-2 px-5 flex items-center justify-between z-10 border-b border-gray-50">
            <div className="w-10 h-1 bg-gray-200 rounded-full absolute left-1/2 -translate-x-1/2 top-2.5" />
            <div className="mt-4" />
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center mt-3"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="px-5 pb-8 pt-4">
            {/* 칩 레이블 */}
            <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 mb-3">
              {issue.keyword}
            </span>

            {/* 모달 제목 */}
            <h2 className="text-[22px] font-bold text-gray-900 leading-snug tracking-[-0.5px] mb-5">
              {issue.headline}
            </h2>

            {/* 3단 카드 */}
            <div className="space-y-3">
              {/* 왜 중요했나요 */}
              <div className="bg-gray-50 rounded-2xl px-4 py-3.5">
                <p className="text-[11px] font-bold text-gray-400 mb-1.5">왜 중요했나요?</p>
                <p className="text-[15px] text-gray-800 leading-snug font-medium">{issue.summary}</p>
              </div>

              {/* 원인 + 영향 가로 나열 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 rounded-2xl px-4 py-3.5">
                  <p className="text-[11px] font-bold text-blue-400 mb-1.5">원인</p>
                  <p className="text-[13px] text-blue-900 font-semibold leading-snug">{issue.cause}</p>
                </div>
                <div className="bg-orange-50 rounded-2xl px-4 py-3.5">
                  <p className="text-[11px] font-bold text-orange-400 mb-1.5">영향</p>
                  <p className="text-[13px] text-orange-900 font-semibold leading-snug">{issue.effect}</p>
                </div>
              </div>
            </div>

            {/* 피드백 */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 mb-2.5">이 설명이 도움이 됐나요?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFeedback('helpful')}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold border transition-all duration-150 flex items-center justify-center gap-1.5"
                  style={mine === 'helpful'
                    ? { backgroundColor: '#111827', color: 'white', borderColor: '#111827' }
                    : { backgroundColor: 'white', color: '#6B7280', borderColor: '#E5E7EB' }
                  }
                >
                  👍 이해됐어요
                  <span className={clsx('tabular-nums', mine === 'helpful' ? 'text-gray-400' : 'text-gray-300')}>
                    {stored.helpful}
                  </span>
                </button>
                <button
                  onClick={() => handleFeedback('difficult')}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold border transition-all duration-150 flex items-center justify-center gap-1.5"
                  style={mine === 'difficult'
                    ? { backgroundColor: '#F59E0B', color: 'white', borderColor: '#F59E0B' }
                    : { backgroundColor: 'white', color: '#6B7280', borderColor: '#E5E7EB' }
                  }
                >
                  🤔 어려워요
                  <span className={clsx('tabular-nums', mine === 'difficult' ? 'text-amber-200' : 'text-gray-300')}>
                    {stored.difficult}
                  </span>
                </button>
              </div>
              {mine && (
                <p className="text-xs text-center text-gray-400 mt-2.5">
                  {mine === 'helpful' ? '도움이 됐다니 다행이에요!' : '더 쉽게 설명할게요!'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function IssueSection({ issues: propIssues, headline, activeIndex, openIssueId, onChipClick, onClose, trendColor }: Props) {
  const issues = propIssues ?? issuesMock
  const displayHeadline = headline ?? mainTheme

  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayedIssue, setDisplayedIssue] = useState<Issue | null>(null)

  const chartPoint = activeIndex !== null ? usdRateData[activeIndex] : usdRateData[usdRateData.length - 1]
  const activeIssueId = chartPoint?.issueId ?? null

  useEffect(() => {
    const target = activeIssueId ? issues.find(i => i.id === activeIssueId) ?? null : null
    if (target?.id !== displayedIssue?.id) {
      setIsTransitioning(true)
      const t = setTimeout(() => { setDisplayedIssue(target); setIsTransitioning(false) }, 120)
      return () => clearTimeout(t)
    }
  }, [activeIssueId])

  const openIssue = openIssueId ? issues.find(i => i.id === openIssueId) ?? null : null
  const chipActiveColor = trendColor ?? '#1475F5'

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-2">
          <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">
            {activeIndex !== null ? '차트 선택 시점의 이슈' : '오늘의 환율 맥락'}
          </p>
          <p className={clsx(
            'text-[17px] font-bold text-gray-900 leading-snug tracking-[-0.3px] transition-opacity duration-150',
            isTransitioning ? 'opacity-0' : 'opacity-100'
          )}>
            {displayedIssue ? `${displayedIssue.keyword} 영향으로 변동` : displayHeadline}
          </p>
        </div>

        {/* 칩 목록 */}
        <div className="px-5 pt-3 pb-4 flex flex-wrap gap-2">
          {issues.map(issue => {
            const isActive = issue.id === activeIssueId
            return (
              <button
                key={issue.id}
                onClick={() => onChipClick(issue.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                style={isActive
                  ? { backgroundColor: chipActiveColor, color: 'white', boxShadow: `0 0 0 2px ${chipActiveColor}40` }
                  : { backgroundColor: '#F3F4F6', color: '#4B5563' }
                }
              >
                <span style={{ color: isActive ? 'rgba(255,255,255,0.8)' : impactColor[issue.impact] }}>
                  {impactIcon[issue.impact]}
                </span>
                {issue.keyword}
              </button>
            )
          })}
        </div>

        <div className="px-5 pb-4 border-t border-gray-50 pt-3">
          <p className="text-[11px] text-gray-400">칩을 탭하면 환율이 움직인 이유를 알 수 있어요</p>
        </div>
      </div>

      {openIssue && <IssueModal issue={openIssue} onClose={onClose} />}
    </>
  )
}
