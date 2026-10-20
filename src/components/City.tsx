import { useEffect, useRef, useState, type RefObject } from 'react'
import { palettes } from '../content'
import { PERSPECTIVE } from '../lib/motion'

// Surface patterns for the long faces, drawn as tiling CSS/SVG backgrounds so they stay crisp at any zoom
const svg = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`
const patterns = {
  grid: 'repeating-linear-gradient(to right,transparent 0 31px,rgb(255 255 255/.4) 31px 32px),repeating-linear-gradient(to bottom,transparent 0 31px,rgb(255 255 255/.4) 31px 32px)',
  pixels: svg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" fill="#fff" fill-opacity=".55"><rect x="8" y="8" width="16" height="16"/><rect x="24" y="24" width="16" height="16"/><rect x="56" y="16" width="16" height="16" fill="#b2ffa6" fill-opacity=".8"/><rect x="40" y="56" width="16" height="16"/><rect x="72" y="72" width="16" height="16" fill="#b2ffa6" fill-opacity=".8"/><rect x="8" y="64" width="16" height="16"/></svg>`,
  ),
  circuit: svg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="160" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2"><path d="M20 0v40l20 20v100M60 0v30l30 30v40l-20 20v40M100 0v70"/><circle cx="40" cy="60" r="5"/><circle cx="90" cy="60" r="5"/><circle cx="100" cy="76" r="5"/><circle cx="70" cy="120" r="5"/></svg>`,
  ),
}

// Stage pixels: 1440×900 with the origin at the centre, y down. depth 0 = far/slow, 1 = near/fast.
// r = [rotateX, rotateY, rotateZ] in degrees; name tags a box for choreography that targets one element.
export type Box = {
  x: number
  y: number
  z: number
  w: number
  h: number
  d: number
  p: number
  depth?: number
  name?: string
  pattern?: keyof typeof patterns
  r?: [number, number, number]
}

// One element per face: surface pattern, soft grain and the gradient are stacked as background layers,
// so the GPU composites a single flat texture instead of blending child layers every frame
function Face({ w, h, transform, background, pattern }: { w: number; h: number; transform: string; background: string; pattern?: string }) {
  return (
    <div
      className="absolute [backface-visibility:hidden]"
      style={{ width: w, height: h, left: -w / 2, top: -h / 2, transform, background: `${pattern ? `${pattern},` : ''}var(--grain-soft),${background}` }}
    />
  )
}

const p3d = 'absolute [transform-style:preserve-3d]'

// Wrapper chain: [data-city] travels along z → [data-city-mouse] parallax → placement → faces
function Cuboid({ b }: { b: Box }) {
  const [front, side, top] = palettes[b.p]
  const p = b.pattern && patterns[b.pattern]
  const shade = 'linear-gradient(rgb(0 0 0/.18),rgb(0 0 0/.18)),'
  return (
    <div className={p3d} data-city={b.name ?? ''} data-depth={b.depth ?? 0.5} data-near={b.z + b.d / 2}>
      <div className={p3d} data-city-mouse="">
        <div className={p3d} style={{ transform: `translate3d(${b.x}px,${b.y}px,${b.z}px) rotateX(${b.r?.[0] ?? 0}deg) rotateY(${b.r?.[1] ?? 0}deg) rotateZ(${b.r?.[2] ?? 0}deg)` }}>
          <Face w={b.w} h={b.h} transform={`translateZ(${b.d / 2}px)`} background={top} />
          <Face w={b.w} h={b.d} transform={`rotateX(90deg) translateZ(${b.h / 2}px)`} background={front} pattern={p} />
          <Face w={b.w} h={b.d} transform={`rotateX(-90deg) translateZ(${b.h / 2}px)`} background={front} pattern={p} />
          <Face w={b.d} h={b.h} transform={`rotateY(-90deg) translateZ(${b.w / 2}px)`} background={shade + side} />
          <Face w={b.d} h={b.h} transform={`rotateY(90deg) translateZ(${b.w / 2}px)`} background={shade + side} />
        </div>
      </div>
    </div>
  )
}

const STAGE_W = 1440
const STAGE_H = 900

// Cover-scale the 1440×900 art board to its container; on boxes narrower than ~1.22:1 squeeze it horizontally
// so the skyline stays in frame
function useCoverScale(ref: RefObject<HTMLDivElement | null>) {
  const [fit, setFit] = useState({ s: 1, sx: 1 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect
      const s = Math.max(width / STAGE_W, height / STAGE_H)
      setFit({ s, sx: Math.min(1, Math.max(0.42, width / s / 1100)) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return fit
}

export default function City({ boxes, tilt = 0, origin = '50% 50%' }: { boxes: Box[]; tilt?: number; origin?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { s, sx } = useCoverScale(ref)
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2"
        style={{ width: STAGE_W, height: STAGE_H, marginLeft: -STAGE_W / 2, marginTop: -STAGE_H / 2, transform: `scale(${s})`, perspective: PERSPECTIVE, perspectiveOrigin: origin }}
      >
        <div className="absolute top-1/2 left-1/2 [transform-style:preserve-3d]" style={{ transform: `rotateX(${tilt}deg) scaleX(${sx})` }}>
          {boxes.map((b, i) => (
            <Cuboid key={i} b={b} />
          ))}
        </div>
      </div>
    </div>
  )
}
