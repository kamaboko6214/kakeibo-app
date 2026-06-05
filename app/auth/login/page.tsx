'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else alert('確認メールを送信しました！')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-2 text-[#334155]">
          {isSignUp ? 'アカウント作成' : 'ログイン'}
        </h1>
        <p className="text-center text-sm text-gray-400 mb-6">家計簿アプリ</p>

        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6EE7B7]"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6EE7B7]"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-500 text-white rounded-xl py-3 text-sm font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition"
          >
            {loading ? '処理中...' : isSignUp ? '登録する' : 'ログイン'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          {isSignUp ? 'すでにアカウントをお持ちの方は' : 'アカウントをお持ちでない方は'}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#6EE7B7] font-bold ml-1 cursor-pointer hover:underline"
          >
            {isSignUp ? 'ログイン' : '新規登録'}
          </button>
        </p>
      </div>
    </div>
  )
}