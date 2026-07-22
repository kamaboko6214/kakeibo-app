'use client'

import Link from 'next/link'

const user = {
  user1: { name: 'なつき', avatar: '🐰' },
  user2: { name: 'ゆうた', avatar: '🐻' },
  together: '2年3ヶ月',
  recordDays: 142,
  totalSpent: 86000,
  streak: 12,
}

const menuItems = [
  { icon: '🏷', label: 'カテゴリ', value: '10件' },
  { icon: '💰', label: '予算', value: '¥150,000 / 月' },
  { icon: '📊', label: '月次レポート', value: '' },
  { icon: '📥', label: 'データの書き出し', value: 'CSV' },
]

const appSettings = [
  { icon: '🔔', label: '通知', value: 'ON' },
  { icon: '🎨', label: 'テーマ', value: 'ミント' },
]

export default function SettingsPage() {
  const handleCopy = () => {
    navigator.clipboard.writeText('kakei.app/invite/nT8kY2pq')
    alert('コピーしました！')
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="max-w-[390px] mx-auto px-4 pt-12">

        <h1 className="text-2xl font-bold text-[#334155] mb-6">設定</h1>

        {/* プロフィールカード */}
        <div className="bg-[#FB7185] rounded-2xl p-5 text-white mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex">
              <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-2xl">
                {user.user1.avatar}
              </div>
              <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-2xl -ml-2">
                {user.user2.avatar}
              </div>
            </div>
            <div>
              <p className="font-bold text-lg">{user.user1.name} & {user.user2.name}</p>
              <p className="text-sm opacity-80">{user.together} 一緒に節約中 🌱</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold">{user.recordDays}日</p>
              <p className="text-xs opacity-70">記録日数</p>
            </div>
            <div>
              <p className="text-xl font-bold">¥{(user.totalSpent / 10000).toFixed(1)}万</p>
              <p className="text-xs opacity-70">合計支出</p>
            </div>
            <div>
              <p className="text-xl font-bold">{user.streak}日 🔥</p>
              <p className="text-xs opacity-70">連続記録</p>
            </div>
          </div>
        </div>

        {/* パートナー招待 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
              💌
            </div>
            <div>
              <p className="font-bold text-sm text-[#334155]">パートナーを招待</p>
              <p className="text-xs text-gray-400">リンクを共有してね</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-400">
              kakei.app/invite/nT8kY2pq
            </div>
            <button
              onClick={handleCopy}
              className="bg-[#FB7185] text-white rounded-xl px-4 py-2 text-sm font-bold"
            >
              コピー
            </button>
          </div>
        </div>

        {/* 家計簿の管理 */}
        <p className="text-xs text-gray-400 mb-2 px-1">家計簿の管理</p>
        <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
          {menuItems.map((item, i) => {
            const content = (
              <>
                <span>{item.icon}</span>
                <span className="flex-1 text-sm text-[#334155]">{item.label}</span>
                <span className="text-sm text-gray-400">{item.value}</span>
                <span className="text-gray-300">›</span>
              </>
            )
            const className = `w-full flex items-center gap-3 px-4 py-4 text-left ${
              i !== menuItems.length - 1 ? 'border-b border-gray-50' : ''
            }`
            if (item.label === '予算') {
              return (
                <Link key={item.label} href="/settings/budget" className={className}>
                  {content}
                </Link>
              )
            }
            return (
              <button key={item.label} className={className}>
                {content}
              </button>
            )
          })}
        </div>

        {/* アプリ設定 */}
        <p className="text-xs text-gray-400 mb-2 px-1">アプリ設定</p>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {appSettings.map((item, i) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-4 text-left ${
                i !== appSettings.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <span>{item.icon}</span>
              <span className="flex-1 text-sm text-[#334155]">{item.label}</span>
              <span className="text-sm text-gray-400">{item.value}</span>
              <span className="text-gray-300">›</span>
            </button>
          ))}
        </div>

      </div>
    </main>
  )
}