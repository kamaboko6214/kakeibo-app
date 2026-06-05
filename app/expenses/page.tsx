'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const categoryIcons: Record<string, string> = {
  '食費': '🍱', '外食': '🍽', '日用品': '🧴', '交通': '🚃',
  '娯楽': '🎬', '光熱費': '💡', '美容': '💄', '医療': '🩺',
  'プレゼント': '🎁', 'その他': '📦',
}

const HOUSEHOLD_ID = '00000000-0000-0000-0000-000000000001'

type Expense = {
  id: string
  amount: number
  date: string
  memo: string | null
  categories: { name: string } | null
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [selectedCategory, setSelectedCategory] = useState('すべて')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const supabase = createClient()

  useEffect(() => {
    const fetchExpenses = async () => {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`

      const { data } = await supabase
        .from('expenses')
        .select('id, amount, date, memo, categories(name)')
        .eq('household_id', HOUSEHOLD_ID)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })

      if (data) setExpenses(data)
    }
    fetchExpenses()
  }, [year, month])

  const handleMonthChange = (direction: number) => {
    const newMonth = month + direction
    if (newMonth < 1) { setMonth(12); setYear(y => y - 1) }
    else if (newMonth > 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(newMonth)
  }

  const categoryNames = ['すべて', ...Array.from(new Set(expenses.map(e => e.categories?.name ?? 'その他')))]

  const filtered = selectedCategory === 'すべて'
    ? expenses
    : expenses.filter(e => e.categories?.name === selectedCategory)

  const total = filtered.reduce((sum, e) => sum + e.amount, 0)

  // 日付でグループ化
  const grouped = filtered.reduce((acc, expense) => {
    const key = expense.date
    if (!acc[key]) acc[key] = []
    acc[key].push(expense)
    return acc
  }, {} as Record<string, Expense[]>)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="max-w-[390px] mx-auto">

        {/* ヘッダー */}
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => handleMonthChange(-1)}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400"
            >
              ‹
            </button>
            <h1 className="font-bold text-[#334155]">{year}年 {month}月</h1>
            <button
              onClick={() => handleMonthChange(1)}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400"
            >
              ›
            </button>
          </div>
          <p className="text-center text-sm text-gray-400">
            合計 <span className="text-xl font-bold text-[#334155]">¥{total.toLocaleString()}</span>
          </p>
        </div>

        {/* カテゴリフィルタ */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-4">
          {categoryNames.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#6EE7B7] text-white'
                  : 'bg-white text-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 支出リスト */}
        <div className="px-4 space-y-4">
          {Object.keys(grouped).length === 0 && (
            <p className="text-center text-gray-300 py-12">支出がありません</p>
          )}
          {Object.entries(grouped).map(([date, dayExpenses]) => (
            <div key={date}>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-bold text-gray-400">{formatDate(date)}</p>
                <p className="text-sm text-gray-400">
                  ¥{dayExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {dayExpenses.map((expense, i) => {
                  const catName = expense.categories?.name ?? 'その他'
                  return (
                    <div
                      key={expense.id}
                      className={`flex items-center gap-3 px-4 py-3 ${
                        i !== dayExpenses.length - 1 ? 'border-b border-gray-50' : ''
                      }`}
                    >
                      <span className="text-xl w-8">{categoryIcons[catName] ?? '📦'}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#334155]">{expense.memo ?? catName}</p>
                        <p className="text-xs text-gray-400">{catName}</p>
                      </div>
                      <p className="font-bold text-[#334155]">¥{expense.amount.toLocaleString()}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* FABボタン */}
        <Link href="/expenses/new">
          <button className="fixed bottom-20 right-6 w-14 h-14 bg-[#FB7185] rounded-full shadow-lg flex items-center justify-center text-white text-2xl cursor-pointer hover:opacity-90 transition z-50">
            ＋
          </button>
        </Link>

      </div>
    </main>
  )
}