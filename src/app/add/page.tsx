"use client"
import { useState } from 'react'
import DislikeSlider from '@/components/DislikeSlider'
import { supabase } from '@/lib/supabaseClient'
import AuthGuard from '@/components/AuthGuard'
import Card from '@/components/ui/Card'
import { useRouter } from 'next/navigation'

export default function AddPage() {
  const router = useRouter()
  const [action, setAction] = useState('')
  const [reason, setReason] = useState('')
  const [dislike, setDislike] = useState(50)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const disabled = action.trim().length === 0 || saving

  async function save() {
    setSaving(true)
    setMessage(null)
    try {
      const { data: userData, error: uerr } = await supabase.auth.getUser()
      if (uerr) throw uerr
      const uid = userData.user?.id
      if (!uid) throw new Error('ログイン状態を確認できませんでした')
      const { error } = await supabase.from('tasks').insert({ user_id: uid, action, reason: reason || null, dislike_level: dislike })
      if (error) throw error
      setAction(''); setReason(''); setDislike(50)
      setMessage('保存しました')
      router.replace('/')
    } catch (e: any) {
      setMessage(e.message ?? '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthGuard>
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">タスク追加</h1>
      <Card>
      <form className="space-y-4">
        <label className="block text-sm">やること（必須）
          <input value={action} onChange={e=>setAction(e.target.value)} maxLength={120} className="input mt-1" />
        </label>
        <label className="block text-sm">やりたくない理由（任意）
          <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={4} className="textarea mt-1" />
        </label>
        <div className="space-y-2">
          <label className="block text-sm">やりたくない度</label>
          <DislikeSlider value={dislike} onChange={setDislike} size="lg" glow="strong" stripes durationMs={800} />
        </div>
        <div className="flex gap-3">
          <button type="button" disabled={disabled} onClick={save} className="btn-primary disabled:opacity-50">
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
        {message && <p className="text-xs text-neutral-300">{message}</p>}
      </form>
      </Card>
    </section>
    </AuthGuard>
  )
}
