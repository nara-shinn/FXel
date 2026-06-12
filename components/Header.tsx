'use client'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-tight">FX</span>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">Fixel</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">USD/KRW</span>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-gray-400">실시간</span>
        </div>
      </div>
    </header>
  )
}
