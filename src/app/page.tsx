"use client"
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AuthGuard from '@/components/AuthGuard'
import DislikeMeter from '@/components/DislikeMeter'
import type { Task } from '@/lib/types'
import { cacheTasks, getCachedTasks } from '@/lib/idb'
import DislikeSlider from '@/components/DislikeSlider'
import Modal from '@/components/ui/Modal'
import TaskDetailPanel from '@/components/TaskDetailPanel'

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [min, setMin] = useState(0)

  async function fetchTasks() {
    setLoading(true)
    const cached = await getCachedTasks()
    if (cached.length > 0) setTasks(cached as Task[])
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
    if (!error && data) {
      setTasks(data as Task[])
      cacheTasks(data as Task[])
    }
    setLoading(false)
  }

  useEffect(() => {
    let mounted = true
    fetchTasks()
    const channel = supabase
      .channel('realtime:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => { fetchTasks() })
      .subscribe()
    return () => {
      mounted = false
      try { channel?.unsubscribe?.() } catch {}
    }
  }, [])

  useEffect(() => {
    const handler = () => fetchTasks()
    window.addEventListener('tasks:changed', handler)
    return () => window.removeEventListener('tasks:changed', handler)
  }, [])

  const [max, setMax] = useState(100)
  const [sort, setSort] = useState<'new'|'old'|'dislike'|'incomplete'|'complete'>('new')
  const [hideDone, setHideDone] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // persist UI state
  useEffect(() => {
    try { localStorage.setItem('filters', JSON.stringify({ q, min, max, sort, hideDone })) } catch {}
  }, [q, min, max, sort, hideDone])
  useEffect(() => {
    try {
      const raw = localStorage.getItem('filters'); if (!raw) return
      const v = JSON.parse(raw)
      setQ(v.q ?? ''); setMin(v.min ?? 0); setMax(v.max ?? 100); setSort(v.sort ?? 'new'); setHideDone(!!v.hideDone)
    } catch {}
  }, [])

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase()
    let arr = tasks
      .filter(t => (
        (t.dislike_level >= min && t.dislike_level <= max) &&
        (kw === '' || t.action.toLowerCase().includes(kw) || (t.reason ?? '').toLowerCase().includes(kw))
      ))
      .filter(t => (hideDone ? !t.done : true))
    if (sort === 'new') arr = arr.sort((a,b) => (a.created_at > b.created_at ? -1 : 1))
    else if (sort === 'old') arr = arr.sort((a,b) => (a.created_at > b.created_at ? 1 : -1))
    else if (sort === 'dislike') arr = arr.sort((a,b) => b.dislike_level - a.dislike_level)
    else if (sort === 'incomplete') arr = arr.sort((a,b) => (Number(a.done) - Number(b.done)) || (a.created_at > b.created_at ? -1 : 1))
    else if (sort === 'complete') arr = arr.sort((a,b) => (Number(b.done) - Number(a.done)) || (a.created_at > b.created_at ? -1 : 1))
    return arr
  }, [tasks, q, min, max, sort, hideDone])

  return (
    <AuthGuard>
      <section className="space-y-6">
        <h1 className="text-2xl font-bold">やりたくない記録</h1>
        <div className="text-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex-1 min-w-[280px]">
              <label className="block">検索
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="キーワード" className="input mt-1" />
              </label>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm">最小やりたくない度</label>
                  <DislikeSlider
                    value={min}
                    onChange={(v)=>{ const nv = Math.min(100, Math.max(0, v)); setMin(nv); if (nv > max) setMax(nv) }}
                    size="sm"
                    showEmoji={false}
                    showValue
                    glow="soft"
                    stripes
                    durationMs={400}
                  />
                </div>
                <div>
                  <label className="block text-sm">最大やりたくない度</label>
                  <DislikeSlider
                    value={max}
                    onChange={(v)=>{ const nv = Math.min(100, Math.max(0, v)); setMax(nv); if (nv < min) setMin(nv) }}
                    size="sm"
                    showEmoji={false}
                    showValue
                    glow="soft"
                    stripes
                    durationMs={400}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 justify-end w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-neutral-300">完了を隠す</span>
                <button
                  role="switch"
                  aria-checked={hideDone}
                  onClick={()=>setHideDone(v=>!v)}
                  className={`relative inline-flex h-6 w-12 rounded-full transition ${hideDone ? 'bg-gradient-to-r from-poison-500 to-red-500 shadow-glow' : 'bg-neutral-800 border border-neutral-700'}`}
                  title="完了タスクを非表示にする"
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white/90 transition-all ${hideDone ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center">
                <select
                  value={sort}
                  onChange={e=>setSort(e.target.value as any)}
                  className="select h-9"
                >
                  <option value="new">新しい順</option>
                  <option value="old">古い順</option>
                  <option value="dislike">やりたくない度</option>
                  <option value="incomplete">未完了優先</option>
                  <option value="complete">完了優先</option>
                </select>
              </div>
              <Link href="/add" className="btn-primary h-9 px-4 whitespace-nowrap">タスクを追加</Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-neutral-400">読み込み中…</div>
        ) : filtered.length === 0 ? (
          <div className="card text-neutral-300"> <div className="p-4">データがありません</div> </div>
        ) : (
          <>
            <ul className="space-y-2">
              {filtered.map(t => (
                <li key={t.id}>
                  <div className={`card w-full ${t.done ? 'opacity-70' : ''}`}>
                    <div className="p-3">
                      <button onClick={()=>setSelectedId(t.id)} className="block text-left w-full">
                        <div className={`font-medium hover:underline ${t.done ? 'line-through decoration-red-500/60' : ''}`}>{t.action}</div>
                        {t.reason && <p className="mt-0.5 text-sm text-neutral-400 line-clamp-2">{t.reason}</p>}
                      </button>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="hidden sm:block w-40"><DislikeMeter level={t.dislike_level} /></div>
                        <div className="sm:hidden w-full"><DislikeMeter level={t.dislike_level} /></div>
                        <button
                          onClick={async (e)=>{
                            e.stopPropagation()
                            const { error } = await supabase.from('tasks').update({ done: !t.done }).eq('id', t.id)
                            if (!error) {
                              try { window.dispatchEvent(new CustomEvent('tasks:changed')) } catch {}
                            }
                          }}
                          title={t.done ? '未完了に戻す' : '完了にする'}
                          className={`relative inline-flex items-center justify-center h-8 w-10 rounded-md text-sm transition 
                            ${t.done ? 'bg-gradient-to-b from-red-700 to-red-900 text-white shadow-glow' : 'bg-neutral-900/80 border border-neutral-700 text-neutral-200 hover:bg-neutral-800'}`}
                        >
                          <span className={`transition-transform ${t.done ? '' : ''}`}>×</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <Modal open={!!selectedId} onClose={()=>setSelectedId(null)} title="タスク詳細">
              {selectedId && (
                <TaskDetailPanel id={selectedId} onClose={()=>setSelectedId(null)} />
              )}
            </Modal>
          </>
        )}
      </section>
    </AuthGuard>
  )
}
