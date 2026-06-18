'use client'

import { useState, useEffect } from 'react'
import { issues as issuesMock, usdRateData, mainTheme } from '@/data/mockData'
import type { Issue } from '@/types'
import clsx from 'clsx'
import IssueModal from '@/components/IssueModal'

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
