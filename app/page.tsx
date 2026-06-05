export default function Home() {
  // モックデータ
  const mockData = {
    year: 2026,
    month: 5,
    totalBudget: 150000,
    totalExpense: 76900,
    user1: { name: 'なつき', avatar: '🐰', amount: 17180 },
    user2: { name: 'ゆうた', avatar: '🐻', amount: 13700 },
    categories: [
      { name: '光熱費', icon: '💡', amount: 18200, color: '#FCD34D' },
      { name: '食費', icon: '🍱', amount: 14440, color: '#FB7185' },
      { name: '娯楽', icon: '🎬', amount: 14000, color: '#FB7185' },
      { name: '外食', icon: '🍽', amount: 11900, color: '#FCD34D' },
      { name: '美容', icon: '💄', amount: 6200, color: '#FB7185' },
    ],
    recentExpenses: [
      { date: '5月26日', icon: '🍱', name: 'スーパー', category: '食費', amount: 2480 },
      { date: '5月26日', icon: '🍽', name: '記念日ディナー', category: '外食', amount: 3800 },
      { date: '5月25日', icon: '🚃', name: 'Suicaチャージ', category: '交通', amount: 1320 },
      { date: '5月25日', icon: '🎬', name: '映画 2人分', category: '娯楽', amount: 4400 },
      { date: '5月24日', icon: '🍱', name: 'コンビニ', category: '食費', amount: 1860 },
    ],
  }

  const remaining = mockData.totalBudget - mockData.totalExpense
  const percentage = Math.round((mockData.totalExpense / mockData.totalBudget) * 100)
  const today = new Date()
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const remainingDays = lastDay - today.getDate()

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="max-w-[390px] mx-auto px-4 pt-12">

        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-400">{mockData.year}年 {mockData.month}月</p>
            <h1 className="text-2xl font-bold text-[#334155]">おかえり！</h1>
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-lg">
              {mockData.user1.avatar}
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-lg">
              {mockData.user2.avatar}
            </div>
          </div>
        </div>

        {/* 今月の支出カード */}
        <div className="bg-[#6EE7B7] rounded-2xl p-5 mb-4 text-white">
          <p className="text-sm opacity-80 mb-1">今月の支出</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-bold">¥{mockData.totalExpense.toLocaleString()}</span>
            <span className="text-sm opacity-80 mb-1">/ ¥{mockData.totalBudget.toLocaleString()}</span>
          </div>
          <div className="bg-white/30 rounded-full h-2 mb-3">
            <div
              className="bg-white rounded-full h-2"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <p className="opacity-70">残り</p>
              <p className="font-bold">¥{remaining.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="opacity-70">達成率</p>
              <p className="font-bold">{percentage}%</p>
            </div>
            <div className="text-right">
              <p className="opacity-70">残り日数</p>
              <p className="font-bold">{remainingDays}日</p>
            </div>
          </div>
        </div>

        {/* ユーザー別支出 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[mockData.user1, mockData.user2].map((user) => (
            <div key={user.name} className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-gray-400 mb-1">{user.avatar} {user.name}</p>
              <p className="text-xl font-bold text-[#334155]">¥{user.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* カテゴリ別 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[#334155]">カテゴリ別</h2>
            <button className="text-sm text-[#6EE7B7] font-bold">予算をみる →</button>
          </div>
          <div className="space-y-3">
            {mockData.categories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="text-xl w-8">{cat.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#334155]">{cat.name}</span>
                    <span className="font-bold text-[#334155]">¥{cat.amount.toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-1.5">
                    <div
                      className="rounded-full h-1.5"
                      style={{
                        width: `${Math.round((cat.amount / mockData.totalExpense) * 100)}%`,
                        backgroundColor: cat.color
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近の支出 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[#334155]">最近の支出</h2>
            <button className="text-sm text-[#6EE7B7] font-bold">すべて →</button>
          </div>
          <div className="space-y-3">
            {mockData.recentExpenses.map((expense, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl w-8">{expense.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#334155]">{expense.name}</p>
                  <p className="text-xs text-gray-400">{expense.category} · {expense.date}</p>
                </div>
                <p className="font-bold text-[#334155]">¥{expense.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}