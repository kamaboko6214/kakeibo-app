export type User = {
  id: string
  name: string
  avatar: string
}

export type Category = {
  id: string
  name: string
  icon: string
  color: string
}

export type Expense = {
  date: string
  memo: string | null
  amount: number
  categories: { name: string }[] | null
  icon: string
  categoryName: string
}
