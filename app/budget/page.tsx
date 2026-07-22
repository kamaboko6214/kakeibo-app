"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import Link from "next/link"

// const budgetData = [
//   { name: 'プレゼント', icon: '🎁', spent: 5500, budget: 5000 },
//   { name: '光熱費', icon: '💡', spent: 18200, budget: 18000 },
//   { name: '娯楽', icon: '🎬', spent: 14000, budget: 15000 },
//   { name: '美容', icon: '💄', spent: 6200, budget: 8000 },
//   { name: '外食', icon: '🍽', spent: 11900, budget: 20000 },
//   { name: '食費', icon: '🍱', spent: 14440, budget: 25000 },
//   { name: '医療', icon: '🩺', spent: 2200, budget: 5000 },
//   { name: '日用品', icon: '🧴', spent: 3800, budget: 8000 },
// ]

const totalBudget = 150000
const totalSpent = 76900
const HOUSEHOLD_ID = "00000000-0000-0000-0000-000000000001"
export default function BudgetPage() {
  const [month, setMonth] = useState(5)
  const supabase = createClient()
  const [budgetData, setBudgetData] = useState<
    { name: string; icon: string; spent: number; budget: number }[]
  >([])
  useEffect(() => {
    const fetchAll = async () => {
      const startDate = `${new Date().getFullYear()}-${String(month).padStart(2, "0")}-01`
      const lastDay = new Date(new Date().getFullYear(), month, 0).getDate()
      const endDate = `${new Date().getFullYear()}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
      const yearMonth = `${new Date().getFullYear()}-${String(month).padStart(2, "0")}`

      const { data: budgets } = await supabase
        .from("budgets")
        .select("amount, category_id, categories(id, name)")
        .eq("household_id", HOUSEHOLD_ID)
        .eq("year_month", yearMonth)

      const { data: defaults } = await supabase
        .from("budget_defaults")
        .select("amount, category_id, categories(id, name)")
        .eq("household_id", HOUSEHOLD_ID)

      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount, category_id, categories(id, name)")
        .eq("household_id", HOUSEHOLD_ID)
        .gte("date", startDate)
        .lte("date", endDate)

      const monthlyMap = new Map(budgets?.map((b: any) => [b.category_id, b]))
      const enriched = (defaults ?? []).map((d: any) => {
        const b = monthlyMap.get(d.category_id) ?? d
        return {
          name: b.categories?.name ?? "その他",
          icon: b.categories?.icon ?? "📦",
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
  }, [month])

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
              onClick={() => setMonth((m) => m - 1)}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400"
            >
              ‹
            </button>
            <h1 className="font-bold text-[#334155]">2026年 {month}月</h1>
            <button
              onClick={() => setMonth((m) => m + 1)}
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
            <Link href={`/budget/edit/${month}`}>
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
