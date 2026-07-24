"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { CATEGORY_ICON } from "@/lib/constants"

const HOUSEHOLD_ID = "00000000-0000-0000-0000-000000000001"

export default function BudgetEditPage(params: { year: string; month: string }) {
  const { year, month } = useParams() as { year: string; month: string }
  const supabase = createClient()
  const [budgetData, setBudgetData] = useState<
    { name: string; icon: string; category_id: string; budget: number }[]
  >([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      const yearMonth = `${year}-${String(month).padStart(2, "0")}`

      const { data: budgets } = await supabase
        .from("budgets")
        .select("amount, category_id, categories(id, name)")
        .eq("household_id", HOUSEHOLD_ID)
        .eq("year_month", yearMonth)

      const { data: defaults } = await supabase
        .from("budget_defaults")
        .select("amount, category_id, categories(id, name)")
        .eq("household_id", HOUSEHOLD_ID)

      const monthlyMap = new Map(budgets?.map((b: any) => [b.category_id, b]))
      const enriched = (defaults ?? []).map((d: any) => {
        const b = monthlyMap.get(d.category_id) ?? d
        return {
          name: b.categories?.name ?? "その他",
          icon: CATEGORY_ICON[b.categories?.name] ?? "📦",
          category_id: b.category_id,
          budget: b.amount ?? 0,
        }
      })

      setBudgetData(enriched)
    }
    fetchAll()

  }, [year, month])

  const handleChange = (category_id: string, value: number) => {
    setBudgetData((prev) =>
      prev.map((b) =>
        b.category_id === category_id ? { ...b, budget: value } : b,
      ),
    )
  }

  const handleSave = async () => {
    const yearMonth = `${year}-${String(month).padStart(2, "0")}`
    await Promise.all(
      budgetData.map((b) =>
        supabase.from("budgets").upsert(
          {
            household_id: HOUSEHOLD_ID,
            category_id: b.category_id,
            year_month: yearMonth,
            amount: b.budget,
          },
          { onConflict: "household_id,category_id,year_month" },
        ),
      ),
    )
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="max-w-[390px] mx-auto">
        <div className="px-4 pt-12 pb-4">
          <h1 className="font-bold text-[#334155] mb-6">
            {year}年 {month}月の予算編集
          </h1>

          <div className="space-y-3">
            {budgetData.map((item) => (
              <div
                key={item.category_id}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
              >
                <span className="text-xl">{item.icon}</span>
                <p className="flex-1 font-bold text-sm text-[#334155]">
                  {item.name}
                </p>
                <input
                  type="number"
                  value={item.budget === 0 ? "" : item.budget}
                  onChange={(e) =>
                    handleChange(item.category_id, Number(e.target.value) || 0)
                  }
                  className="w-24 text-right border rounded-lg px-2 py-1 text-sm"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="w-full mt-6 bg-[#6EE7B7] text-white font-bold py-3 rounded-2xl"
          >
            保存
          </button>
          {saved && (
            <p className="text-center text-sm text-[#6EE7B7] font-bold mt-3">
              保存しました！
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
