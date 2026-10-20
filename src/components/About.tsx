import { useRef } from 'react'
import { profile } from '../content'
import { gsap, MQ, useGSAP } from '../lib/motion'
import Education from './Education'
import { Tag } from './ui'

// Hand-set lines per breakpoint (words per line), so each sentence
// starts on its own line instead of wherever natural wrapping leaves it
const words = profile.tagline.split(' ')
const toLines = (counts: number[]) => {
  // Fail loudly when the tagline changes: a count that no longer adds up would silently drop or blank words
  if (counts.reduce((a, b) => a + b) !== words.length) throw new Error(`About: line counts [${counts}] don't add up to the tagline's ${words.length} words`)
  let at = 0
  return counts.map((n) => words.slice(at, (at += n)).join(' '))
}
const layouts = [
  { lines: toLines([6, 5, 8, 6, 6, 6, 4]), className: 'hidden text-[min(56px,4.65cqi)] leading-[1.08] lg:block' },
  { lines: toLines([5, 4, 5, 5, 4, 4, 4, 5, 3, 2]), className: 'hidden text-[min(48px,6.5cqi)] leading-[1.08] md:max-lg:block' },
  { lines: toLines([4, 2, 3, 2, 4, 4, 2, 3, 2, 2, 3, 4, 3, 3]), className: 'block text-[min(48px,8.6cqi)] leading-[1.12] md:hidden' },
]

// Pinned statement: each letter rises 0.32em and fades in on a staggered scrub, then a second staggered pass warms
// it from faint grey to ink. Tablet and desktop scrub across the whole pinned block, phones across the copy itself.
function Statement() {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const wrap = ref.current
      if (!wrap) return
      const pin = wrap.querySelector('[data-statement-pin]')
      // Every breakpoint is a condition so the scrub is rebuilt for the line set that is showing.
      // A conditions object only runs when at least one matches, so motionOk keeps tablet covered.
      gsap.matchMedia().add({ desktop: MQ.desktop, mobile: MQ.mobile, motionOk: MQ.motionOk }, (ctx) => {
        const { mobile, motionOk } = ctx.conditions as { mobile: boolean; motionOk: boolean }
        if (!motionOk) return
        const chars = gsap.utils.toArray<HTMLElement>('[data-char]', wrap).filter((c) => c.offsetParent)
        gsap.set(chars, { autoAlpha: 0, y: '0.32em', color: '#565666' })
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: mobile ? { trigger: pin, start: 'top 75%', end: 'bottom 55%', scrub: true } : { trigger: wrap, start: 'top 88%', end: 'bottom bottom', scrub: true },
          })
          .to(chars, { autoAlpha: 1, y: 0, duration: 0.28, stagger: { amount: 0.52 } }, 0.03)
          .to(chars, { color: '#fbfaf9', duration: 0.24, stagger: { amount: 0.52 } }, 0.24)
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="md:h-[155svh] md:motion-reduce:h-auto lg:h-[170svh] lg:motion-reduce:h-auto">
      <div
        data-statement-pin
        className="shell flex min-h-svh flex-col justify-start pt-[16svh] pb-24 md:sticky md:top-0 md:h-svh md:min-h-0 md:justify-center md:pt-0 md:pb-[16svh] motion-reduce:static motion-reduce:h-auto motion-reduce:min-h-0 motion-reduce:pt-28"
      >
        <div className="@container max-w-[75.5rem]">
          <Tag className="mb-12 md:mb-[72px]">About</Tag>
          <p className="font-sans font-semibold tracking-[-0.03em]">
            <span className="sr-only">{profile.tagline}</span>
            {layouts.map(({ lines, className }) => (
              <span key={className} aria-hidden className={className}>
                {lines.map((line) => (
                  <span key={line} className="block whitespace-nowrap">
                    {[...line].map((c, k) =>
                      c === ' ' ? (
                        ' '
                      ) : (
                        <span key={k} data-char className="inline-block">
                          {c}
                        </span>
                      ),
                    )}
                  </span>
                ))}
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function About() {
  return (
    // Slides up over the pinned hero; its background fades in over the first 20svh (a gradient, not a mask,
    // so the browser never re-composites a full-height mask while the statement animates)
    <section
      id="about"
      className="relative z-10 -mt-[35svh] bg-[linear-gradient(to_bottom,transparent,var(--color-surface)_20svh)] motion-reduce:mt-0 motion-reduce:bg-surface md:-mt-[48svh] md:motion-reduce:mt-0"
    >
      <h2 className="sr-only">About</h2>
      <Statement />

      <Education />
    </section>
  )
}
