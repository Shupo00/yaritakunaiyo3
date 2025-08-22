"use client"
import { useMemo } from 'react'

type ColorStop = { at: number; c: string }
type Props = {
  min: number
  max: number
  onChange: (range: { min: number; max: number }) => void
  size?: 'sm' | 'md' | 'lg'
  glow?: 'none' | 'soft' | 'strong'
  durationMs?: number
  colorStops?: ColorStop[]
  stripes?: boolean
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

export default function DislikeRange({ min, max, onChange, size='md', glow='soft', durationMs=600, colorStops, stripes=true }: Props) {
  const h = size === 'lg' ? 18 : size === 'sm' ? 10 : 14
  const thumb = size === 'lg' ? 20 : size === 'sm' ? 14 : 18
  const glowShadow = glow === 'none' ? 'none' : glow === 'strong' ? '0 0 0 4px rgba(138,43,226,0.35), 0 10px 28px rgba(0,0,0,0.5)' : '0 0 0 3px rgba(138,43,226,0.25), 0 6px 18px rgba(0,0,0,0.4)'
  const transitionBg = `${durationMs}ms`

  const left = Math.min(min, max)
  const right = Math.max(min, max)
  const midVal = Math.round((left + right) / 2)
  const fillColor = useMemo(() => colorForSmooth(midVal, colorStops), [midVal, colorStops])

  // manage z-index so the active thumb stays on top when close
  const minZ = left >= right - 5 ? 30 : 20
  const maxZ = left >= right - 5 ? 40 : 10

  return (
    <div className="relative w-full select-none">
      <div className="relative w-full overflow-hidden rounded-full bg-neutral-800/80 shadow-inner" style={{ height: h }}>
        {/* filled range */}
        <div className="absolute top-0 h-full" style={{ left: `${left}%`, width: `${Math.max(0, right - left)}%`, background: `linear-gradient(90deg, ${fillColor} 0%, ${fillColor} 70%, ${fillColor} 100%)`, transition: `width .25s ease, left .25s ease, background ${transitionBg} ease` }} />
        {stripes && (
          <div className="pointer-events-none absolute inset-0 opacity-15" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0, rgba(255,255,255,0.15) 6px, transparent 6px, transparent 12px)' }} />
        )}
        {/* Min thumb */}
        <input
          type="range"
          min={0}
          max={100}
          value={left}
          onChange={(e)=>{
            const v = Math.min(Number(e.target.value), right)
            onChange({ min: v, max: right })
          }}
          className="dslider-input absolute inset-0 appearance-none bg-transparent"
          style={{ height: h, zIndex: minZ, ['--h' as any]: `${h}px`, ['--thumb' as any]: `${thumb}px`, ['--thumb-color' as any]: colorForSmooth(left, colorStops), ['--glow-shadow' as any]: glowShadow, ['--transition-bg' as any]: transitionBg }}
          aria-label="最小やりたくない度"
        />
        {/* Max thumb */}
        <input
          type="range"
          min={0}
          max={100}
          value={right}
          onChange={(e)=>{
            const v = Math.max(Number(e.target.value), left)
            onChange({ min: left, max: v })
          }}
          className="dslider-input absolute inset-0 appearance-none bg-transparent"
          style={{ height: h, zIndex: maxZ, ['--h' as any]: `${h}px`, ['--thumb' as any]: `${thumb}px`, ['--thumb-color' as any]: colorForSmooth(right, colorStops), ['--glow-shadow' as any]: glowShadow, ['--transition-bg' as any]: transitionBg }}
          aria-label="最大やりたくない度"
        />
      </div>
    </div>
  )
}

