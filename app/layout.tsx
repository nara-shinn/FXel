import type { Metadata } from 'next'
import './globals.css'
import MixpanelProvider from '@/components/MixpanelProvider'

export const metadata: Metadata = {
  title: 'Fixel — 나만의 환율 타이밍',
  description: '환율 변동의 원인을 이해하고 나만의 타이밍을 잡는 환율 가이드',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        <MixpanelProvider>{children}</MixpanelProvider>
      </body>
    </html>
  )
}
