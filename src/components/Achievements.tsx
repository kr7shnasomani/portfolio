import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { achievements, orgs } from '../content'
import { EASE, gsap, lockScroll, MQ, revealOnScroll, useGSAP } from '../lib/motion'
import { Noise, Reveal, Tag } from './ui'

type Achievement = (typeof achievements)[number]

// An organisation named in a description: its icon on a white tile (the marks are drawn for light backgrounds) and its
// name, linking to its site. The icon is kept on the same line as the first word so it never strands at a line end.
function Org({ id }: { id: string }) {
  const org = orgs[id]
  if (!org) throw new Error(`Achievements: no organisation "${id}" in content.ts`)
  const [first, ...rest] = org.name.split(' ')
  const name = (
    <>
      <span className="whitespace-nowrap">
        {org.logo && (
          // Square marks sit in a square tile; wider ones (Bank of India's BOI lockup) widen it rather than shrinking
          <span aria-hidden className="chamfer mr-2 ml-0.5 inline-flex h-[1.3em] min-w-[1.3em] items-center justify-center bg-white p-[3px] align-[-0.3em] [--c:3px]">
            <img src={org.logo} alt="" loading="lazy" decoding="async" className="h-full w-auto max-w-[3em] object-contain" />
          </span>
        )}
        {first}
      </span>
      {rest.length > 0 && ` ${rest.join(' ')}`}
    </>
  )
  if (!org.href) return name
  return (
    <a href={org.href} target="_blank" rel="noopener noreferrer" className="text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink">
      {name}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

// Descriptions write organisations as {key}; split those out into linked names
const describe = (text: string) => text.split(/\{(\w+)\}/).map((part, i) => (i % 2 ? <Org key={i} id={part} /> : part))

export default function Achievements() {
  const ref = useRef<HTMLElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const [viewing, setViewing] = useState<Achievement | null>(null)
  const view = (a: Achievement) => {
    // Render the title and photo before opening, so the dialog has its name when focus lands in it
    flushSync(() => setViewing(a))
    dialog.current?.showModal()
    lockScroll(true)
  }

  // Copy rises in a stagger, and the photo follows
  // a beat later from further down on the heavier panel ease
  useGSAP(
    () => {
      gsap.matchMedia().add(MQ.motionOk, () => {
        for (const article of gsap.utils.toArray<HTMLElement>('[data-profile]', ref.current)) {
          const copy = article.querySelectorAll('[data-profile-copy]')
          const shot = article.querySelector('[data-profile-shot]')
          // opacity, not autoAlpha: visibility:hidden would drop the photo button from the Tab order until it scrolls in
          gsap.set(copy, { opacity: 0, y: 16 })
          gsap.set(shot, { opacity: 0, y: 40 })
          const enter = gsap.timeline().to(copy, { opacity: 1, y: 0, duration: 0.6, ease: EASE.editorial, stagger: 0.08 }).to(shot, { opacity: 1, y: 0, duration: 0.7, ease: EASE.panel }, 0.12)
          revealOnScroll(enter, article, 'clamp(top 70%)')
        }
      })
    },
    { scope: ref },
  )

  return (
    <section ref={ref} id="achievements" className="relative overflow-x-clip bg-surface">
      <div className="shell py-32 lg:py-[190px]">
        <Reveal className="mb-20 flex flex-col gap-8 lg:mb-28">
          <Tag>Achievements</Tag>
          <h2 className="h2 max-w-[760px]">Built under the clock</h2>
        </Reveal>

        {/* Photo and copy share the content column as two equal halves, so each entry sits centred under the
            section heading rather than hanging off the page edge */}
        <div className="flex flex-col gap-28 lg:gap-40">
          {achievements.map((a) => (
            <article key={a.title} data-profile className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div data-profile-shot className="relative aspect-[680/520] w-full overflow-hidden bg-void lg:aspect-auto lg:h-[440px]">
                <button type="button" onClick={() => view(a)} className="group absolute inset-0 cursor-zoom-in">
                  <img src={a.image} alt={a.title} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" style={{ objectPosition: a.focus }} />
                  <Noise className="opacity-30" />
                  <span className="chamfer mono absolute right-3 bottom-3 bg-void/80 px-2.5 py-1.5 text-ink opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                    View full ↗
                  </span>
                  <span className="sr-only">View the {a.title} photo full size</span>
                </button>
              </div>
              <div className="flex flex-col gap-8">
                <div data-profile-copy>
                  <Tag>{a.date}</Tag>
                </div>
                {/* Half-column titles step down until xl so the longest word ("University") fits at 1024 */}
                <h3 data-profile-copy className="h2 lg:max-xl:text-[44px]">
                  {a.title}
                </h3>
                <p data-profile-copy className="body-lg leading-8 text-ink-dim">
                  <span className="text-ink">{a.highlight}</span> {describe(a.description)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
      {/* Full-size view; the native dialog handles focus and Escape, and a backdrop click closes it via onClick */}
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- the backdrop click is a mouse shortcut; Escape closes it from the keyboard */}
      <dialog
        ref={dialog}
        aria-label={viewing?.title}
        onClose={() => {
          setViewing(null)
          lockScroll(false)
        }}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="m-auto max-h-none max-w-none overscroll-contain bg-transparent p-4 backdrop:bg-void/85"
      >
        {/* Close sits in the screen's top-right corner, where people look for it */}
        <button
          type="button"
          aria-label="Close"
          onClick={() => dialog.current?.close()}
          className="chamfer fixed top-4 right-4 grid size-11 cursor-pointer place-items-center bg-white/12 text-ink transition-colors hover:bg-ink hover:text-void md:top-6 md:right-6"
        >
          <svg aria-hidden viewBox="0 0 12 12" className="size-3.5">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        {viewing && (
          <figure className="flex flex-col items-center gap-4">
            <img src={viewing.full ?? viewing.image} alt={viewing.title} className="max-h-[82svh] max-w-[min(92vw,1400px)] object-contain" />
            <figcaption className="mono text-ink-dim">{viewing.title}</figcaption>
          </figure>
        )}
      </dialog>
    </section>
  )
}
