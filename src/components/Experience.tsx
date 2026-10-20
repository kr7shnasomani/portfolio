import { useRef, useState } from 'react'
import { experience } from '../content'
import { EASE, gsap, MQ, ScrollTrigger, scrollToY, useGSAP } from '../lib/motion'
import { Tag } from './ui'

// Route map: a metro line through the three cities worked in, oldest stop first. On desktop the section
// pins and scroll drives a train along the line; the panel beside it shows the job at the nearest stop.
// Station logos light up once the train reaches them, and clicking one rides there.
// Below desktop the stops become a plain list along a vertical line.

type Job = (typeof experience)[number]
const cityOf = (job: Job) => job.location.split(' · ')[0]
const yearOf = (job: Job) => job.period.match(/\d{4}/)![0]

function Intro() {
  return (
    <div className="flex flex-col gap-8">
      <Tag>Experience</Tag>
      <h2 className="h2">Where I’ve shipped</h2>
    </div>
  )
}

// Company mark: the source logos are full-bleed squares, so they fill a chamfered tile
function Logo({ job, className }: { job: Job; className: string }) {
  return <img src={job.logo} alt="" loading="lazy" decoding="async" className={`chamfer shrink-0 object-cover [--c:6px] ${className}`} />
}

function Highlights({ job, className = '' }: { job: Job; className?: string }) {
  return (
    <ul className={className}>
      {job.points.map((point) => (
        <li
          key={point}
          className="text-pretty border-t border-hairline py-3 text-sm leading-[22px] text-ink-dim md:text-base md:leading-6 short:py-2 short:text-sm short:leading-5 shorter:py-1.5 shorter:text-xs shorter:leading-[17px]"
        >
          {point}
        </li>
      ))}
    </ul>
  )
}

// The line and where each station sits on it, in the SVG's 600×520 space
const ROUTE = 'M40 440 H210 L290 360 V210 L370 130 H560'
const STATIONS = [
  { x: 120, y: 440 },
  { x: 290, y: 285 },
  { x: 480, y: 130 },
]
const stops = [...experience].reverse()
// Each city label sits clear of the line: below the first stop, left of the climb, above the last
const LABEL = [
  { dx: 0, dy: 44, anchor: 'middle' },
  { dx: -30, dy: 5, anchor: 'end' },
  { dx: 0, dy: -30, anchor: 'middle' },
] as const

// Distance along the path nearest to each station, found by sampling once
function stationLengths(p: SVGPathElement) {
  const total = p.getTotalLength()
  return STATIONS.map(({ x, y }) => {
    let best = 0
    let bestD = Infinity
    for (let l = 0; l <= total; l += 2) {
      const pt = p.getPointAtLength(l)
      const d = (pt.x - x) ** 2 + (pt.y - y) ** 2
      if (d < bestD) [best, bestD] = [l, d]
    }
    return best
  })
}

function StopBody({ job }: { job: Job }) {
  return (
    <div className="flex flex-col gap-6 short:gap-4 shorter:gap-3">
      {/* City as a tag and the dates beside it, each kept whole so the pair wraps cleanly on narrow screens */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Tag>{cityOf(job)}</Tag>
        <span className="mono whitespace-nowrap text-ink-dim">{job.period}</span>
      </div>
      <div className="flex items-center gap-4">
        <Logo job={job} className="size-12" />
        <div className="flex flex-col">
          <span className="h3 text-[26px] leading-8 md:text-[34px] md:leading-10 short:text-[28px] short:leading-8 shorter:text-2xl shorter:leading-7">{job.role}</span>
          <span className="text-base text-ink-dim">{job.company}</span>
        </div>
      </div>
      <p className="text-pretty text-base leading-6 text-ink-dim short:text-sm short:leading-5 shorter:text-[13px] shorter:leading-[18px]">{job.summary}</p>
      <Highlights job={job} />
    </div>
  )
}

export default function Experience() {
  const pin = useRef<HTMLDivElement>(null)
  const path = useRef<SVGPathElement>(null)
  const lit = useRef<SVGPathElement>(null)
  const train = useRef<SVGGElement>(null)
  const ride = useRef<(i: number) => void>(() => {})
  const [active, setActive] = useState(0)
  const previous = useRef(0)

  useGSAP(
    () => {
      const p = path.current!
      const total = p.getTotalLength()
      const lengths = stationLengths(p)
      const [first, , last] = lengths
      const move = (progress: number) => {
        const at = first + (last - first) * progress
        const pt = p.getPointAtLength(at)
        gsap.set(train.current, { x: pt.x, y: pt.y })
        gsap.set(lit.current, { strokeDashoffset: total - at })
        const nearest = lengths.reduce((best, l, i) => (Math.abs(l - at) < Math.abs(lengths[best] - at) ? i : best), 0)
        setActive(nearest)
      }
      gsap.set(lit.current, { strokeDasharray: total })
      move(0)
      gsap.matchMedia().add(MQ.desktop, () => {
        const st = ScrollTrigger.create({ trigger: pin.current, start: 'top top', end: 'bottom bottom', onUpdate: (self) => move(self.progress) })
        // A station's place on the line maps straight back to a scroll position inside the pin
        ride.current = (i) => scrollToY(st.start + ((lengths[i] - first) / (last - first)) * (st.end - st.start))
        return () => {
          ride.current = () => {}
        }
      })
    },
    { scope: pin },
  )

  // The details panel re-deals whenever the train reaches a new stop, rising when riding on and dropping when
  // riding back, so it follows the direction of travel
  useGSAP(
    () => {
      const dir = active >= previous.current ? 1 : -1
      previous.current = active
      const panels = gsap.utils.toArray<HTMLElement>('[data-route-stop]', pin.current)
      panels.forEach((el, i) => {
        gsap.set(el, { autoAlpha: i === active ? 1 : 0 })
      })
      if (window.matchMedia(MQ.reduced).matches) return
      gsap.fromTo(panels[active].children[0].children, { autoAlpha: 0, y: 14 * dir }, { autoAlpha: 1, y: 0, duration: 0.45, ease: EASE.editorial, stagger: 0.04, overwrite: true })
    },
    { dependencies: [active], scope: pin },
  )

  return (
    <section id="experience" className="relative bg-surface py-24 lg:pt-8 lg:pb-32">
      <div className="shell lg:hidden">
        <Intro />
      </div>
      {/* Desktop: pinned map with the train driven by scroll. The heading rides in the pinned frame, so the map
          sits under it rather than centred in an otherwise empty screen */}
      <div ref={pin} className="relative hidden h-[300svh] lg:block">
        <div className="shell sticky top-0 grid h-svh grid-cols-[minmax(0,1fr)_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] gap-16 pt-24 pb-10 shorter:pt-20 shorter:pb-6">
          {/* Heading over the map in the left column; the job panel gets the right column's full height */}
          <div className="flex min-h-0 flex-col gap-10">
            <Intro />
            <svg viewBox="0 0 600 520" className="min-h-0 w-full flex-1 overflow-visible" aria-hidden>
              <path ref={path} d={ROUTE} fill="none" stroke="rgb(255 255 255/.12)" strokeWidth="10" strokeLinejoin="round" />
              <path ref={lit} d={ROUTE} fill="none" stroke="url(#route-glow)" strokeWidth="10" strokeLinejoin="round" />
              <defs>
                <linearGradient id="route-glow" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0" stopColor="#8fffc6" />
                  <stop offset="0.5" stopColor="#faaedf" />
                  <stop offset="1" stopColor="#6374ff" />
                </linearGradient>
              </defs>
              {/* Drawn before the stations, so on arrival the train slips under the logo it has reached */}
              <g ref={train} className="pointer-events-none">
                <rect x="-9" y="-9" width="18" height="18" fill="#fbfaf9" stroke="#0f0f12" strokeWidth="3" transform="rotate(45)" />
              </g>
              <defs>
                {STATIONS.map((s, i) => (
                  <clipPath key={i} id={`station-${i}`}>
                    <circle cx={s.x} cy={s.y} r="19" />
                  </clipPath>
                ))}
              </defs>
              {STATIONS.map((s, i) => (
                // Mouse shortcut only: keyboard and screen-reader users get every stop in the list below
                <g key={i} onClick={() => ride.current(i)} className="group/station cursor-pointer">
                  <circle cx={s.x} cy={s.y} r="34" fill="transparent" />
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r="21"
                    fill="#0f0f12"
                    stroke={i <= active ? '#fbfaf9' : 'rgb(255 255 255/.3)'}
                    strokeWidth="3"
                    className="transition-[stroke] duration-300 group-hover/station:stroke-ink"
                  />
                  <image
                    href={stops[i].logo}
                    x={s.x - 19}
                    y={s.y - 19}
                    width="38"
                    height="38"
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#station-${i})`}
                    className="transition-opacity duration-500"
                    style={{ opacity: i <= active ? 1 : 0.18 }}
                  />
                  <text
                    x={s.x + LABEL[i].dx * 1.25}
                    y={s.y + LABEL[i].dy * 1.2}
                    textAnchor={LABEL[i].anchor}
                    fill={i === active ? '#fbfaf9' : '#9d9db2'}
                    style={{ font: '500 13px ui-monospace, monospace', letterSpacing: '0.18em' }}
                  >
                    {cityOf(stops[i]).toUpperCase()} · {yearOf(stops[i])}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          {/* Every stop is stacked in one grid cell, so the panel is as tall as the longest and nothing shifts when
                the job changes. Visual only: the list below carries every stop for screen readers. */}
          <div aria-hidden className="grid self-center">
            {stops.map((job) => (
              <div key={job.company} data-route-stop className="col-start-1 row-start-1">
                <StopBody job={job} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Below desktop: the stops as a list along a vertical line (kept for screen readers on desktop) */}
      <ol className="shell relative mt-14 flex flex-col gap-14 lg:sr-only">
        {stops.map((job) => (
          <li key={job.company} className="relative border-l border-hairline pl-8">
            <span aria-hidden className="absolute top-0.5 -left-[7px] size-[13px] rotate-45 bg-ink" />
            <StopBody job={job} />
          </li>
        ))}
      </ol>
    </section>
  )
}
