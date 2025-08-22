export type Task = {
  id: string
  user_id: string
  action: string
  reason: string | null
  dislike_level: number
  created_at: string
  updated_at: string
  done: boolean
}
