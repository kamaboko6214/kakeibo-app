"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import Link from "next/link"
import { CATEGORY_ICON } from "@/lib/constants"

const totalSpent = 76900
const HOUSEHOLD_ID = "00000000-0000-0000-0000-000000000001"
export default function BudgetPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const supabase = createClient()
  const [totalBudget, setTotalBudget] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [budgetData, setBudgetData] = useState<
    { name: string; icon: string; spent: number; budget: number }[]
  >([])
  useEffect(() => {
    const fetchAll = async () => {
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
      const yearMonth = `${year}-${String(month).padStart(2, "0")}`

      // 予算データを取得
      const { data: budgets } = await supabase
        .from("budgets")
        .select("amount, category_id, categories(id, name)")
        .eq("household_id", HOUSEHOLD_ID)
        .eq("year_month", yearMonth)


  
      // デフォルト予算データを取得
      const { data: defaults } = await supabase
        .from("budget_defaults")
        .select("amount, category_id, categories(id, name)")
        .eq("household_id", HOUSEHOLD_ID)

      const totalBudget = defaults?.reduce((sum: number, b: any) => sum + (b.amount ?? 0), 0) ?? 0
      setTotalBudget(totalBudget)

      // 今月の支出データを取得
      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount, category_id, categories(id, name)")
        .eq("household_id", HOUSEHOLD_ID)
        .gte("date", startDate)
        .lte("date", endDate)

      const totalSpent = expenses?.reduce((sum: number, e: any) => sum + (e.amount ?? 0), 0) ?? 0
      setTotalSpent(totalSpent)
      const monthlyMap = new Map(budgets?.map((b: any) => [b.category_id, b]))
      const enriched = (defaults ?? []).map((d: any) => {
        const b = monthlyMap.get(d.category_id) ?? d
        return {
          name: b.categories?.name ?? "その他",
          icon: CATEGORY_ICON[b.categories?.name] ?? "📦",
          budget: b.amount ?? 0,
          spent: 0,
          category_id: b.category_id,
        }
      })

      const totals: Record<string, number> = {}
      if (expenses) {
        expenses.forEach((e: any) => {
          const id = e.category_id
          totals[id] = (totals[id] ?? 0) + e.amount
        })
      }
      const merged = enriched.map((b: any) => ({
        name: b.name,
        icon: b.icon,
        spent: totals[b.category_id] ?? 0,
        budget: b.budget,
      }))
      
      setBudgetData(merged)
    }
    fetchAll()
  }, [year, month])

  const getStatus = (spent: number, budget: number) => {
    const ratio = spent / budget
    if (spent > budget) return "over"
    if (ratio >= 0.9) return "warning"
    return "ok"
  }

  const getStatusLabel = (spent: number, budget: number) => {
    const status = getStatus(spent, budget)
    const diff = Math.abs(budget - spent)
    if (status === "over")
      return { text: `¥${diff.toLocaleString()} 超過`, color: "text-red-400" }
    if (status === "warning")
      return { text: `もうすぐ予算に到達`, color: "text-orange-400" }
    return { text: `残り ¥${diff.toLocaleString()}`, color: "text-gray-400" }
  }
  // 日付変更のハンドラー
  const handleMonthChange = (direction: number) => {
    const newMonth = month + direction
    if (newMonth < 1) { setMonth(12); setYear(y => y - 1) }
    else if (newMonth > 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(newMonth)
  }

  const getBarColor = (spent: number, budget: number) => {
    const status = getStatus(spent, budget)
    if (status === "over") return "bg-red-400"
    if (status === "warning") return "bg-orange-400"
    return "bg-[#6EE7B7]"
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="max-w-[390px] mx-auto">
        {/* ヘッダー */}
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center justify-between mb-6">
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

          {/* 全体予算カード */}
          <div className="bg-[#6EE7B7] rounded-2xl p-5 text-white mb-6">
            <p className="text-sm opacity-80 mb-1">使った / 予算</p>
            <p className="text-2xl font-bold mb-3">
              ¥{totalSpent.toLocaleString()} / ¥{totalBudget.toLocaleString()}
            </p>
            <div className="bg-white/30 rounded-full h-2 mb-3">
              <div
                className="bg-white rounded-full h-2"
                style={{
                  width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="text-sm">
              🌱 順調！残り ¥{(totalBudget - totalSpent).toLocaleString()}
            </p>
          </div>
        </div>

        {/* カテゴリ別予算 */}
        <div className="px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[#334155]">カテゴリ別の予算</h2>
            <Link href={`/budget/edit/${year}/${month}`}>
              <button className="text-sm text-[#6EE7B7] font-bold curso">編集</button>
            </Link>
          </div>
          <div className="space-y-3">
            {budgetData.map((item) => {
              const status = getStatus(item.spent, item.budget)
              const label = getStatusLabel(item.spent, item.budget)
              const percentage = Math.min((item.spent / item.budget) * 100, 100)

              return (
                <div
                  key={item.name}
                  className={`bg-white rounded-2xl p-4 shadow-sm ${
                    status === "over" ? "border border-red-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-sm text-[#334155]">
                          {item.name}
                        </p>
                        <p className="text-sm text-[#334155]">
                          ¥{item.spent.toLocaleString()} / ¥
                          {item.budget.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 mb-1">
                    <div
                      className={`rounded-full h-2 transition-all ${getBarColor(item.spent, item.budget)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs ${label.color}`}>{label.text}</p>
                    <p className="text-xs text-gray-400">
                      {Math.round(percentage)}% 使用
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
