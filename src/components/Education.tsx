import { useRef } from 'react'
import { education, palettes } from '../content'
import { EASE, gsap, MQ, useGSAP } from '../lib/motion'
import { Faces, Noise, Tag } from './ui'

type School = (typeof education)[number]
const PALETTE = [2, 4, 1] // one gradient per school, newest first; the timeline renders oldest first, hence PALETTE[2 - i]
const yearsOf = (period: string) => period.match(/\d{4}/g)!

// School crest on a white chamfered tile (the source logos are drawn on white)
function Crest({ school, className }: { school: School; className: string }) {
  return (
    <span className={`chamfer grid shrink-0 place-items-center bg-white p-[3px] [--c:5px] ${className}`}>
      <img src={school.logo} alt="" loading="lazy" decoding="async" className="size-full object-contain" />
    </span>
  )
}

// Campus skyline: one extruded tower per school, oldest to newest, each taller than the last so the line
// climbs as the schooling does. Scrolling raises the towers out of the dated ground line, then fades their copy in.
// Hovering a tower lifts it and dims the rest (only while a tower is under the cursor, not the empty sky).
const TOWERS = [0.64, 0.82, 1]

export default function Education() {
  const root = useRef<HTMLDivElement>(null)
  const timeline = [...education].reverse()

  useGSAP(
    () => {
      gsap.matchMedia().add(MQ.motionOk, () => {
        const towers = gsap.utils.toArray<HTMLElement>('[data-edu-tower]', root.current)
        const copy = gsap.utils.toArray<HTMLElement>('[data-edu-copy]', root.current)
        gsap.set(towers, { scaleY: 0, transformOrigin: '50% 100%' })
        // opacity, not autoAlpha: visibility:hidden would also hide the school names and dates from screen readers
        gsap.set(copy, { opacity: 0, y: 12 })
        // Scrubbed while the skyline scrolls into view: the towers start rising as its top enters and are fully up
        // once its ground line is on screen, then sink back the same way when scrolling up
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: 'top 95%', end: 'bottom 92%', scrub: 0.5 } })
          .to(towers, { scaleY: 1, duration: 0.9, ease: 'power2.out', stagger: 0.12 })
          .to(copy, { opacity: 1, y: 0, duration: 0.4, ease: EASE.editorial, stagger: 0.05 }, 0.55)
      })
    },
    { scope: root },
  )

  return (
    <div className="shell flex flex-col gap-14 py-20 lg:flex-row lg:items-end lg:gap-20 lg:py-28">
      <div className="lg:w-[38%] lg:pb-6">
        <div className="flex flex-col gap-8">
          <Tag>Education</Tag>
          <h2 className="h2">Where I’ve studied</h2>
          <p className="body-lg max-w-[420px] text-ink-dim">
            I’m pursuing a B.Tech in Computer Science at {education[0].institution}, graduating in 2027. Before that, I did my senior secondary at {education[1].institution} and my secondary schooling
            at {education[2].institution}.
          </p>
        </div>
      </div>
      <div ref={root} className="w-full lg:w-auto lg:flex-1">
        <div className="group/sky flex h-[400px] w-full items-end gap-5 pr-5 pt-4 md:h-[480px] md:gap-7">
          {timeline.map((s, i) => {
            const p = palettes[PALETTE[2 - i]]
            return (
              <div
                key={s.institution}
                data-edu-tower
                className="relative flex-1 transition-[opacity,translate] duration-300 ease-out still:pointer-fine:group-has-[[data-edu-tower]:hover]/sky:opacity-55 still:pointer-fine:hover:!opacity-100 still:motion-safe:pointer-fine:hover:-translate-y-2"
                style={{ height: `${TOWERS[i] * 100}%` }}
              >
                <Faces faces={p} />
                <div className="absolute inset-0 overflow-hidden text-void" style={{ background: p[0] }}>
                  <Noise className="opacity-40" />
                  <div className="relative p-3 md:p-5">
                    <div data-edu-copy className="flex flex-col gap-1.5">
                      <Crest school={s} className="mb-2 size-11 md:mb-3 md:size-16" />
                      <span className="font-sans text-[15px] leading-5 font-semibold tracking-[-0.02em] md:text-xl md:leading-6">{s.institution}</span>
                      <span className="sr-only">, {s.period}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {/* Ground line with the years each school began, and the graduation year at the far end */}
        <div aria-hidden data-edu-copy className="relative mr-5 mt-3 border-t border-hairline pt-3">
          <div className="flex gap-5 md:gap-7">
            {timeline.map((s) => (
              <span key={s.institution} className="mono flex-1 text-ink-dim">
                {yearsOf(s.period)[0]}
              </span>
            ))}
          </div>
          <span className="mono absolute top-3 right-0 text-ink-dim">{yearsOf(timeline[timeline.length - 1].period)[1]}</span>
        </div>
      </div>
    </div>
  )
}
