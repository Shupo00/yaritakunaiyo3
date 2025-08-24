"use client"
import { useEffect, useMemo, useState } from 'react'
import { AreaChart, Area, LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabaseClient'
import type { Task } from '@/lib/types'
import AuthGuard from '@/components/AuthGuard'
import CalendarHeatmap from '@/components/CalendarHeatmap'

type Range = 'week'|'month'
type HeatMetric = 'avg'|'count'

function fmtDate(d: Date) {
  const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}

function colorScaleAvg(v: number) {
  // 0-20 gray, 21-60 purple, 61-80 dark red, 81-100 bright red
  if (v <= 20) return '#808080'
  if (v <= 60) return '#8A2BE2'
  if (v <= 80) return '#B22222'
  return '#FF0000'
}

function colorScaleCount(v: number, max: number) {
  if (max <= 0) return '#303030'
  const t = Math.min(1, v / max)
  const r = Math.round(48 + (255-48) * t)
  const g = Math.round(48 + (43-48) * t)
  const b = Math.round(48 + (226-48) * t)
  return `rgb(${r},${g},${b})`
}

export default function StatsPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<Range>('week')
  const [metric, setMetric] = useState<HeatMetric>('avg')

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      // Fetch enough data to render the calendar fully (20週間 ≒ 140日)
      const since = new Date()
      since.setDate(since.getDate() - 140)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .gte('created_at', since.toISOString())
      if (!mounted) return
      if (error) setTasks([]); else setTasks(data as Task[])
      setLoading(false)
    }
    load()
  }, [range])

  const agg = useMemo(() => {
    if (tasks.length === 0) return { avg: 0, max: 0, count: 0 }
    const total = tasks.reduce((a, t) => a + t.dislike_level, 0)
    const max = tasks.reduce((m, t) => Math.max(m, t.dislike_level), 0)
    return { avg: Math.round(total / tasks.length), max, count: tasks.length }
  }, [tasks])

  const series = useMemo(() => {
    const days = range === 'week' ? 7 : 30
    const base = new Date(); base.setHours(0,0,0,0)
    const map = new Map<string, { sum: number; cnt: number }>()
    for (let i = days-1; i >= 0; i--) {
      const d = new Date(base); d.setDate(base.getDate() - i)
      map.set(fmtDate(d), { sum: 0, cnt: 0 })
    }
    for (const t of tasks) {
      const d = new Date(t.created_at)
      d.setHours(0,0,0,0)
      const key = fmtDate(d)
      const cur = map.get(key)
      if (cur) { cur.sum += t.dislike_level; cur.cnt += 1; map.set(key, cur) }
    }
    return Array.from(map.entries()).map(([date, v]) => ({ date, avg: v.cnt ? Math.round(v.sum / v.cnt) : 0, count: v.cnt }))
  }, [tasks, range])

  const heat = useMemo(() => {
    // weekday(0-6) x hour(0-23)
    const cell: { sum: number; cnt: number }[][] = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => ({ sum: 0, cnt: 0 })))
    tasks.forEach(t => {
      const d = new Date(t.created_at)
      const w = d.getDay()
      const h = d.getHours()
      const c = cell[w][h]
      c.sum += t.dislike_level; c.cnt += 1
    })
    const maxCount = cell.flat().reduce((m, c) => Math.max(m, c.cnt), 0)
    return { cell, maxCount }
  }, [tasks])

  const weekdays = ['日','月','火','水','木','金','土']

  return (
    <AuthGuard>
      <section className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold">統計</h1>
          <div className="text-sm">
            <label className="mr-2">期間</label>
            <select value={range} onChange={e=>setRange(e.target.value as Range)} className="rounded border border-neutral-700 bg-neutral-900 p-1">
              <option value="week">直近1週間</option>
              <option value="month">直近1ヶ月</option>
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-4">
            <div className="text-sm text-neutral-400">平均やりたくない度</div>
            <div className="text-3xl font-bold">{loading ? '…' : agg.avg}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-neutral-400">最大やりたくない度</div>
            <div className="text-3xl font-bold">{loading ? '…' : agg.max}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-neutral-400">件数</div>
            <div className="text-3xl font-bold">{loading ? '…' : agg.count}</div>
          </div>
        </div>

        <div className="card p-4">
          <div className="mb-2 text-sm text-neutral-400">日次平均（ライン）</div>
          <div className="h-56 sm:h-64">
            {loading ? (
              <div className="text-neutral-400">読み込み中…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8A2BE2" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#8A2BE2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#aaa" tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={20} />
                  <YAxis stroke="#aaa" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1E1E1E', border: '1px solid #333' }} labelStyle={{ color: '#ccc' }} formatter={(v)=>[v,'平均']} />
                  <Area type="monotone" dataKey="avg" stroke="#8A2BE2" strokeWidth={2.5} fill="url(#avgGrad)" isAnimationActive animationDuration={600} />
                  <Line type="monotone" dataKey="avg" stroke="#B68CF2" dot={{ r: 0 }} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 1 }} strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card p-4">
          <div className="mb-2 text-sm text-neutral-400">日次件数（バー）</div>
          <div className="h-56 sm:h-64">
            {loading ? (
              <div className="text-neutral-400">読み込み中…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series}>
                  <defs>
                    <linearGradient id="countGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8A2BE2" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#8A2BE2" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#aaa" tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={20} />
                  <YAxis stroke="#aaa" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1E1E1E', border: '1px solid #333' }} labelStyle={{ color: '#ccc' }} formatter={(v)=>[v,'件数']} />
                  <Bar dataKey="count" fill="url(#countGrad)" radius={[4,4,0,0]} isAnimationActive animationDuration={600} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="space-y-2 card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-400">カレンダー</div>
            <select value={metric} onChange={e=>setMetric(e.target.value as HeatMetric)} className="rounded border border-neutral-700 bg-neutral-900 p-1 text-xs">
              <option value="count">件数</option>
              <option value="avg">平均やりたくない度</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <CalendarHeatmap tasks={tasks} metric={metric} weeks={20} startOn="mon" />
          </div>
        </div>

        <div className="space-y-3 card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-400">曜日×時間ヒートマップ</div>
            <div className="text-xs">
              <label className="mr-2">指標</label>
              <select value={metric} onChange={e=>setMetric(e.target.value as HeatMetric)} className="rounded border border-neutral-700 bg-neutral-900 p-1">
                <option value="avg">平均やりたくない度</option>
                <option value="count">件数</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[auto,repeat(24,1fr)] gap-1 min-w-[700px]">
            <div />
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="text-center text-[10px] text-neutral-400">{h}</div>
            ))}
            {heat.cell.map((row, w) => (
              <>
                <div key={`w-${w}`} className="pr-1 text-right text-[12px] text-neutral-400">{weekdays[w]}</div>
                {row.map((c, h) => {
                  const val = metric === 'avg' ? (c.cnt ? Math.round(c.sum / c.cnt) : 0) : c.cnt
                  const bg = metric === 'avg' ? colorScaleAvg(val) : colorScaleCount(val, heat.maxCount)
                  return (
                    <div key={`c-${w}-${h}`} className="h-5 rounded" title={`${weekdays[w]} ${h}時: ${metric==='avg' ? `平均 ${val}` : `件数 ${val}`}`} style={{ backgroundColor: bg }} />
                  )
                })}
              </>
            ))}
          </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <span>凡例:</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-4 rounded" style={{ backgroundColor: '#808080' }}></span>低</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-4 rounded" style={{ backgroundColor: '#8A2BE2' }}></span>中</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-4 rounded" style={{ backgroundColor: '#FF0000' }}></span>高</span>
          </div>
        </div>

        {/* タグ関連のグラフは削除 */}
      </section>
    </AuthGuard>
  )
}
