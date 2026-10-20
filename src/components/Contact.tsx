import { useRef } from 'react'
import { profile, sections, socials } from '../content'
import City, { type Box } from './City'
import { EASE, gsap, MQ, pointerParallax, revealOnScroll, useGSAP } from '../lib/motion'
import { Noise, Tag } from './ui'

// Closing skyline: towers seen from street level, leaning toward a vanishing point overhead
const skyline: Box[] = [
  { x: -760, y: 380, z: -360, w: 240, h: 760, d: 220, p: 1, pattern: 'grid' },
  { x: -470, y: 470, z: -620, w: 180, h: 700, d: 180, p: 3 },
  { x: -260, y: 560, z: -820, w: 150, h: 520, d: 150, p: 0 },
  { x: 250, y: 560, z: -800, w: 160, h: 540, d: 160, p: 2 },
  { x: 480, y: 460, z: -600, w: 190, h: 720, d: 190, p: 4, pattern: 'grid' },
  { x: 780, y: 380, z: -380, w: 250, h: 780, d: 230, p: 1 },
  { x: -40, y: 640, z: -980, w: 180, h: 360, d: 180, p: 3, pattern: 'pixels' },
]
const cubes: Box[] = [
  { x: -560, y: -250, z: -300, w: 60, h: 90, d: 60, p: 3, r: [-14, 26, -10] },
  { x: 600, y: -300, z: -320, w: 56, h: 66, d: 56, p: 1, r: [12, -24, 8] },
]

const links = [...socials, { label: 'Email', href: `mailto:${profile.email}`, icon: '/socials/mail.svg', color: '#ea4335' }]

// Chamfered square holding a monochrome mark (an SVG used as a mask, so any fill shows through it):
// dim at rest, and on hover the tile lifts and turns light while the mark takes its brand colour
function SocialTile({ label, href, icon, color }: (typeof links)[number]) {
  const external = href.startsWith('http')
  return (
    <a
      href={href}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      className="group relative grid size-14 place-items-center transition-transform duration-200 ease-out motion-safe:pointer-fine:hover:-translate-y-1 md:size-16"
    >
      <span aria-hidden className="chamfer absolute inset-0 bg-white/14 transition-colors duration-200 group-hover:bg-ink" />
      <span aria-hidden className="chamfer absolute inset-px bg-surface/85 transition-colors duration-200 group-hover:bg-ink" />
      <span aria-hidden className="relative size-6 [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] md:size-[26px]" style={{ maskImage: `url('${icon}')` }}>
        {/* Brand fill fades in over the dim one by opacity, not a colour transition, so a gradient (Instagram) or a
            full-colour logo image drawn inside the same mask works too */}
        <span className="absolute inset-0 bg-ink-dim" />
        <span className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" style={{ background: color }} />
      </span>
      <span className="sr-only">
        {label}
        {external && ' (opens in a new tab)'}
      </span>
    </a>
  )
}

export function Contact() {
  const ref = useRef<HTMLElement>(null)

  // Closing call to action: grid settles, headline sheen sweeps once, copy rises in two waves,
  // while the skyline, glow and cubes are tied to scroll
  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const q = gsap.utils.selector(el)
      gsap.matchMedia().add(MQ.motionOk, () => {
        const primary = q('[data-cta-item]')
        const secondary = q('[data-cta-sub]')
        gsap.set(q('[data-cta-grid]'), { autoAlpha: 0.1, scale: 1.04, transformOrigin: '50% 100%' })
        // opacity, not autoAlpha: visibility:hidden would drop the links inside from the Tab order until they scroll in
        gsap.set(primary, { opacity: 0, y: 20 })
        gsap.set(secondary, { opacity: 0, y: 14 })
        gsap.set(q('[data-cta-headline]'), { backgroundPosition: '130% 0' })
        const enter = gsap
          .timeline()
          .to(q('[data-cta-grid]'), { autoAlpha: 0.6, scale: 1, duration: 0.9, ease: 'expo.out' })
          .to(primary, { opacity: 1, y: 0, duration: 0.6, ease: EASE.editorial, stagger: 0.08 }, 0.15)
          .to(q('[data-cta-headline]'), { backgroundPosition: '0% 0', duration: 0.9, ease: EASE.physical }, 0.35)
          .to(secondary, { opacity: 1, y: 0, duration: 0.5, ease: EASE.editorial, stagger: 0.08 }, 0.4)
        revealOnScroll(enter, el, 'clamp(top 80%)')

        gsap.fromTo(
          q('[data-cta-skyline]'),
          { yPercent: 26, scale: 1.04, transformOrigin: '50% 100%' },
          { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'clamp(top 90%)', end: 'clamp(top 20%)', scrub: true } },
        )
        gsap.fromTo(q('[data-cta-glow]'), { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'clamp(top 70%)', end: 'clamp(top 15%)', scrub: true } })
        gsap.fromTo(q('[data-cta-cubes]'), { y: 70 }, { y: -40, ease: 'none', scrollTrigger: { trigger: el, start: 'clamp(top bottom)', end: 'clamp(bottom top)', scrub: true } })

        return pointerParallax(q('[data-cta-cubes] [data-city-mouse]').map((cube, i) => ({ el: cube, range: i ? 10 : 14, duration: 0.8 })))
      })
    },
    { scope: ref },
  )

  return (
    <section ref={ref} id="contact" data-final-cta className="relative overflow-hidden bg-surface">
      <div aria-hidden data-cta-grid className="grid-lines absolute inset-0 opacity-45 [mask-image:linear-gradient(180deg,transparent,black_30rem)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#0f0f12_15%,rgba(12,12,13,0)_125%)]" />
      <div aria-hidden data-cta-glow className="cta-glow absolute inset-0" />
      <div aria-hidden data-cta-skyline className="absolute inset-0">
        <City boxes={skyline} tilt={24} origin="50% 30%" />
      </div>
      <div aria-hidden data-cta-cubes className="absolute inset-0 hidden md:block">
        <City boxes={cubes} />
      </div>
      <Noise className="opacity-25 [mask-image:linear-gradient(180deg,transparent,black)]" />

      <div className="shell relative flex min-h-[37.5rem] flex-col items-center justify-center gap-11 pt-24 pb-36 text-center lg:min-h-[56.25rem] lg:pb-64">
        <div data-cta-item>
          <Tag>Connect</Tag>
        </div>
        <h2 data-cta-item data-cta-headline className="cta-headline max-w-[1000px] text-center font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.02] uppercase">
          Running through lines of code
        </h2>
        <ul aria-label="Find me on" className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {links.map((s) => (
            <li key={s.label} data-cta-sub>
              <SocialTile {...s} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const year = new Date().getFullYear()
// Every section except the one the footer sits under
const pages = sections.filter((s) => s.id !== 'contact')

export function Footer() {
  const ref = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      gsap.matchMedia().add(MQ.motionOk, () => {
        revealOnScroll(gsap.fromTo('[data-horizon]', { scaleX: 0 }, { scaleX: 1, duration: 0.64, ease: 'expo.out' }), ref.current, 'clamp(top 90%)')
      })
    },
    { scope: ref },
  )
  return (
    <footer ref={ref} className="relative bg-void">
      <div aria-hidden data-horizon className="h-px w-full origin-left bg-hairline" />
      <span aria-hidden className="absolute top-0 left-6 size-2 -translate-y-1/2 bg-ink-dim md:left-12 lg:left-[max(7.25rem,calc((100vw-75.5rem)/2))]" />
      <div className="shell flex flex-col gap-12 pt-20 pb-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-[18px]">
            <p className="font-display text-xl uppercase">{profile.name}</p>
            <p className="mono max-w-[340px] text-ink-dim">{profile.bio}</p>
          </div>
          {/* A map of the page; the socials live in Connect above */}
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-9 gap-y-3 pt-[3px]">
              {pages.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="mono inline-flex min-h-11 items-center text-ink-dim underline-offset-4 transition-colors hover:text-ink hover:underline md:min-h-0">
                    {s.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={profile.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono inline-flex min-h-11 items-center text-ink-dim underline-offset-4 transition-colors hover:text-ink hover:underline md:min-h-0"
                >
                  Resume ↗<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="relative flex flex-col gap-3 border-t border-hairline pt-6 md:flex-row md:items-center md:justify-between">
          <span aria-hidden className="absolute -top-1.5 left-0 h-[13px] w-px bg-ink-dim" />
          <span aria-hidden className="absolute -top-1.5 right-0 h-[13px] w-px bg-ink-dim" />
          <p className="mono text-ink-dim">
            © {year} / {profile.name} / Portfolio
          </p>
          <a href="#top" className="mono inline-flex min-h-11 items-center text-ink-dim transition-colors hover:text-ink md:min-h-0">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
