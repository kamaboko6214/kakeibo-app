'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const categoryIcons: Record<string, string> = {
  '食費': '🍱',
  '外食': '🍽',
  '日用品': '🧴',
  '交通': '🚃',
  '娯楽': '🎬',
  '光熱費': '💡',
  '美容': '💄',
  '医療': '🩺',
  'プレゼント': '🎁',
  'その他': '📦',
}

const quickAmounts = [500, 1000, 2000, 3000, 5000]
const HOUSEHOLD_ID = '00000000-0000-0000-0000-000000000001'

export default function NewExpensePage() {
  const [amount, setAmount] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<{ id: string, name: string } | null>(null)
  const [memo, setMemo] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // カテゴリをSupabaseから取得
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .eq('household_id', HOUSEHOLD_ID)
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  const handleNumber = (num: string) => {
    if (num === 'del') {
      setAmount(prev => prev.slice(0, -1))
    } else {
      setAmount(prev => prev + num)
    }
  }

  const handleSave = async () => {
    if (!amount || !selectedCategory) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('expenses').insert({
      household_id: HOUSEHOLD_ID,
      user_id: user.id,
      category_id: selectedCategory.id,
      amount: Number(amount),
      date,
      memo: memo || null,
    })

    if (error) {
      alert('保存に失敗しました')
      console.error(error)
    } else {
      router.push('/expenses')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[390px] mx-auto">

        {/* ヘッダー */}
        <div className="flex justify-between items-center px-4 pt-12 pb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400"
          >
            ✕
          </button>
          <h1 className="font-bold text-[#334155]">支出を記録</h1>
          <button
            onClick={handleSave}
            disabled={!amount || !selectedCategory || loading}
            className="bg-[#6EE7B7] text-white rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-30"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </div>

        {/* 金額表示 */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-400 mb-2">金額</p>
          <p className="text-5xl font-bold text-[#334155]">
            ¥{amount ? Number(amount).toLocaleString() : '0'}
          </p>
        </div>

        {/* カテゴリ選択 */}
        <div className="px-4 mb-4">
          <p className="text-sm text-gray-400 mb-3">カテゴリ</p>
          <div className="grid grid-cols-5 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                  selectedCategory?.id === cat.id
                    ? 'border-[#6EE7B7] bg-[#6EE7B7]/10'
                    : 'border-gray-100 bg-white'
                }`}
              >
                <span className="text-xl">{categoryIcons[cat.name] ?? '📦'}</span>
                <span className="text-xs text-[#334155]">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 日付・メモ */}
        <div className="px-4 mb-4 space-y-3">
          <div className="bg-white rounded-xl p-4 flex items-center gap-3">
            <span>📅</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 outline-none text-sm text-[#334155]"
            />
          </div>
          <div className="bg-white rounded-xl p-4 flex items-center gap-3">
            <span>📝</span>
            <input
              type="text"
              placeholder="メモを追加（例：スーパー）"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="flex-1 outline-none text-sm text-[#334155] placeholder-gray-300"
            />
          </div>
        </div>

        {/* クイック金額 */}
        <div className="px-4 mb-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickAmounts.map((val) => (
              <button
                key={val}
                onClick={() => setAmount(String(val))}
                className="flex-shrink-0 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-[#334155]"
              >
                ¥{val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* テンキー */}
        <div className="px-4 grid grid-cols-3 gap-2">
          {['1','2','3','4','5','6','7','8','9','00','0','del'].map((key) => (
            <button
              key={key}
              onClick={() => handleNumber(key)}
              className="bg-white rounded-2xl py-4 text-xl font-bold text-[#334155] shadow-sm active:bg-gray-50"
            >
              {key === 'del' ? '⌫' : key}
            </button>
          ))}
        </div>

      </div>
    </main>
  )
}