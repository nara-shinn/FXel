'use client'

import { useEffect } from 'react'
import { initMixpanel, track } from '@/lib/mixpanel'

export default function MixpanelProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initMixpanel()
    track('Page View', { page: 'home' })
  }, [])

  return <>{children}</>
}
