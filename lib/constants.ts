// カテゴリ定義
export const CATEGORIES = [
  { name: '食費',     icon: '🍱', color: '#FB7185' },
  { name: '外食',     icon: '🍽', color: '#FB7185' },
  { name: '日用品',   icon: '🧴', color: '#6EE7B7' },
  { name: '交通',     icon: '🚃', color: '#6EE7B7' },
  { name: '娯楽',     icon: '⛳', color: '#FB7185' },
  { name: '光熱費',   icon: '💡', color: '#FCD34D' },
  { name: '美容',     icon: '💄', color: '#FB7185' },
  { name: '医療',     icon: '🩺', color: '#6EE7B7' },
  { name: 'プレゼント', icon: '🎁', color: '#FB7185' },
  { name: 'その他',   icon: '📦', color: '#94A3B8' },
] as const

// カテゴリ名 → アイコンのマップ
export const CATEGORY_ICON: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.name, c.icon])
)

// カテゴリ名 → カラーのマップ
export const CATEGORY_COLOR: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.name, c.color])
)

// テスト用household ID
export const HOUSEHOLD_ID = '00000000-0000-0000-0000-000000000001'