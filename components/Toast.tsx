'use client'

import { useEffect } from 'react'
import clsx from 'clsx'

interface Props {
  message: string | null
  onDismiss: () => void
}

export default function Toast({ message, onDismiss }: Props) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [message, onDismiss])

  if (!message) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-slide-down">
      <div className="bg-gray-900 text-white rounded-2xl px-4 py-3.5 shadow-2xl flex items-start gap-3">
        <span className="text-base shrink-0 mt-0.5">🔔</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white mb-0.5">[Fixel]</p>
          <p className="text-xs text-gray-300 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 text-gray-500 hover:text-gray-300 transition-colors mt-0.5"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
