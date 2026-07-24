'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { CATEGORY_ICON, CATEGORY_COLOR, HOUSEHOLD_ID } from '@/lib/constants'
import type { User, Category, Expense } from '@/lib/types'
import Link from 'next/link'

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const supabase = createClient()
  const [users, setUsers] = useState<User[]>([])
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({})
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])
  const [totalExpense, setTotalExpense] = useState<number>(0)
  const [totalBudget, setTotalBudget] = useState<number>(0)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [myprofile, setMyProfile] = useState<User | null>(null)

  // 最近の支出
  useEffect(() => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    const fetchMyProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar')
        .eq('id', user.id)
        .single()
      if (data) {
        setMyProfile(data)
      }
    }

    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar')
        .eq('household_id', HOUSEHOLD_ID)
        console.log(data)
      if (data) {
        const enriched = data.map((user: { id: string, name: string, avatar: string }) => ({
          id: user.id,
          name: user.name ?? '名無し',
          avatar: user.avatar ?? '👤',
        }))
        setUsers(enriched)
      }
    }

    // カテゴリ一覧
    const fetchCategories = async() => {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .eq('household_id', HOUSEHOLD_ID)
        if (data) {
          const enriched = data.map((cat: { id: string, name: string }) => ({
            ...cat,
            amount: categoryTotals[cat.name] ?? 0,
            icon: CATEGORY_ICON[cat.name] ?? '📦',
            color: CATEGORY_COLOR[cat.name] ?? '#94A3B8',
          }))
          setCategories(enriched)
        }
    }

    // 最近の支出
    const fetchRecentExpenses = async() => {
      const { data } = await supabase
        .from('expenses')
        .select('date, memo, amount, categories(name)')
        .eq('household_id', HOUSEHOLD_ID)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .limit(5)
        if (data) {
          const enriched = data.map((e: { date: string, memo: string, amount: number, categories: { name: string }[] | null }) => ({
            ...e,
            icon: CATEGORY_ICON[e.categories?.[0]?.name ?? ''] ?? '📦',
            categoryName: e.categories?.[0]?.name ?? 'その他',
        }))
        setRecentExpenses(enriched)
      }
    }

    // 支出合計
    const fetchTotalExpense = async () => {
      const { data } = await supabase
        .from('expenses')
        .select('amount')
        .eq('household_id', HOUSEHOLD_ID)
        .gte('date', startDate)
        .lte('date', endDate)

      if (data) {
        const total = data.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)
        setTotalExpense(total)
      }
    }

    // 予算合計
    const fetchTotalBudget = async () => {
      const today = new Date()
      const yearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

      const { data } = await supabase
        .from('budgets')
        .select('amount')
        .eq('household_id', HOUSEHOLD_ID)
        .eq('year_month', yearMonth)

      if (data) {
        const total = data.reduce((sum: number, b: { amount: number }) => sum + b.amount, 0)
        setTotalBudget(total)
      }
    }

    fetchMyProfile()
    fetchUsers()
    fetchCategories()
    fetchTotalBudget()
    fetchTotalExpense()
    fetchRecentExpenses()
  }, [])

  const remaining = totalBudget - totalExpense
  const percentage = Math.round((totalExpense / totalBudget) * 100)
  const today = new Date()
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const remainingDays = lastDay - today.getDate()

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="max-w-[390px] mx-auto px-4 pt-12">

        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-400">{year}年 {month}月</p>
            <h1 className="text-2xl font-bold text-[#334155]">おかえり！</h1>
          </div>
          <div className="flex gap-2">
            {myprofile && (
              <Link href="/settings/profile">
              <div key={myprofile.id} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                {myprofile.avatar}
              </div>
              </Link>
            )}
          </div>
        </div>

        {/* 今月の支出カード */}
        <div className="bg-[#6EE7B7] rounded-2xl p-5 mb-4 text-white">
          <p className="text-sm opacity-80 mb-1">今月の支出</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-bold">¥{totalExpense.toLocaleString()}</span>
            <span className="text-sm opacity-80 mb-1">/ ¥{totalBudget.toLocaleString()}</span>
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
          {users.slice(0, 2).map((user) => (
            <div key={user.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-gray-400 mb-1">{user.avatar} {user.name}</p>
            </div>
          ))}
        </div>

        {/* カテゴリ別 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[#334155]">カテゴリ別</h2>
            <Link href="/budget/">
            <button className="text-sm text-[#6EE7B7] font-bold cursor-pointer hover:opacity-60 duration-200">予算をみる →</button>
            </Link>
          </div>
          <div className="space-y-3">
            {categories.map((cat) => (
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
                        width: `${Math.round((cat.amount / totalExpense) * 100)}%`,
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
            <Link href="/expenses/">
            <button className="text-sm text-[#6EE7B7] font-bold cursor-pointer hover:opacity-60 duration-200">すべて →</button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentExpenses.map((expense, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl w-8">{expense.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#334155]">{expense.memo}</p>
                  <p className="text-xs text-gray-400">{expense.categoryName} · {expense.date}</p>
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