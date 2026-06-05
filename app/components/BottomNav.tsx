'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', icon: '🏠', label: 'ホーム' },
  { href: '/expenses', icon: '📋', label: '支出' },
  { href: '/budget', icon: '💰', label: '予算' },
  { href: '/settings', icon: '⚙️', label: '設定' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="max-w-[390px] mx-auto flex justify-around items-center py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className={`text-xs font-bold ${isActive ? 'text-[#6EE7B7]' : 'text-gray-300'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}