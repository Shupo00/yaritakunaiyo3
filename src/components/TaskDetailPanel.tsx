"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Task } from '@/lib/types'
import DislikeSlider from '@/components/DislikeSlider'

type Props = { id: string; onClose?: () => void }

export default function TaskDetailPanel({ id, onClose }: Props) {
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
    if (error) {
      setMsg(error.message)
    } else {
      try { window.dispatchEvent(new CustomEvent('tasks:changed')) } catch {}
      onClose?.()
    }
  }

  async function remove() {
    setMsg(null)
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) setMsg(error.message)
    else {
      setMsg('削除しました')
      try { window.dispatchEvent(new CustomEvent('tasks:changed')) } catch {}
      onClose?.()
    }
  }

  if (loading) return <div className="text-neutral-400">読み込み中…</div>
  if (!task) return <div className="text-neutral-300">見つかりませんでした</div>

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-neutral-400">状態</span>
        <button
          onClick={async ()=>{
            if (!task) return
            const { error } = await supabase.from('tasks').update({ done: !task.done }).eq('id', id)
            if (!error) {
              setTask({ ...(task as Task), done: !task.done })
              try { window.dispatchEvent(new CustomEvent('tasks:changed')) } catch {}
            }
          }}
          className={`relative inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition 
            ${task?.done ? 'bg-gradient-to-b from-red-700 to-red-900 text-white shadow-glow' : 'bg-neutral-900/80 border border-neutral-700 text-neutral-200 hover:bg-neutral-800'}`}
        >
          <span>×</span>
          <span>{task?.done ? '完了' : '完了にする'}</span>
        </button>
      </div>
      <label className="block">やること
        <input value={task.action} onChange={e=>setTask({ ...(task as Task), action: e.target.value })} className="input mt-1" />
      </label>
      <label className="block">理由
        <textarea value={task.reason ?? ''} onChange={e=>setTask({ ...(task as Task), reason: e.target.value })} rows={4} className="textarea mt-1" />
      </label>
      <label className="block mb-2">やりたくない度</label>
      <DislikeSlider value={task.dislike_level} onChange={(v)=>setTask({ ...(task as Task), dislike_level: v })} size="lg" glow="strong" stripes durationMs={800} />
      <div className="flex gap-2 pt-2">
        <button onClick={save} className="btn-primary">更新</button>
        <button onClick={remove} className="rounded border border-red-700 px-3 py-2 text-red-300 transition hover:bg-red-900/20">削除</button>
      </div>
      {msg && <p className="text-neutral-300">{msg}</p>}
    </div>
  )
}
