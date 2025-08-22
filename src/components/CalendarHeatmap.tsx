"use client"
import type { Task } from '@/lib/types'
import { useMemo } from 'react'

type Props = {
  tasks: Task[]
  metric?: 'count' | 'avg'
  weeks?: number
  startOn?: 'sun' | 'mon'
  hideLabels?: boolean
}

function fmtDate(d: Date) {
  const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x }

function shiftDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate()+n); return x }

function colorScaleAvg(v: number) {
  if (v <= 0) return '#2a2a2a'
  if (v <= 20) return '#808080'
  if (v <= 60) return '#8A2BE2'
  if (v <= 80) return '#B22222'
  return '#FF0000'
}

function colorScaleCount(v: number, max: number) {
  if (v <= 0 || max <= 0) return '#2a2a2a'
  const t = Math.min(1, v / max)
  const r = Math.round(48 + (255-48) * t)
  const g = Math.round(48 + (43-48) * t)
  const b = Math.round(48 + (226-48) * t)
  return `rgb(${r},${g},${b})`
}

export default function CalendarHeatmap({ tasks, metric = 'count', weeks = 20, startOn = 'sun', hideLabels = false }: Props) {
  const data = useMemo(() => {
    const today = startOfDay(new Date())
    const dow = today.getDay() // 0:Sun .. 6:Sat
    // Determine end-of-current-week date so that today is included in the rightmost column
    let daysToWeekEnd: number
    if (startOn === 'sun') {
      // week runs Sun..Sat, end is Saturday (6)
      daysToWeekEnd = 6 - dow
    } else {
      // week runs Mon..Sun, end is Sunday (0)
      const weekEndIndex = 0
      daysToWeekEnd = ((weekEndIndex - dow) + 7) % 7
    }
    const weekEnd = shiftDays(today, daysToWeekEnd)
    const totalDays = weeks * 7
    const start = shiftDays(weekEnd, -(totalDays - 1))
    const end = weekEnd

    // Aggregate per day
    const agg = new Map<string, { sum: number; cnt: number; date: Date }>()
    for (const t of tasks) {
      const d = startOfDay(new Date(t.created_at))
      const key = fmtDate(d)
      if (!agg.has(key)) agg.set(key, { sum: 0, cnt: 0, date: d })
      const cur = agg.get(key)!
      cur.sum += t.dislike_level; cur.cnt += 1
    }

    const days: { date: Date; key: string; avg: number; count: number }[] = []
    for (let i = 0; i < totalDays; i++) {
      const d = shiftDays(start, i)
      const key = fmtDate(d)
      const cur = agg.get(key)
      const count = cur?.cnt ?? 0
      const avg = count > 0 ? Math.round((cur!.sum / count)) : 0
      days.push({ date: d, key, avg, count })
    }
    // Split into weeks (columns)
    const cols: typeof days[] = []
    for (let i = 0; i < weeks; i++) {
      cols.push(days.slice(i*7, i*7 + 7))
    }
    const maxCount = days.reduce((m, d) => Math.max(m, d.count), 0)
    return { cols, maxCount, start, end }
  }, [tasks, metric, weeks, startOn])

  const monthLabels = useMemo(() => {
    // Show label when month changes compared to previous column.
    // This ensures current月の表示も欠けない（1日が含まれなくても月の切り替わりで表示）。
    const labels: string[] = []
    let prevMonth: number | null = null
    for (const week of data.cols) {
      const first = week[0]?.date
      const m = first ? first.getMonth() : prevMonth
      if (prevMonth === null || (m !== null && m !== prevMonth)) {
        labels.push(`${(m ?? 0)+1}月`)
      } else {
        labels.push('')
      }
      prevMonth = m ?? prevMonth
    }
    return labels
  }, [data])

  const weekdays = startOn === 'sun' ? ['日','月','火','水','木','金','土'] : ['月','火','水','木','金','土','日']

  return (
    <div className="space-y-2">
      <div className="flex overflow-x-auto overflow-y-hidden">
        {!hideLabels && (
          <div className="mr-1 w-6 shrink-0 flex flex-col gap-1">
            {weekdays.map((w, i) => (
              <div key={i} className="h-3 text-right text-[10px] leading-3 text-neutral-500">
                {w}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-1">
          {data.cols.map((week, i) => (
            <div key={i} className="flex flex-col gap-1">
              {week.map((d, j) => {
                const val = metric === 'avg' ? d.avg : d.count
                const color = metric === 'avg' ? colorScaleAvg(val) : colorScaleCount(val, data.maxCount)
                const title = `${d.key} — ${metric==='avg' ? `平均 ${val}` : `件数 ${val}`}`
                return <div key={j} className="h-3 w-3 rounded" style={{ backgroundColor: color }} title={title} />
              })}
            </div>
          ))}
        </div>
      </div>
      {!hideLabels && (
        <div className="flex items-center justify-between text-[10px] text-neutral-500">
          <div className="flex items-center">
            <div className="w-6 shrink-0 mr-1" />
            <div className="flex gap-1">
              {monthLabels.map((m, i) => (
                <div key={i} className="w-3 text-center">{m}</div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span>少</span>
            <span className="h-3 w-3 rounded" style={{ backgroundColor: '#2a2a2a' }} />
            <span className="h-3 w-3 rounded" style={{ backgroundColor: '#808080' }} />
            <span className="h-3 w-3 rounded" style={{ backgroundColor: '#8A2BE2' }} />
            <span className="h-3 w-3 rounded" style={{ backgroundColor: '#B22222' }} />
            <span className="h-3 w-3 rounded" style={{ backgroundColor: '#FF0000' }} />
            <span>多</span>
          </div>
        </div>
      )}
    </div>
  )
}
