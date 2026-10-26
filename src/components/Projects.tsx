import { useRef } from 'react'
import { palettes, projects } from '../content'
import { EASE, gsap, MQ, useGSAP } from '../lib/motion'
import { useSwipeRow } from '../lib/swipe'
import { Noise, Reveal, SwipeControls, Tag } from './ui'

// Glow per card from the site's warm palettes (the hero sunset's gold, pink and violet): the project marks are
// all orange-red, and the cool blue and mint gradients turned muddy behind them
const TONE = [3, 4, 3, 4]

function Card({ index, featured, wide }: { index: number; featured?: boolean; wide?: boolean }) {
  const project = projects[index]
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      data-project-featured={featured || undefined}
      className={`group relative flex h-full flex-col overflow-hidden pt-48 transition-[translate] duration-200 ease-out motion-safe:pointer-fine:hover:-translate-y-0.5 lg:block lg:pt-0 ${featured ? 'lg:aspect-[2/1] xl:aspect-auto' : wide ? 'lg:aspect-[2/1]' : 'lg:aspect-square'}`}
    >
      {/* Hairline frame with a cut bottom-right corner */}
      <span aria-hidden className="notch absolute inset-0 bg-white/8 [--n:24px]" />
      <span aria-hidden className="notch absolute inset-px bg-raised [--n:24px]" />
      {/* The project's own mark fills the card, lit from behind by a palette glow */}
      <span aria-hidden className="notch absolute inset-px overflow-hidden [--n:24px]">
        <span className="grid-lines absolute inset-0 opacity-40" />
        <span className="absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_55%_at_50%_38%,black,transparent)]" style={{ background: palettes[TONE[index % TONE.length]][0] }} />
        {/* Swipe-row cards reserve the top 12rem for the mark and lay the caption out below it, so a longer
            description makes the card taller instead of sliding over the logo */}
        <span className="absolute inset-x-0 top-0 grid h-48 place-items-center lg:bottom-[22%] lg:h-auto">
          <img
            src={project.logo}
            alt=""
            loading="lazy"
            decoding="async"
            className="max-h-[70%] max-w-[60%] object-contain transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.06]"
          />
        </span>
        <Noise className="opacity-25" />
      </span>

      <span
        aria-hidden
        className="absolute top-5 right-5 z-10 leading-4 text-ink transition-transform duration-200 ease-out motion-safe:pointer-fine:group-hover:translate-x-[3px] motion-safe:pointer-fine:group-hover:-translate-y-[3px] md:top-6 md:right-6"
      >
        ↗
      </span>
      {/* Frosted glass with the name; on hover (or focus) it opens to show the description. Touch screens have
          no hover, so there it stays open */}
      <span className="chamfer relative mx-3 mt-auto mb-3 flex flex-col bg-void/55 px-4 py-3.5 backdrop-blur-md [--c:10px] lg:absolute lg:inset-x-4 lg:bottom-4 lg:m-0 lg:px-5 lg:py-4">
        <span aria-hidden className="chamfer pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgb(255_255_255/.14)] [--c:10px]" />
        <span className={`relative font-sans text-[20px] leading-7 font-semibold tracking-[-0.02em] text-ink ${featured ? 'lg:text-[30px] lg:leading-9' : 'lg:text-[22px]'}`}>{project.title}</span>
        <span className="relative grid grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out pointer-fine:grid-rows-[0fr] pointer-fine:group-hover:grid-rows-[1fr] pointer-fine:group-focus-visible:grid-rows-[1fr] motion-reduce:transition-none">
          <span className="overflow-hidden">
            <span className={`block pt-2 text-sm leading-5 text-ink/80 ${featured ? 'lg:text-base lg:leading-6' : 'lg:line-clamp-3'}`}>{project.description}</span>
          </span>
        </span>
        <span className="sr-only"> on GitHub (opens in a new tab)</span>
      </span>
    </a>
  )
}

export default function Projects() {
  const ref = useRef<HTMLElement>(null)
  const { row, rowClass, at, go } = useSwipeRow(projects.length)

  // The featured card leans toward the pointer
  useGSAP(
    () => {
      const card = ref.current?.querySelector<HTMLElement>('[data-project-featured]')
      if (!card) return
      gsap.matchMedia().add(`${MQ.motionOk} and (hover: hover) and (pointer: fine)`, () => {
        gsap.set(card, { transformPerspective: 800 })
        const tiltX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: EASE.physical })
        const tiltY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: EASE.physical })
        const onMove = (e: MouseEvent) => {
          const r = card.getBoundingClientRect()
          tiltX(-4 * ((e.clientY - r.top) / r.height - 0.5))
          tiltY(4 * ((e.clientX - r.left) / r.width - 0.5))
        }
        const onLeave = () => {
          tiltX(0)
          tiltY(0)
        }
        card.addEventListener('mousemove', onMove, { passive: true })
        card.addEventListener('mouseleave', onLeave)
        return () => {
          card.removeEventListener('mousemove', onMove)
          card.removeEventListener('mouseleave', onLeave)
        }
      })
    },
    { scope: ref },
  )

  return (
    <section ref={ref} id="projects" className="relative bg-surface pt-20 pb-20 md:pt-32 md:pb-32 lg:pt-[200px] lg:pb-[200px]">
      <div className="shell">
        <Reveal y={18} duration={0.6} stagger={0.08} start="top 75%" className="mb-14 flex flex-col gap-8 lg:mb-20">
          <div data-reveal>
            <Tag>Projects</Tag>
          </div>
          <h2 data-reveal className="h2 max-w-[640px]">
            Things I’ve built
          </h2>
        </Reveal>
        {/* Desktop: the featured card spans a 2×2 block at xl and a full-width 2:1 row at lg. Below that the cards
            are tall tiles in a swipe row, all as tall as the longest: touch screens always show the description, and
            each card has room for it under the logo */}
        <Reveal start="top 82%">
          <ul {...row} className={`${rowClass} lg:grid lg:grid-cols-2 lg:gap-6 xl:grid-cols-4`}>
            {projects.map((p, i) => (
              // The last card spans two columns so the four fill the featured block's 2×2 grid without a gap
              <li
                key={p.title}
                data-reveal
                className={`w-[78%] shrink-0 snap-start sm:w-[44%] md:w-[36%] lg:w-auto ${i === 0 ? 'lg:col-span-2 xl:row-span-2' : i === projects.length - 1 ? 'lg:col-span-2' : ''}`}
              >
                <Card index={i} featured={i === 0} wide={i > 0 && i === projects.length - 1} />
              </li>
            ))}
          </ul>
        </Reveal>
        <SwipeControls at={at} count={projects.length} go={go} noun="project" />
      </div>
    </section>
  )
}
