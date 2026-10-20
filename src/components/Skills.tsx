import { useRef, useState, type ComponentProps } from 'react'
import { palettes, skillGroups, skills, toolkitCaption } from '../content'
import { EASE, gsap, MQ, ScrollTrigger, useGSAP } from '../lib/motion'
import { CircuitFrame, Reveal, Tag } from './ui'

type Tool = (typeof skills)[number]
type Filter = 'all' | Tool['group']

// Toolkit grid: filter tabs, a caption and framed cards holding each tool's logo. Every tool fits on one page, so the
// cards are small and the rows long.

// Gradients step 3 through the palette, offset every 5 cards, so side-by-side cards never share a colour
function Frame({ tool, index }: { tool: Tool; index: number }) {
  return (
    <div className="relative transition-transform duration-200 ease-out motion-safe:pointer-fine:group-hover:-translate-y-1">
      <CircuitFrame background={palettes[(index * 3 + Math.floor(index / 5)) % palettes.length][0]} traces={index} className="aspect-[273/329]">
        {/* Logos sit in the window in greyscale and take their colour on hover */}
        <img
          src={tool.icon}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-[46%] object-contain mix-blend-multiply grayscale transition-[filter] duration-300 group-hover:grayscale-0 group-focus-visible:grayscale-0"
        />
      </CircuitFrame>
      <span
        aria-hidden
        className="absolute top-1.5 right-1.5 inline-flex size-[18px] items-center justify-center border border-hairline-onpaper bg-white transition-opacity duration-200 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-visible:opacity-100"
      >
        <svg viewBox="0 0 12 12" className="size-2.5">
          <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </span>
    </div>
  )
}

function Toggle({ on, ...props }: ComponentProps<'button'> & { on: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={`mono cursor-pointer border px-3 py-[7px] transition-colors duration-150 ${on ? 'border-ink-onpaper bg-ink-onpaper text-paper' : 'border-hairline-onpaper text-dim-onpaper hover:text-ink-onpaper'}`}
    />
  )
}

export default function Skills() {
  const grid = useRef<HTMLUListElement>(null)
  const changed = useRef(false)
  const [filter, setFilter] = useState<Filter>('all')
  const shown = filter === 'all' ? skills : skills.filter((s) => s.group === filter)

  // First arrival: the cards rise in a stagger once the grid scrolls into view
  useGSAP(
    () => {
      gsap.matchMedia().add(MQ.motionOk, () => {
        const cards = grid.current!.children
        // opacity, not autoAlpha: visibility:hidden would drop the links inside from the Tab order until they scroll in
        gsap.set(cards, { opacity: 0, y: 24 })
        ScrollTrigger.create({
          trigger: grid.current,
          start: 'clamp(top 85%)',
          once: true,
          onEnter: () => gsap.to(cards, { opacity: 1, y: 0, duration: 0.6, ease: EASE.editorial, stagger: 0.025 }),
        })
      })
    },
    { scope: grid },
  )

  // Switching filter re-deals the cards with a quicker version of the same rise
  useGSAP(
    () => {
      if (!changed.current) return
      // The grid's height just changed, so every trigger below it (Connect's reveal, the header theme, the spine) is stale
      ScrollTrigger.refresh()
      if (window.matchMedia(MQ.reduced).matches) return
      gsap.fromTo(grid.current!.children, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: EASE.editorial, stagger: 0.02, overwrite: true })
    },
    { dependencies: [filter], scope: grid },
  )

  const choose = (next: Filter) => {
    changed.current = true
    setFilter(next)
  }

  return (
    <section id="skills" className="relative bg-paper text-ink-onpaper">
      <div className="shell pt-32 pb-28 lg:pb-40">
        <Reveal y={18} duration={0.6} start="top 75%" className="flex flex-col">
          <div data-reveal>
            <Tag onPaper>Toolkit</Tag>
          </div>
          <h2 data-reveal className="h2 mt-10 max-w-[880px] md:mt-[58px]">
            The stack
            <br />I build with
          </h2>
          <div data-reveal className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div role="group" aria-label="Filter tools" className="flex flex-wrap gap-2">
              <Toggle on={filter === 'all'} aria-pressed={filter === 'all'} onClick={() => choose('all')}>
                Everything
              </Toggle>
              {skillGroups.map((g) => (
                <Toggle key={g.id} on={filter === g.id} aria-pressed={filter === g.id} onClick={() => choose(g.id)}>
                  {g.label}
                </Toggle>
              ))}
            </div>
            <p className="max-w-[460px] text-base leading-6 text-pretty text-dim-onpaper md:ml-auto md:text-right" aria-live="polite">
              {skillGroups.find((g) => g.id === filter)?.caption ?? toolkitCaption}
            </p>
          </div>
        </Reveal>

        <ul ref={grid} className="mt-10 grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-9">
          {shown.map((tool) => (
            <li key={tool.name}>
              <a href={tool.href} target="_blank" rel="noopener noreferrer" className="group flex flex-col focus-visible:outline-offset-4">
                <Frame tool={tool} index={skills.indexOf(tool)} />
                <p className="mt-3 text-[15px] leading-5 md:text-base md:leading-6">{tool.name}</p>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
