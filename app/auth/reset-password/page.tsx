'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
      setTimeout(() => router.push('/'), 1500)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-2 text-[#334155]">
          新しいパスワード
        </h1>
        <p className="text-center text-sm text-gray-400 mb-6">再設定するパスワードを入力してください</p>

        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}
        {done && (
          <p className="text-[#6EE7B7] text-sm mb-4 text-center font-bold">
            変更しました！移動します...
          </p>
        )}

        <div className="space-y-4">
          <input
            type="password"
            placeholder="新しいパスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6EE7B7]"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !password}
            className="w-full bg-green-500 text-white rounded-xl py-3 text-sm font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition"
          >
            {loading ? '処理中...' : '変更する'}
          </button>
        </div>
      </div>
    </div>
  )
}
