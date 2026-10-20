import { useRef } from 'react'
import { sections } from '../content'
import { gsap, MQ, ScrollTrigger, useGSAP } from '../lib/motion'

// Page-progress spine: a fill and a travelling node track the whole page,
// with a tick per section that widens once that section arrives and stays wide after (it dims if you scroll back above it).
// Difference blending turns the white line dark over the paper sections; on a 1px
// fixed line the extra compositing is negligible.
export default function Spine() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      gsap.matchMedia().add(`${MQ.desktop} and ${MQ.motionOk}`, () => {
        const whole = { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true }
        gsap.fromTo('[data-spine-progress]', { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, ease: 'none', scrollTrigger: whole })
        gsap.fromTo('[data-spine-node]', { y: 0 }, { y: () => window.innerHeight - 96 - 8, ease: 'none', scrollTrigger: whole })

        const markers = gsap.utils.toArray<HTMLElement>('[data-spine-marker]', el)
        const targets = sections.map((s) => document.getElementById(s.id))
        // Each tick sits at its section's share of the whole document. All reads happen before any write, so the
        // markers don't force a fresh layout each
        const place = () => {
          const total = document.documentElement.scrollHeight
          const track = el.clientHeight
          const tops = targets.map((section) => (section ? Math.min(0.99, (section.getBoundingClientRect().top + window.scrollY) / total) * track : null))
          tops.forEach((top, i) => {
            if (top !== null) markers[i].style.top = `${top}px`
          })
        }
        place()
        ScrollTrigger.addEventListener('refresh', place)
        targets.forEach((section, i) => {
          if (!section) return
          ScrollTrigger.create({
            trigger: section,
            start: 'top 60%',
            end: 'max',
            onToggle: (self) => gsap.to(markers[i], { opacity: self.isActive ? 1 : 0.35, scaleX: self.isActive ? 1.8 : 1, duration: 0.25, overwrite: 'auto' }),
          })
        })
        // Bow out before the closing call to action (an element, not a selector: selectors resolve inside the scope)
        gsap.to(el, { autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: document.getElementById('contact'), start: 'top 75%', end: 'top 30%', scrub: true } })
        return () => ScrollTrigger.removeEventListener('refresh', place)
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed top-12 bottom-12 left-7 z-[60] hidden w-px mix-blend-difference lg:block lg:motion-reduce:hidden">
      <div className="absolute inset-0 bg-white/15" />
      <div data-spine-progress className="absolute inset-0 bg-white/60" />
      {sections.map(({ id }) => (
        <span key={id} data-spine-marker className="absolute left-1/2 h-px w-[5px] -translate-x-1/2 bg-white/35" />
      ))}
      <span data-spine-node className="absolute top-0 left-1/2 size-2 -translate-x-1/2 bg-white/80" />
    </div>
  )
}
