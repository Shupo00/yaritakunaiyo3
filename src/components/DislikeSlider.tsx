"use client"
import { useMemo } from 'react'

type ColorStop = { at: number; c: string }
type Props = {
  value: number
  onChange: (v: number) => void
  size?: 'sm' | 'md' | 'lg'
  showEmoji?: boolean
  showValue?: boolean
  showTicks?: boolean
  glow?: 'none' | 'soft' | 'strong'
  durationMs?: number
  colorStops?: ColorStop[]
  stripes?: boolean
}

function faceEmoji(v: number) {
  if (v <= 20) return '🙂'
  if (v <= 60) return '😐'
  if (v <= 80) return '😒'
  return '🤬'
}

function hexToRgb(hex: string) {
  const m = hex.replace('#','')
  const i = parseInt(m.length === 3 ? m.split('').map(c=>c+c).join('') : m, 16)
  return { r: (i>>16)&255, g: (i>>8)&255, b: i&255 }
}
function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('')
}
function lerp(a: number, b: number, t: number) { return a + (b-a) * t }
function lerpColor(c1: string, c2: string, t: number) {
  const A = hexToRgb(c1), B = hexToRgb(c2)
  return rgbToHex(Math.round(lerp(A.r,B.r,t)), Math.round(lerp(A.g,B.g,t)), Math.round(lerp(A.b,B.b,t)))
}
function colorForSmooth(v: number, customStops?: ColorStop[]) {
  // Smoothly interpolate across stops: 0:#808080 -> 20:#808080 -> 60:#8A2BE2 -> 80:#B22222 -> 100:#FF0000
  const stops = customStops ?? [
    { at: 0, c: '#808080' },
    { at: 20, c: '#808080' },
    { at: 60, c: '#8A2BE2' },
    { at: 80, c: '#B22222' },
    { at: 100, c: '#FF0000' },
  ]
  const x = Math.max(0, Math.min(100, v))
  for (let i=0; i<stops.length-1; i++) {
    const a = stops[i], b = stops[i+1]
    if (x >= a.at && x <= b.at) {
      const t = (x - a.at) / (b.at - a.at || 1)
      return lerpColor(a.c, b.c, t)
    }
  }
  return stops[stops.length-1].c
}

export default function DislikeSlider({ value, onChange, size = 'md', showEmoji = true, showValue = true, showTicks = false, glow = 'soft', durationMs = 600, colorStops, stripes = true }: Props) {
  const color = useMemo(() => colorForSmooth(value, colorStops), [value, colorStops])
  const pulse = value >= 81
  const pct = Math.max(0, Math.min(100, value))
  const h = size === 'lg' ? 18 : size === 'sm' ? 10 : 14
  const thumb = size === 'lg' ? 20 : size === 'sm' ? 14 : 18
  const glowShadow = glow === 'none' ? 'none' : glow === 'strong' ? '0 0 0 4px rgba(138,43,226,0.35), 0 10px 28px rgba(0,0,0,0.5)' : '0 0 0 3px rgba(138,43,226,0.25), 0 6px 18px rgba(0,0,0,0.4)'
  const transitionBg = `${durationMs}ms`

  return (
    <div className="dslider relative w-full select-none">
      <div className="relative w-full overflow-hidden rounded-full bg-neutral-800/80 shadow-inner" style={{ height: h }}>
        <div
          className={`absolute left-0 top-0 h-full ${pulse ? 'animate-throb' : ''}`}
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color} 0%, ${color} 70%, ${color} 100%)`, transition: `width .25s ease, background ${transitionBg} ease` }}
        />
        {stripes && (
          <div className="pointer-events-none absolute inset-0 opacity-15" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0, rgba(255,255,255,0.15) 6px, transparent 6px, transparent 12px)' }} />
        )}
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="dslider-input absolute inset-0 z-10 w-full appearance-none bg-transparent"
          style={{ height: h, ['--h' as any]: `${h}px`, ['--thumb' as any]: `${thumb}px`, ['--thumb-color' as any]: color, ['--glow-shadow' as any]: glowShadow, ['--transition-bg' as any]: transitionBg }}
          aria-label="やりたくない度"
        />
      </div>
      {(showEmoji || showValue) && (
        <div className="pointer-events-none mt-2 flex items-center justify-between text-sm">
          {showEmoji ? <span className="text-neutral-300">{faceEmoji(value)}</span> : <span />}
          {showValue && <span className="rounded bg-neutral-900/80 px-2 py-0.5 text-neutral-200 shadow-card">{value}</span>}
        </div>
      )}
      {showTicks && (
        <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-400">
          {[0, 20, 40, 60, 80, 100].map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}
