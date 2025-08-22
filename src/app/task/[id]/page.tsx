"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Task } from '@/lib/types'
import AuthGuard from '@/components/AuthGuard'
import DislikeSlider from '@/components/DislikeSlider'
import Card from '@/components/ui/Card'

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const id = params.id
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single()
      if (!mounted) return
      if (error) { setTask(null) } else { setTask(data as Task) }
      setLoading(false)
    }
    load()
  }, [id])

  async function save() {
    if (!task) return
    setMsg(null)
    const { error } = await supabase.from('tasks')
      .update({ action: task.action, reason: task.reason, dislike_level: task.dislike_level })
      .eq('id', id)
    setMsg(error ? error.message : '更新しました')
  }

  async function remove() {
    setMsg(null)
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    setMsg(error ? error.message : '削除しました。戻るか再読み込みしてください。')
  }

  return (
    <AuthGuard>
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">タスク詳細</h1>
        {loading ? (
          <div className="text-neutral-400">読み込み中…</div>
        ) : !task ? (
          <div className="card"><div className="p-4">見つかりませんでした</div></div>
        ) : (
          <Card>
            <div className="space-y-3 text-sm">
              <label className="block">やること
                <input value={task.action} onChange={e=>setTask({ ...(task as Task), action: e.target.value })} className="input mt-1" />
              </label>
              <label className="block">理由
                <textarea value={task.reason ?? ''} onChange={e=>setTask({ ...(task as Task), reason: e.target.value })} rows={4} className="textarea mt-1" />
              </label>
              <label className="block mb-2">やりたくない度</label>
              <DislikeSlider value={task.dislike_level} onChange={(v)=>setTask({ ...(task as Task), dislike_level: v })} size="lg" glow="strong" stripes durationMs={800} />
              <div className="flex gap-2">
                <button onClick={save} className="btn-primary">更新</button>
                <button onClick={remove} className="rounded border border-red-700 px-3 py-2 text-red-300 transition hover:bg-red-900/20">削除</button>
              </div>
              {msg && <p className="text-neutral-300">{msg}</p>}
            </div>
          </Card>
        )}
      </section>
    </AuthGuard>
  )
}
