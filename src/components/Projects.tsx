import { useRef } from 'react'
import { palettes, projects } from '../content'
import { EASE, gsap, MQ, useGSAP } from '../lib/motion'
import { Noise, Reveal, Tag } from './ui'

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
      className={`group relative block h-full overflow-hidden transition-[translate] duration-200 ease-out motion-safe:pointer-fine:hover:-translate-y-0.5 ${featured ? 'aspect-[4/3] md:aspect-[2/1] xl:aspect-auto' : wide ? 'aspect-[4/3] md:aspect-[2/1]' : 'aspect-square'}`}
    >
      {/* Hairline frame with a cut bottom-right corner */}
      <span aria-hidden className="notch absolute inset-0 bg-white/8 [--n:24px]" />
      <span aria-hidden className="notch absolute inset-px bg-raised [--n:24px]" />
      {/* The project's own mark fills the card, lit from behind by a palette glow */}
      <span aria-hidden className="notch absolute inset-px overflow-hidden [--n:24px]">
        <span className="grid-lines absolute inset-0 opacity-40" />
        <span className="absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_55%_at_50%_38%,black,transparent)]" style={{ background: palettes[TONE[index % TONE.length]][0] }} />
        <span className="absolute inset-x-0 top-0 bottom-[22%] grid place-items-center">
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
      <span className="chamfer absolute inset-x-3 bottom-3 flex flex-col bg-void/55 px-4 py-3.5 backdrop-blur-md [--c:10px] md:inset-x-4 md:bottom-4 md:px-5 md:py-4">
        <span aria-hidden className="chamfer pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgb(255_255_255/.14)] [--c:10px]" />
        <span
          className={`relative font-sans font-semibold tracking-[-0.02em] text-ink ${featured ? 'text-[24px] leading-8 md:text-[30px] md:leading-9' : 'text-[18px] leading-6 md:text-[22px] md:leading-7'}`}
        >
          {project.title}
        </span>
        <span className="relative grid grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out pointer-fine:grid-rows-[0fr] pointer-fine:group-hover:grid-rows-[1fr] pointer-fine:group-focus-visible:grid-rows-[1fr] motion-reduce:transition-none">
          <span className="overflow-hidden">
            <span className={`block pt-2 text-ink/80 ${featured ? 'text-sm leading-5 md:text-base md:leading-6' : 'line-clamp-3 text-sm leading-5'}`}>{project.description}</span>
          </span>
        </span>
        <span className="sr-only"> on GitHub (opens in a new tab)</span>
      </span>
    </a>
  )
}

export default function Projects() {
  const ref = useRef<HTMLElement>(null)

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
    <section ref={ref} id="projects" className="relative bg-surface pt-32 pb-32 lg:pt-[200px] lg:pb-[200px]">
      <div className="shell">
        <Reveal y={18} duration={0.6} stagger={0.08} start="top 75%" className="mb-14 flex flex-col gap-8 lg:mb-20">
          <div data-reveal>
            <Tag>Projects</Tag>
          </div>
          <h2 data-reveal className="h2 max-w-[640px]">
            Things I’ve built
          </h2>
        </Reveal>
        {/* Featured card spans a 2×2 block at xl and a full-width row below that (2:1 from md, 4:3 on phones) */}
        <Reveal start="top 82%">
          <ul className="grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-4">
            {projects.map((p, i) => (
              // The last card spans two columns so the four fill the featured block's 2×2 grid without a gap
              <li key={p.title} data-reveal className={i === 0 ? 'col-span-2 xl:row-span-2' : i === projects.length - 1 ? 'col-span-2' : ''}>
                <Card index={i} featured={i === 0} wide={i > 0 && i === projects.length - 1} />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
