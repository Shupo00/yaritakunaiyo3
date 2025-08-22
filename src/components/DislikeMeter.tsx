"use client"
type ColorStop = { at: number; c: string }
type Props = { level: number; height?: number; durationMs?: number; colorStops?: ColorStop[]; stripes?: boolean }

export default function DislikeMeter({ level, height = 12, durationMs = 600, colorStops, stripes = false }: Props) {
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
  function colorForSmooth(v: number) {
    const stops = colorStops ?? [
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
  const color = colorForSmooth(level)
  const pulse = level >= 81
  const pct = Math.max(0, Math.min(100, level))
  return (
    <div aria-label={`やりたくない度 ${level}`} className="relative w-full overflow-hidden rounded bg-neutral-800/80" style={{ height }}>
      <div
        className={("absolute left-0 top-0 h-full " + (pulse ? 'animate-throb' : ''))}
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color} 0%, ${color} 70%, ${color} 100%)`, transition: `width .25s ease, background ${durationMs}ms ease` }}
      />
      {stripes && (
        <div className="pointer-events-none absolute inset-0 opacity-15" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0, rgba(255,255,255,0.15) 6px, transparent 6px, transparent 12px)' }} />
      )}
    </div>
  )
}
