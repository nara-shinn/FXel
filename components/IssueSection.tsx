'use client'

import { useState, useEffect } from 'react'
import { issues, usdRateData, mainTheme } from '@/data/mockData'
import type { Issue } from '@/types'
import clsx from 'clsx'

interface Props {
  activeIndex: number | null
  openIssueId: number | null
  onChipClick: (issueId: number) => void
  onClose: () => void
  trendColor?: string
}

const categoryColors: Record<Issue['category'], string> = {
  연준: 'bg-purple-100 text-purple-700',
  관세: 'bg-orange-100 text-orange-700',
  지정학: 'bg-red-100 text-red-700',
  경제지표: 'bg-blue-100 text-blue-700',
  정치: 'bg-teal-100 text-teal-700',
}

const impactIcon = { up: '↑', down: '↓', volatile: '↕' }
const impactColor = { up: '#F04452', down: '#1066FF', volatile: '#F59E0B' }
const impactLabel = { up: '환율 상승', down: '환율 하락', volatile: '등락 반복' }

type FeedbackType = 'helpful' | 'difficult'
type FeedbackStore = Record<number, { helpful: number; difficult: number; mine: FeedbackType | null }>

const SEED_COUNTS: Record<number, { helpful: number; difficult: number }> = {
  1: { helpful: 24, difficult: 3 },
  2: { helpful: 18, difficult: 7 },
  3: { helpful: 31, difficult: 2 },
  4: { helpful: 15, difficult: 9 },
  5: { helpful: 22, difficult: 4 },
  6: { helpful: 28, difficult: 1 },
  7: { helpful: 35, difficult: 5 },
  8: { helpful: 12, difficult: 8 },
}

function loadFeedback(): FeedbackStore {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('fixel_feedback')
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveFeedback(store: FeedbackStore) {
  try { localStorage.setItem('fixel_feedback', JSON.stringify(store)) } catch {}
}

function NewsBottomSheet({ issue, onClose }: { issue: Issue; onClose: () => void }) {
  const [flipped, setFlipped] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackStore>(() => loadFeedback())

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const seed = SEED_COUNTS[issue.id] ?? { helpful: 0, difficult: 0 }
  const stored = feedback[issue.id] ?? { helpful: seed.helpful, difficult: seed.difficult, mine: null }

  const handleFeedback = (type: FeedbackType) => {
    setFeedback(prev => {
      const current = prev[issue.id] ?? { helpful: seed.helpful, difficult: seed.difficult, mine: null }
      const prevMine = current.mine
      let helpful = current.helpful
      let difficult = current.difficult
      if (prevMine === 'helpful') helpful--
      if (prevMine === 'difficult') difficult--
      const nextMine = prevMine === type ? null : type
      if (nextMine === 'helpful') helpful++
      if (nextMine === 'difficult') difficult++
      const next = { ...prev, [issue.id]: { helpful, difficult, mine: nextMine } }
      saveFeedback(next)
      return next
    })
  }

  const mine = stored.mine
  const accentColor = impactColor[issue.impact]

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-2xl mx-auto animate-slide-up">
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto">

          {/* Handle + Close */}
          <div className="sticky top-0 bg-white rounded-t-3xl pt-3 pb-3 px-5 flex items-center justify-between z-10">
            <div className="w-10 h-1 bg-gray-200 rounded-full absolute left-1/2 -translate-x-1/2 top-2.5" />
            <div className="flex items-center gap-2 mt-3">
              <span className={clsx('text-[11px] font-bold px-2 py-0.5 rounded-full', categoryColors[issue.category])}>
                {issue.category}
              </span>
              <span className="text-[11px] font-semibold" style={{ color: accentColor }}>
                {impactIcon[issue.impact]} {impactLabel[issue.impact]}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors mt-3"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="px-5 pb-8">
            {/* ── HEADLINE FIRST (TDS 스타일) ── */}
            <h2 className="text-[22px] font-bold text-gray-900 leading-snug tracking-[-0.5px] mt-1 mb-3">
              {issue.headline}
            </h2>

            {/* Tag chips */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {issue.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="h-px bg-gray-100 mb-4" />

            {/* Flashcard */}
            <div className="relative">
              <button
                onClick={() => setFlipped(f => !f)}
                className="absolute top-3 right-3 z-10 text-[11px] font-bold px-3 py-1 rounded-full border transition-all duration-150"
                style={flipped
                  ? { backgroundColor: '#111827', color: 'white', borderColor: '#111827' }
                  : { backgroundColor: 'white', color: '#6B7280', borderColor: '#E5E7EB' }
                }
              >
                {flipped ? '← 요약' : '생각해볼 지점 →'}
              </button>

              {/* Front: 3줄 요약 */}
              <div className={clsx(
                'transition-all duration-300',
                flipped ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'
              )}>
                <div className="bg-gray-50 rounded-2xl p-4 pt-11 space-y-3">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 mb-1">Q. {issue.question}</p>
                    <p className="text-[13px] text-gray-800 leading-relaxed">{issue.summary}</p>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="space-y-2">
                    <div className="flex gap-2 text-xs leading-relaxed">
                      <span className="shrink-0 font-bold text-gray-400 w-7">원인</span>
                      <p className="text-gray-700">{issue.cause}</p>
                    </div>
                    <div className="flex gap-2 text-xs leading-relaxed">
                      <span className="shrink-0 font-bold text-gray-400 w-7">영향</span>
                      <p className="text-gray-700">{issue.effect}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back: 생각해볼 지점 */}
              <div className={clsx(
                'transition-all duration-300',
                !flipped ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'
              )}>
                <div className="bg-gray-900 rounded-2xl p-4 pt-11 min-h-[152px]">
                  <p className="text-[11px] font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                    <span>💡</span> Fixel이 던지는 생각해볼 지점
                  </p>
                  <ul className="space-y-3">
                    {issue.reflection.map((q, i) => (
                      <li key={i} className="flex gap-2 text-[13px] text-gray-200 leading-relaxed">
                        <span className="shrink-0 text-gray-500 font-bold">{i + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Source */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-[11px] text-gray-400">
                출처: {issue.source} · 8분 전
              </p>
              <a href={issue.newsUrl} className="text-[11px] font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-0.5 transition-colors">
                원문
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </a>
            </div>

            {/* Feedback */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 mb-2.5">이 요약이 도움이 됐나요?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFeedback('helpful')}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold border transition-all duration-150 flex items-center justify-center gap-1.5"
                  style={mine === 'helpful'
                    ? { backgroundColor: '#111827', color: 'white', borderColor: '#111827' }
                    : { backgroundColor: 'white', color: '#6B7280', borderColor: '#E5E7EB' }
                  }
                >
                  👍 도움됐어요
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
                  🤔 별로예요
                  <span className={clsx('tabular-nums', mine === 'difficult' ? 'text-amber-200' : 'text-gray-300')}>
                    {stored.difficult}
                  </span>
                </button>
              </div>
              {mine && (
                <p className="text-xs text-center text-gray-400 mt-2.5 animate-fade-in">
                  {mine === 'helpful' ? '소중한 피드백 감사해요! 더 좋은 요약으로 개선할게요.' : '더 쉽게 설명하도록 개선할게요!'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function IssueSection({ activeIndex, openIssueId, onChipClick, onClose, trendColor }: Props) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayedIssue, setDisplayedIssue] = useState<Issue | null>(null)

  const chartPoint = activeIndex !== null ? usdRateData[activeIndex] : usdRateData[usdRateData.length - 1]
  const activeIssueId = chartPoint?.issueId ?? null

  useEffect(() => {
    const target = activeIssueId ? issues.find(i => i.id === activeIssueId) ?? null : null
    if (target?.id !== displayedIssue?.id) {
      setIsTransitioning(true)
      const t = setTimeout(() => {
        setDisplayedIssue(target)
        setIsTransitioning(false)
      }, 120)
      return () => clearTimeout(t)
    }
  }, [activeIssueId])

  const openIssue = openIssueId ? issues.find(i => i.id === openIssueId) ?? null : null
  const chipActiveColor = trendColor ?? '#1066FF'

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">
            {activeIndex !== null ? '차트 선택 시점의 이슈' : '오늘의 환율 맥락'}
          </p>
          <p className={clsx(
            'text-[17px] font-bold text-gray-900 leading-snug tracking-[-0.3px] transition-opacity duration-150',
            isTransitioning ? 'opacity-0' : 'opacity-100'
          )}>
            {displayedIssue ? `${displayedIssue.keyword} 영향으로 변동` : mainTheme}
          </p>
        </div>

        {/* Keyword chips */}
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
          <p className="text-[11px] text-gray-400">탭하면 3줄 요약 · 생각해볼 지점을 확인해요</p>
        </div>
      </div>

      {openIssue && <NewsBottomSheet issue={openIssue} onClose={onClose} />}
    </>
  )
}
