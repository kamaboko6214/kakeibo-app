import type { Metadata } from 'next'
import './globals.css'
import BottomNav from './components/BottomNav'

export const metadata: Metadata = {
  title: '家計簿アプリ',
  description: 'カップルで使う共有家計簿',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        {children}
        <BottomNav />
      </body>
    </html>
  )
}