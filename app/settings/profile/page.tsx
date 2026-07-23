'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const AVATAR_PRESETS = ['🐰', '🐻', '🐶', '🐱', '🦊', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸']

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🐰')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUserId(user.id)

      const { data } = await supabase
        .from('profiles')
        .select('name, avatar')
        .eq('id', user.id)
        .single()

      if (data) {
        setName(data.name ?? '')
        setAvatar(data.avatar ?? '🐰')
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ name, avatar })
      .eq('id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] pb-24">
        <div className="max-w-[390px] mx-auto px-4 pt-12">
          <p className="text-center text-gray-300 py-12">読み込み中...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="max-w-[390px] mx-auto px-4 pt-12">

        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400"
          >
            ‹
          </button>
          <h1 className="text-xl font-bold text-[#334155]">プロフィール編集</h1>
        </div>

        {/* プレビュー */}
        <div className="bg-[#FB7185] rounded-2xl p-6 text-white mb-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center text-4xl mb-3">
            {avatar}
          </div>
          <p className="font-bold text-lg">{name || '名無し'}</p>
        </div>

        {/* 名前入力 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <p className="text-xs text-gray-400 mb-2">名前</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="名前を入力"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#FB7185]"
          />
        </div>

        {/* アバター選択 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <p className="text-xs text-gray-400 mb-3">アイコン</p>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_PRESETS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setAvatar(emoji)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                  avatar === emoji
                    ? 'bg-[#FB7185]/20 ring-2 ring-[#FB7185]'
                    : 'bg-gray-50'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#6EE7B7] text-white font-bold py-3 rounded-2xl border border-[#6EE7B7] hover:bg-[#5cd0a8] transition-colors duration-200 disabled:opacity-60"
        >
          {saving ? '保存中...' : '保存'}
        </button>
        {saved && (
          <p className="text-center text-sm text-[#6EE7B7] font-bold mt-3">
            保存しました！
          </p>
        )}

      </div>
    </main>
  )
}
