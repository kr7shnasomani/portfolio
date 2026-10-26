import { useRef, useState } from 'react'
import { experience } from '../content'
import { EASE, gsap, MQ, revealOnScroll, ScrollTrigger, scrollToY, useGSAP } from '../lib/motion'
import { Noise, Tag } from './ui'

// Route map: a metro line through the three cities worked in, oldest stop first. On desktop the section
// pins and scroll drives a train along the line. Each chamfered station lights up in the line's colour once the train
// reaches it, and clicking one rides there. Beside the map each job is a card, and the cards pile up with the ride:
// as the train nears a stop, its card rises over the last one, which sinks back and dims, landing as the train
// arrives. It is all tied to scroll, so riding back peels them off in step.
// Below wide screens the stops become cards along a vertical line, newest first, each keeping its highlights behind
// a disclosure so the section stays a few screens long on a phone.

type Job = (typeof experience)[number]
const cityOf = (job: Job) => job.location.split(' · ')[0]

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

// The desktop card's highlights: numbered, with hairlines between them
function Points({ job }: { job: Job }) {
  return (
    <ol>
      {job.points.map((point, i) => (
        <li key={point} className="grid grid-cols-[2.25rem_minmax(0,1fr)] border-t border-hairline py-3 short:py-2 shorter:py-1.5">
          <span className="mono pt-[3px] text-ink-dim short:pt-0.5">{String(i + 1).padStart(2, '0')}</span>
          <span className="text-sm leading-[22px] text-pretty text-ink-dim short:text-[13px] short:leading-5 shorter:text-xs shorter:leading-[17px]">{point}</span>
        </li>
      ))}
    </ol>
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
// The pinned map needs a wide screen: below this, small laptops and tablets get the card list instead, where the map's
// labels would otherwise shrink below legibility and the cards outgrow the column
const WIDE = '(min-width: 80rem)'
// Each stop takes the line's colour where it sits (the route gradient runs mint, pink, blue), for its station and its
// card's glow
const COLOR = ['#8fffc6', '#faaedf', '#6374ff']
const colorOf = (job: Job) => COLOR[stops.indexOf(job)]
// Each label (company and city) sits clear of the line: below the first stop, left of the climb, above the last
const LABEL = [
  { dx: 0, dy: 50, anchor: 'middle' },
  { dx: -38, dy: 5, anchor: 'end' },
  { dx: 0, dy: -38, anchor: 'middle' },
] as const
// The site's chamfered square (see the chamfer utility) as SVG points: half-size h, corner cut c
const chamfered = (x: number, y: number, h: number, c: number) =>
  [
    [x - h + c, y - h],
    [x + h - c, y - h],
    [x + h, y - h + c],
    [x + h, y + h - c],
    [x + h - c, y + h],
    [x - h + c, y + h],
    [x - h, y + h - c],
    [x - h, y - h + c],
  ].join(' ')
// Where along each leg the next card rises: from RISE before its station until LAND before it, so the card has settled
// by the time the train visibly docks
const RISE = 0.45
const LAND = 0.08

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

// Desktop card for one stop, built like the project and publication cards (a hairline notch frame over a grained
// panel) and lit from its top-right corner in the stop's colour
function StopPanel({ job, index }: { job: Job; index: number }) {
  return (
    <article className="relative">
      <div aria-hidden className="notch absolute inset-0 bg-white/8 [--n:32px]" />
      <div aria-hidden className="notch absolute inset-px overflow-hidden bg-raised [--n:32px]">
        <span className="grid-lines absolute inset-0 opacity-40" />
        <span className="absolute -top-1/2 -right-1/3 size-[40rem] opacity-25 [mask-image:radial-gradient(closest-side,black,transparent)]" style={{ background: colorOf(job) }} />
        <span className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgb(22_22_26/.7)_70%)]" />
        <Noise className="opacity-25" />
      </div>
      <div className="relative flex flex-col gap-5 p-9 short:gap-4 short:p-7 shorter:gap-3 shorter:p-6">
        {/* City as a tag and the dates beside it, each kept whole so the pair wraps cleanly */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Tag>{cityOf(job)}</Tag>
            <span className="mono whitespace-nowrap text-ink-dim">{job.period}</span>
          </div>
          <span className="mono text-ink-dim">
            {String(index + 1).padStart(2, '0')} / {String(stops.length).padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Logo job={job} className="size-12 shorter:size-10" />
          <div className="flex flex-col">
            <span className="h3 text-[28px] leading-9 xl:text-[32px] xl:leading-10 short:text-[26px] short:leading-8 shorter:text-[22px] shorter:leading-7">{job.role}</span>
            <span className="text-base text-ink-dim">{job.company}</span>
          </div>
        </div>
        <p className="text-base leading-6 text-pretty text-ink-dim short:text-sm short:leading-5 shorter:text-[13px] shorter:leading-[18px]">{job.summary}</p>
        <Points job={job} />
      </div>
      {/* Darkens the card once a newer one covers it */}
      <div aria-hidden data-shade className="notch pointer-events-none absolute inset-0 bg-void opacity-0 [--n:32px]" />
    </article>
  )
}

// Phone and tablet card: dates, role, the summary, then the highlights folded away
function StopCard({ job }: { job: Job }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Tag>{cityOf(job)}</Tag>
        <span className="mono whitespace-nowrap text-ink-dim">{job.period}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="font-sans text-[24px] leading-[30px] font-semibold tracking-[-0.02em] text-balance md:text-[30px] md:leading-9">{job.role}</h3>
        <span className="text-base text-ink-dim">{job.company}</span>
      </div>
      <p className="text-[15px] leading-6 text-pretty text-ink-dim">{job.summary}</p>
      {/* Wide screens show this list to screen readers only, so there the highlights are plain text rather than a
          disclosure whose button would be an invisible Tab stop */}
      <details className="disclosure group/hl border-t border-hairline xl:hidden">
        <summary className="mono flex min-h-12 cursor-pointer list-none items-center justify-between text-ink [&::-webkit-details-marker]:hidden">
          Highlights
          <span aria-hidden className="text-base leading-none transition-transform duration-300 ease-out group-open/hl:rotate-45 motion-reduce:transition-none">
            +
          </span>
        </summary>
        <Highlights job={job} className="pb-2" />
      </details>
      <Highlights job={job} className="hidden xl:block" />
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

  useGSAP(
    () => {
      if (!path.current) return
      const p = path.current
      const total = p.getTotalLength()
      const lengths = stationLengths(p)
      const [first, , last] = lengths
      // How far along the stops the train is: 0 at the first station, 1 at the second, 1.5 halfway to the third
      const stopAt = (at: number) => {
        for (let i = 1; i < lengths.length; i++) if (at <= lengths[i]) return i - 1 + (at - lengths[i - 1]) / (lengths[i] - lengths[i - 1])
        return lengths.length - 1
      }
      const cards = gsap.utils.toArray<HTMLElement>('[data-route-stop]', pin.current)
      const deck = pin.current!.querySelector<HTMLElement>('[data-route-deck]')!
      // Measured on each ScrollTrigger refresh: how far below the deck a card starts, and how far each covered card
      // steps up, which has to fit inside the deck's top padding or the oldest card's edge would be clipped
      let rise = 0
      let peek = 0
      const measure = () => {
        rise = deck.offsetHeight
        peek = parseFloat(getComputedStyle(deck).paddingTop) / 2 - 1
      }
      const shades = cards.map((card) => card.querySelector('[data-shade]'))
      const reduced = window.matchMedia(MQ.reduced).matches
      // Each card rises solid from below the deck's clipped bottom edge over the final stretch of the leg into its
      // stop, covering the last one; every card risen above it pushes it back a step and darkens it. Reduced motion
      // swaps them in place at the midpoint instead.
      const pile = (at: number) => {
        const entered = cards.map((_, i) => (reduced ? Number(at >= i - 0.5) : gsap.utils.clamp(0, 1, (at - i + RISE) / (RISE - LAND))))
        cards.forEach((card, i) => {
          const depth = entered.slice(i + 1).reduce((sum, e) => sum + e, 0)
          const e = entered[i]
          gsap.set(card, reduced ? { autoAlpha: depth ? 0 : e } : { y: (1 - e) * rise - peek * depth, scale: 1 - 0.05 * depth, autoAlpha: e > 0 ? 1 : 0 })
          gsap.set(shades[i], { opacity: Math.min(depth, 1) * 0.35 + Math.max(depth - 1, 0) * 0.2 })
        })
      }
      const move = (progress: number) => {
        const at = first + (last - first) * progress
        const pt = p.getPointAtLength(at)
        gsap.set(train.current, { x: pt.x, y: pt.y })
        gsap.set(lit.current, { strokeDashoffset: total - at })
        const nearest = lengths.reduce((best, l, i) => (Math.abs(l - at) < Math.abs(lengths[best] - at) ? i : best), 0)
        setActive(nearest)
        pile(stopAt(at))
      }
      gsap.set(lit.current, { strokeDasharray: total })
      move(0)
      gsap.matchMedia().add(WIDE, () => {
        const st = ScrollTrigger.create({
          trigger: pin.current,
          start: 'top top',
          end: 'bottom bottom',
          onRefresh: (self) => {
            measure()
            move(self.progress)
          },
          onUpdate: (self) => move(self.progress),
        })
        // A station's place on the line maps straight back to a scroll position inside the pin
        ride.current = (i) => scrollToY(st.start + ((lengths[i] - first) / (last - first)) * (st.end - st.start))
        return () => {
          ride.current = () => {}
        }
      })
    },
    { scope: pin },
  )

  // Phone and tablet: the line fills as you scroll, each station lights once the fill reaches it, and each card
  // rises in as it arrives
  const list = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      gsap.matchMedia().add(`(max-width: 79.9999rem) and ${MQ.motionOk}`, () => {
        const wrap = list.current!
        gsap.fromTo('[data-line-fill]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: wrap, start: 'top 65%', end: 'bottom 65%', scrub: true } })
        const items = gsap.utils.toArray<HTMLElement>('[data-stop]', wrap)
        for (const item of items) {
          const station = item.querySelector('[data-station]')!
          station.classList.add('is-dim')
          ScrollTrigger.create({ trigger: item, start: 'top 65%', end: 'max', onToggle: (self) => station.classList.toggle('is-dim', !self.isActive) })
          const card = item.querySelector('[data-stop-card]')
          gsap.set(card, { opacity: 0, y: 24 })
          revealOnScroll(gsap.to(card, { opacity: 1, y: 0, duration: 0.6, ease: EASE.editorial }), item, 'top 85%')
        }
        return () => items.forEach((item) => item.querySelector('[data-station]')!.classList.remove('is-dim'))
      })
    },
    { scope: list },
  )

  return (
    <section id="experience" className="relative bg-surface py-24 xl:pt-8 xl:pb-32">
      <div className="shell xl:hidden">
        <Intro />
      </div>
      {/* Desktop: pinned map with the train driven by scroll. The heading rides in the pinned frame, so the map
          sits under it rather than centred in an otherwise empty screen */}
      <div ref={pin} className="relative hidden h-[300svh] xl:block">
        <div className="shell sticky top-0 grid h-svh grid-cols-[minmax(0,1fr)_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] gap-16 pt-24 pb-10 shorter:pt-20 shorter:pb-6">
          {/* Heading over the map in the left column; the job panel gets the right column's full height */}
          <div className="flex min-h-0 flex-col gap-10">
            <Intro />
            <svg viewBox="0 0 600 520" className="min-h-0 w-full flex-1 overflow-visible" aria-hidden>
              <path ref={path} d={ROUTE} fill="none" stroke="rgb(255 255 255/.12)" strokeWidth="10" strokeLinejoin="miter" />
              <path ref={lit} d={ROUTE} fill="none" stroke="url(#route-glow)" strokeWidth="10" strokeLinejoin="miter" />
              <defs>
                <linearGradient id="route-glow" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0" stopColor="#8fffc6" />
                  <stop offset="0.5" stopColor="#faaedf" />
                  <stop offset="1" stopColor="#6374ff" />
                </linearGradient>
              </defs>
              {/* Drawn before the stations, so on arrival the train slips under the station it has reached */}
              <g ref={train} className="pointer-events-none">
                <rect x="-9" y="-9" width="18" height="18" fill="#fbfaf9" stroke="#0f0f12" strokeWidth="3" transform="rotate(45)" />
              </g>
              {stops.map((job, i) => {
                const { x, y } = STATIONS[i]
                const reached = i <= active
                return (
                  // Mouse shortcut only: keyboard and screen-reader users get every stop in the list below
                  <g key={job.company} onClick={() => ride.current(i)} className="group/station cursor-pointer">
                    <rect x={x - 32} y={y - 32} width="64" height="64" fill="transparent" />
                    {/* The stop being shown wears a chamfered halo in its colour */}
                    <polygon points={chamfered(x, y, 22, 8)} fill="none" stroke={COLOR[i]} strokeWidth="1.5" className="transition-opacity duration-500" style={{ opacity: i === active ? 0.7 : 0 }} />
                    <polygon
                      points={chamfered(x, y, 14, 5)}
                      fill="#0f0f12"
                      stroke={reached ? '#fbfaf9' : 'rgb(255 255 255/.3)'}
                      strokeWidth="3"
                      className="transition-[stroke] duration-300 group-hover/station:stroke-ink"
                    />
                    {/* A square pixel of the stop's colour at the centre */}
                    <rect x={x - 5} y={y - 5} width="10" height="10" className="transition-[fill] duration-500" style={{ fill: reached ? COLOR[i] : 'rgb(255 255 255/.22)' }} />
                    <text
                      x={x + LABEL[i].dx}
                      y={y + LABEL[i].dy}
                      textAnchor={LABEL[i].anchor}
                      className="transition-[fill] duration-300"
                      style={{ fill: i === active ? '#fbfaf9' : '#9d9db2', font: '500 13px ui-monospace, monospace', letterSpacing: '0.18em' }}
                    >
                      {job.company.toUpperCase()} · {cityOf(job).toUpperCase()}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
          {/* Every card shares one grid cell, so the panel is as tall as the longest and nothing shifts when the job
                changes; the top padding leaves room for the covered cards' edges, and the clipped bottom edge is where
                each new card rises from. Visual only: the list below carries
                every stop for screen readers. */}
          <div aria-hidden data-route-deck className="grid self-center overflow-hidden pt-12 shorter:pt-8">
            {stops.map((job, i) => (
              <div key={job.company} data-route-stop className="col-start-1 row-start-1 origin-top">
                <StopPanel job={job} index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Below desktop: newest first, a card per stop along a metro line (kept for screen readers on desktop) */}
      <div ref={list} className="shell relative mt-12 xl:sr-only">
        <div className="relative">
          {/* The line runs through the station centres and fades out under the last card */}
          <span aria-hidden className="absolute top-5 bottom-0 left-[19px] w-0.5 bg-white/10 [mask-image:linear-gradient(black_80%,transparent)]">
            <span data-line-fill className="absolute inset-0 origin-top bg-[linear-gradient(#6374ff,#faaedf_55%,#8fffc6)]" />
          </span>
          <ol className="flex flex-col gap-14">
            {experience.map((job) => (
              <li key={job.company} data-stop className="relative pl-12 md:pl-14">
                {/* Station: a chamfered frame with a pixel of the stop's colour, centred on the card's first row */}
                <span
                  aria-hidden
                  data-station
                  className="chamfer absolute top-0 left-[7px] grid size-[26px] place-items-center bg-ink transition-[background-color,opacity] duration-300 [--c:7px] [&.is-dim]:bg-white/30 [&.is-dim]:opacity-60"
                >
                  <span className="chamfer absolute inset-[3px] bg-surface [--c:5px]" />
                  <span className="relative size-2.5" style={{ background: colorOf(job) }} />
                </span>
                <div data-stop-card>
                  <StopCard job={job} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
