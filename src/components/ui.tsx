import { useRef, type ComponentProps, type ReactNode } from 'react'
import { EASE, gsap, MQ, revealOnScroll, useGSAP } from '../lib/motion'

export function Tag({ children, onPaper = false, className = '' }: { children: ReactNode; onPaper?: boolean; className?: string }) {
  return (
    <span className={`chamfer inline-flex h-[26px] w-fit items-center px-[9px] ${onPaper ? 'bg-black/10 text-ink-onpaper' : 'bg-white/9 text-ink'} ${className}`}>
      <span className="mono">{children}</span>
    </span>
  )
}

type ButtonProps = ComponentProps<'a'> & { variant?: 'primary' | 'secondary' }

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  // Off-site links and documents like the resume open in a new tab, so the portfolio stays open behind them
  const external = props.href?.startsWith('http') || props.href?.endsWith('.pdf')
  return (
    <a
      {...props}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      className={`group relative inline-flex items-center justify-center px-6 py-[15px] font-mono text-[13px] leading-4 font-medium tracking-[0.15em] whitespace-nowrap uppercase transition-[scale] duration-150 ease-out active:scale-[0.96] motion-reduce:active:scale-100 ${variant === 'primary' ? 'text-void' : 'text-ink'} ${className}`}
    >
      {variant === 'primary' ? (
        <span aria-hidden className="chamfer absolute inset-0 bg-ink transition-colors duration-150 group-hover:bg-slot" />
      ) : (
        // Stroked chamfer outline: four inset edges plus a 45° segment across each corner
        <span aria-hidden className="pointer-events-none absolute inset-0 text-ink-dim transition-colors duration-150 group-hover:text-ink">
          <span className="absolute inset-x-[5px] top-0 h-px bg-current" />
          <span className="absolute inset-x-[5px] bottom-0 h-px bg-current" />
          <span className="absolute inset-y-[5px] left-0 w-px bg-current" />
          <span className="absolute inset-y-[5px] right-0 w-px bg-current" />
          <span className="absolute top-0 left-[5px] h-px w-[7px] origin-left rotate-[135deg] bg-current" />
          <span className="absolute top-0 right-[5px] h-px w-[7px] origin-right -rotate-[135deg] bg-current" />
          <span className="absolute bottom-0 left-[5px] h-px w-[7px] origin-left -rotate-[135deg] bg-current" />
          <span className="absolute right-[5px] bottom-0 h-px w-[7px] origin-right rotate-[135deg] bg-current" />
        </span>
      )}
      <span className="relative">{children}</span>
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  )
}

// Scroll reveal: rises from y on power3.out once it scrolls in, and rewinds only after leaving the screen below.
// Children marked data-reveal rise in a stagger off this one trigger; otherwise the wrapper rises as a whole.
export function Reveal({
  children,
  delay = 0,
  y = 16,
  duration = 0.55,
  stagger = 0.06,
  ease = EASE.editorial,
  start = 'top 80%',
  className = '',
}: {
  children: ReactNode
  delay?: number
  y?: number
  duration?: number
  stagger?: number
  ease?: string
  start?: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const items = el.querySelectorAll('[data-reveal]')
      const targets = items.length ? items : el
      gsap.matchMedia().add(MQ.motionOk, () => {
        // opacity, not autoAlpha: visibility:hidden would drop the links inside from the Tab order until they scroll in
        gsap.set(targets, { opacity: 0, y })
        revealOnScroll(gsap.to(targets, { opacity: 1, y: 0, duration, delay, stagger, ease }), el, `clamp(${start})`)
      })
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

export function Noise({ className = 'opacity-25' }: { className?: string }) {
  return <div aria-hidden className={`noise pointer-events-none absolute inset-0 ${className}`} />
}

// Extruded block: a side and a top face hung off the element, so a flat card reads as a building.
// `faces` is a palette triplet [front, side, top].
export function Faces({ faces }: { faces: string[] }) {
  return (
    <>
      <div aria-hidden className="face-side absolute bottom-0 left-full w-5" style={{ background: faces[1], height: 'calc(100% + 18px)' }} />
      <div aria-hidden className="face-top absolute bottom-full left-0 h-[18px] w-[calc(100%+20px)]" style={{ background: `linear-gradient(rgb(255 255 255/.16),rgb(255 255 255/.02)),${faces[2]}` }} />
    </>
  )
}

// Circuit traces etched into a frame's top band: [path, end dot] pairs, three layouts in rotation
const TRACES = [
  [
    ['M14 24h62l10 10h92', [178, 34]],
    ['M128 48h70l9-9h52', [259, 39]],
    ['M30 48h44', [74, 48]],
  ],
  [
    ['M0 40h50l12-12h104', [166, 28]],
    ['M186 16h36l10 10h28', [260, 26]],
    ['M92 52h76', [168, 52]],
  ],
  [
    ['M22 16h112l10 10h64', [208, 26]],
    ['M0 48h88l9-9h48', [145, 39]],
    ['M200 50h54', [254, 50]],
  ],
] as const

// Circuit frame: a gradient card with circuit traces across its top band and a light window
// cut at 45° bottom-right. Sized in container units so any aspect ratio (set via className) keeps the proportions.
export function CircuitFrame({ background, traces = 0, className = '', children }: { background: string; traces?: number; className?: string; children: ReactNode }) {
  return (
    <div className={`@container relative w-full [clip-path:polygon(0_0,100%_0,100%_calc(100%-16px),calc(100%-16px)_100%,0_100%)] ${className}`} style={{ background }}>
      <Noise className="opacity-40" />
      <svg aria-hidden viewBox="0 0 273 62" className="absolute inset-x-0 top-0 w-full text-white/75" fill="none" stroke="currentColor" strokeWidth="2.5">
        {TRACES[traces % TRACES.length].map(([d, [cx, cy]]) => (
          <g key={d}>
            <path d={d} />
            <circle cx={cx} cy={cy} r="4.5" fill="currentColor" stroke="none" />
          </g>
        ))}
      </svg>
      <div className="absolute top-[22.7cqw] right-[3.05cqw] bottom-[4.1cqw] left-[3.8cqw] grid place-items-center overflow-hidden bg-[#f3f2f1] [clip-path:polygon(0_0,100%_0,100%_calc(100%-min(18cqw,56px)),calc(100%-min(18cqw,56px))_100%,0_100%)]">
        {children}
        <Noise className="opacity-25" />
      </div>
    </div>
  )
}
