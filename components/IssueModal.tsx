'use client'

import { useState, useEffect, useRef } from 'react'
import type { Issue } from '@/types'

const SEED_COUNTS: Record<number, { helpful: number; difficult: number }> = {
  1: { helpful: 24, difficult: 3 }, 2: { helpful: 18, difficult: 7 },
  3: { helpful: 31, difficult: 2 }, 4: { helpful: 15, difficult: 9 },
  5: { helpful: 22, difficult: 4 }, 6: { helpful: 28, difficult: 1 },
  7: { helpful: 35, difficult: 5 }, 8: { helpful: 12, difficult: 8 },
}

type FeedbackType = 'helpful' | 'difficult'
type FeedbackStore = Record<number, { helpful: number; difficult: number; mine: FeedbackType | null }>

function loadFeedback(): FeedbackStore {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('fixel_feedback') || '{}') } catch { return {} }
}
function saveFeedback(store: FeedbackStore) {
  try { localStorage.setItem('fixel_feedback', JSON.stringify(store)) } catch {}
}

const IMPACT_COLOR = { up: '#F04452', down: '#1475F5', volatile: '#F59E0B' } as const
const IMPACT_BG    = { up: '#FFF0F1', down: '#EEF4FF', volatile: '#FFFBEB' } as const

function CloseButton({ dark = false, onClick }: { dark?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
      style={{ backgroundColor: dark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }}
    >
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <path
          d="M1 1l10 10M11 1L1 11"
          stroke={dark ? 'rgba(255,255,255,0.6)' : '#6B7280'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}

export default function IssueModal({ issue, onClose }: { issue: Issue; onClose: () => void }) {
  const [showBack, setShowBack]     = useState(false)
  const [flipPhase, setFlipPhase]   = useState<'idle' | 'out' | 'in'>('idle')
  const [insightVisible, setInsightVisible] = useState(false)
  const [feedback, setFeedback]     = useState<FeedbackStore>(() => loadFeedback())
  const flipTargetRef               = useRef(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    setShowBack(false)
    setFlipPhase('idle')
    setInsightVisible(false)
  }, [issue.id])

  const flip = (toBack: boolean) => {
    if (flipPhase !== 'idle') return
    flipTargetRef.current = toBack
    setFlipPhase('out')
  }

  const handleAnimationEnd = () => {
    if (flipPhase === 'out') {
      setShowBack(flipTargetRef.current)
      setFlipPhase('in')
    } else if (flipPhase === 'in') {
      setFlipPhase('idle')
    }
  }

  const handleFeedback = (type: FeedbackType) => {
    setFeedback(prev => {
      const seed = SEED_COUNTS[issue.id] ?? { helpful: 0, difficult: 0 }
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

  const seed = SEED_COUNTS[issue.id] ?? { helpful: 0, difficult: 0 }
  const stored = feedback[issue.id] ?? { helpful: seed.helpful, difficult: seed.difficult, mine: null }
  const iColor = IMPACT_COLOR[issue.impact]
  const iBg    = IMPACT_BG[issue.impact]

  const flipClass = flipPhase === 'out' ? 'flip-out' : flipPhase === 'in' ? 'flip-in' : ''

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
        onClick={onClose}
      />

      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-2xl mx-auto animate-slide-up">
        {/* 단일 카드 — flip-out/flip-in 애니메이션으로 콘텐츠 교체 */}
        <div
          className={`rounded-t-3xl shadow-2xl flex flex-col ${flipClass}`}
          style={{
            height: '75vh',
            backgroundColor: showBack ? '#111827' : 'white',
          }}
          onAnimationEnd={handleAnimationEnd}
        >

          {showBack ? (
            /* ════════════ BACK ════════════ */
            <>
              <div
                className="flex-shrink-0 pt-3 px-5 pb-2"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="w-10 h-1 rounded-full mx-auto mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
                <div className="flex justify-end">
                  <CloseButton dark onClick={onClose} />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 flex flex-col">
                <span
                  className="text-[11px] font-bold uppercase tracking-widest mb-5"
                  style={{ color: 'rgba(255,255,255,0.28)' }}
                >
                  {issue.keyword}
                </span>

                <div className="flex-1">
                  <div
                    className="text-[54px] font-black leading-none -mt-1 mb-1 select-none"
                    style={{ color: '#1475F5', fontFamily: 'Georgia, serif' }}
                  >
                    &#8220;
                  </div>
                  <p
                    className="text-[20px] font-bold leading-snug tracking-[-0.3px] pr-2"
                    style={{ color: 'rgba(255,255,255,0.92)' }}
                  >
                    {issue.reflection[0]}
                  </p>

                  <div className="mt-8">
                    {!insightVisible ? (
                      <button
                        onClick={() => setInsightVisible(true)}
                        className="flex items-center gap-2 text-[13px] font-semibold transition-opacity hover:opacity-80"
                        style={{ color: 'rgba(255,255,255,0.38)' }}
                      >
                        <span className="text-sm">💡</span>
                        힌트 보기
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M6 1.5v9M2 7.5 6 11l4-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    ) : (
                      <div className="animate-fade-in">
                        <div className="h-px mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                        <p className="text-[15px] font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.62)' }}>
                          {issue.reflection[1]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 space-y-2.5">
                  {insightVisible && (
                    <div className="animate-fade-in space-y-2">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.22)' }}>
                        도움이 됐나요?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFeedback('helpful')}
                          className="flex-1 py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all"
                          style={stored.mine === 'helpful'
                            ? { backgroundColor: '#1475F5', color: 'white' }
                            : { backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.42)' }
                          }
                        >
                          👍 이해됐어요
                          <span className="tabular-nums" style={{ opacity: 0.55 }}>{stored.helpful}</span>
                        </button>
                        <button
                          onClick={() => handleFeedback('difficult')}
                          className="flex-1 py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all"
                          style={stored.mine === 'difficult'
                            ? { backgroundColor: '#F59E0B', color: 'white' }
                            : { backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.42)' }
                          }
                        >
                          🤔 어려워요
                          <span className="tabular-nums" style={{ opacity: 0.55 }}>{stored.difficult}</span>
                        </button>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => { setInsightVisible(false); flip(false) }}
                    className="w-full py-3.5 rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 10.5v-9M2 4.5 6 1l4 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    다시 뉴스 확인하기
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* ════════════ FRONT ════════════ */
            <>
              <div className="flex-shrink-0 pt-3 px-5 pb-2 border-b border-gray-50">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-2" />
                <div className="flex justify-end">
                  <CloseButton onClick={onClose} />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
                <div className="mb-6">
                  <span
                    className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full mb-3"
                    style={{ backgroundColor: iBg, color: iColor }}
                  >
                    {issue.keyword}
                  </span>
                  <h2 className="text-[21px] font-bold text-gray-900 leading-snug tracking-[-0.4px]">
                    {issue.headline}
                  </h2>
                </div>

                {/* Timeline */}
                <div className="relative">
                  <div
                    className="absolute z-0"
                    style={{
                      left: '10px', top: '22px', width: '1px', height: '120px',
                      background: 'linear-gradient(to bottom, #D1D5DB 0%, #E5E7EB 80%, transparent 100%)',
                    }}
                  />

                  {/* Node 1 */}
                  <div className="relative flex gap-3.5 pb-5 z-10">
                    <div className="flex-shrink-0">
                      <div className="w-[22px] h-[22px] rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-gray-200" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">배경 설명</p>
                      <div className="bg-gray-50 rounded-xl px-3.5 py-3 border border-gray-100">
                        <p className="text-[14px] text-gray-700 font-medium leading-relaxed">{issue.summary}</p>
                      </div>
                    </div>
                  </div>

                  {/* Node 2 */}
                  <div className="relative flex gap-3.5 pb-5 z-10">
                    <div className="flex-shrink-0">
                      <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center" style={{ backgroundColor: '#1475F5' }}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">무슨 일이 생겼나요?</p>
                      <div className="space-y-2.5">
                        <div className="flex items-start gap-2.5">
                          <span className="flex-shrink-0 w-[18px] h-[18px] rounded-full text-[9px] font-bold text-white flex items-center justify-center mt-[1px]" style={{ backgroundColor: '#1475F5' }}>1</span>
                          <p className="text-[14px] text-gray-800 font-medium leading-snug">{issue.cause}</p>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="flex-shrink-0 w-[18px] h-[18px] rounded-full text-[9px] font-bold text-white flex items-center justify-center mt-[1px]" style={{ backgroundColor: '#1475F5', opacity: 0.55 }}>2</span>
                          <p className="text-[14px] text-gray-800 font-medium leading-snug">{issue.effect}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Node 3 */}
                  <div className="relative flex gap-3.5 z-10">
                    <div className="flex-shrink-0">
                      <div className="w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center" style={{ borderColor: iColor, backgroundColor: iBg }}>
                        <div className="w-[7px] h-[7px] rotate-45" style={{ backgroundColor: iColor }} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">시장 영향</p>
                      <div className="flex flex-wrap gap-1.5">
                        {issue.tags.map((chip, i) => (
                          <span key={i} className="text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: iBg, color: iColor }}>
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sources */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">출처</p>
                  <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
                    <a
                      href={issue.newsUrl}
                      className="flex-shrink-0 rounded-xl px-3 py-2.5 bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors"
                      style={{ minWidth: '170px', maxWidth: '210px' }}
                    >
                      <p className="text-[11px] font-semibold text-gray-700 leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                        {issue.newsTitle}
                      </p>
                    </a>
                    {issue.source.split(',').map((src, i) => (
                      <div key={i} className="flex-shrink-0 rounded-xl px-3 py-2.5 bg-gray-50 border border-gray-100 flex items-center">
                        <p className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">{src.trim()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flip CTA */}
                <button
                  onClick={() => flip(true)}
                  className="mt-4 w-full py-3.5 rounded-2xl text-[13px] font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{ backgroundColor: '#111827' }}
                >
                  생각해볼 지점 보기
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1.5v9M2 7.5 6 11l4-3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  )
}
