"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { HOUSEHOLD_ID, CATEGORY_ICON } from "@/lib/constants"

export default function BudgetDefaultsPage() {
  const supabase = createClient()
  const [budgetData, setBudgetData] = useState<
    { category_id: string; name: string; icon: string; amount: number }[]
  >([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name")
        .eq("household_id", HOUSEHOLD_ID)

      const { data: defaults } = await supabase
        .from("budget_defaults")
        .select("category_id, amount")
        .eq("household_id", HOUSEHOLD_ID)

      const defaultsMap = new Map(
        defaults?.map((d) => [d.category_id, d.amount]) ?? [],
      )

      const merged = (categories ?? []).map((c: any) => ({
        category_id: c.id,
        name: c.name,
        icon: CATEGORY_ICON[c.name] ?? "📦",
        amount: defaultsMap.get(c.id) ?? 0,
      }))

      setBudgetData(merged)
    }
    fetchAll()
  }, [])

  const handleChange = (category_id: string, value: number) => {
    setBudgetData((prev) =>
      prev.map((b) =>
        b.category_id === category_id ? { ...b, amount: value } : b,
      ),
    )
  }

  const handleSave = async () => {
    await Promise.all(
      budgetData.map((b) =>
        supabase.from("budget_defaults").upsert(
          {
            household_id: HOUSEHOLD_ID,
            category_id: b.category_id,
            amount: b.amount,
          },
          { onConflict: "household_id,category_id" },
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
          <h1 className="font-bold text-[#334155] mb-6">基本予算の設定</h1>

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
                  value={item.amount === 0 ? "" : item.amount}
                  onChange={(e) =>
                    handleChange(item.category_id, Number(e.target.value) || 0)
                  }
                  className="w-24 text-right border border-gray-300 rounded-lg px-2 py-1 text-sm"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="w-full mt-6 bg-[#6EE7B7] text-white font-bold py-3 rounded-2xl border border-[#6EE7B7] hover:bg-[#5cd0a8] transition-colors duration-200"
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