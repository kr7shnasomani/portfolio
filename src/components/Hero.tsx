import { useRef } from 'react'
import { profile } from '../content'
import { EASE, gsap, MQ, PERSPECTIVE, pointerParallax, useGSAP } from '../lib/motion'
import City, { type Box } from './City'
import { Button } from './ui'

// Long boxes run along the view axis so their inner faces converge on the vanishing point.
// The buildings were sized on a farther camera; at 1.35× they crowd the frame, so less of the bright horizon shows
// between them
const BUILD_SCALE = 1.35
const streetLayout: Box[] = [
  // overhead: undersides face the camera
  { name: 'building', depth: 0.85, x: -830, y: -470, z: -285, w: 520, h: 150, d: 330, p: 1, pattern: 'grid', r: [0, 4, -6] },
  { name: 'building', depth: 0.45, x: -960, y: -210, z: -338, w: 260, h: 150, d: 275, p: 3, r: [0, -6, 0] },
  { name: 'building', depth: 0.25, x: 60, y: -580, z: -426, w: 200, h: 120, d: 231, p: 3, r: [0, 0, 8] },
  { name: 'building', depth: 0.9, x: 700, y: -470, z: -299, w: 620, h: 150, d: 358, p: 0, pattern: 'circuit', r: [0, -4, 5] },
  { name: 'building', depth: 0.55, x: 1010, y: -250, z: -318, w: 240, h: 170, d: 275, p: 1, r: [0, 8, 0] },
  // walls
  { name: 'building', depth: 0.4, x: 1070, y: 120, z: -386, w: 200, h: 200, d: 231, p: 4, pattern: 'pixels', r: [0, -10, 0] },
  { name: 'building', depth: 0.3, x: -1030, y: -10, z: -414, w: 140, h: 140, d: 209, p: 3 },
  // street level: rooftops face the camera
  { name: 'building', depth: 0.75, x: -990, y: 560, z: -274, w: 300, h: 420, d: 308, p: 1 },
  { name: 'building', depth: 0.6, x: -520, y: 610, z: -358, w: 300, h: 200, d: 495, p: 2, pattern: 'pixels', r: [0, 14, -4] },
  { name: 'building', depth: 0.8, x: 230, y: 660, z: -263, w: 420, h: 200, d: 286, p: 1, pattern: 'circuit', r: [0, -6, 0] },
  { name: 'building', depth: 0.7, x: 850, y: 560, z: -285, w: 420, h: 300, d: 330, p: 3, pattern: 'grid', r: [0, -8, 3] },
  // floating cubes that belong to the street
  { name: 'floater', depth: 0.6, x: 380, y: 230, z: -200, w: 120, h: 90, d: 110, p: 3, r: [-12, 24, 6] },
  { name: 'floater', depth: 0.5, x: -500, y: 160, z: -200, w: 110, h: 80, d: 100, p: 1, r: [-10, 18, 0] },
  { name: 'floater', depth: 0.35, x: 466, y: 128, z: -250, w: 62, h: 62, d: 62, p: 2, r: [-14, -20, 0] },
  { name: 'floater-top-middle', depth: 0.3, x: -330, y: -470, z: -300, w: 70, h: 78, d: 70, p: 4, r: [10, 22, -6] },
]
const street = streetLayout.map((b) => (b.name === 'building' ? { ...b, w: b.w * BUILD_SCALE, h: b.h * BUILD_SCALE, d: b.d * BUILD_SCALE } : b))

// Deterministic, evenly spread stars (R2 sequence) in the upper sky; every third one twinkles.
// Split across two depth layers: big stars sit far back, small ones nearer and drift further.
const stars = Array.from({ length: 48 }, (_, i) => ({
  left: `${((0.5 + i * 0.7548776662) % 1) * 100}%`,
  top: `${((0.5 + i * 0.569840291) % 1) * 72}%`,
  big: i % 2 === 0,
  opacity: 0.5 + ((i * 0.37) % 1) * 0.45,
  twinkle: i % 3 === 0 ? `star-twinkle ${(2.5 + ((i * 0.61) % 1) * 3.5).toFixed(2)}s ease-in-out ${(((i * 0.29) % 1) * 3).toFixed(2)}s infinite alternate` : undefined,
}))
const starLayers = [stars.filter((s) => s.big), stars.filter((s) => !s.big)]
const STAR_DEPTH = [
  { scale: 1.06, range: 3 },
  { scale: 1.14, range: 7 },
]

const clamp01 = gsap.utils.clamp(0, 1)
const depthOf = (el: Element) => Number((el as HTMLElement).dataset.depth ?? 0.5)
const nearOf = (el: Element) => Number((el as HTMLElement).dataset.near ?? -300)
// z travel that makes a box's near face read `scale`× larger
const flyZ = (el: Element, scale: number) => (PERSPECTIVE - nearOf(el)) * (1 - 1 / scale)
// Drive apparent scale linearly, so growth reads evenly, and convert it to depth each frame
const scaleTo = (tl: gsap.core.Timeline, el: Element, to: number, duration: number, at: number) => {
  const state = { s: 1 }
  tl.to(state, { s: to, duration, onUpdate: () => gsap.set(el, { z: flyZ(el, state.s), force3D: true }) }, at)
}

export default function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const hero = root.current
      if (!hero) return
      const q = gsap.utils.selector(hero)
      const buildings: Element[] = q('[data-city="building"]')
      const floaters: Element[] = q('[data-city="floater"]')
      const topFloater: Element | undefined = q('[data-city="floater-top-middle"]')[0]
      const lightOnes = topFloater ? [...floaters, topFloater] : floaters
      const stage: Element = q('[data-hero-stage]')[0]
      const logo: Element = q('[data-hero-logo]')[0]
      const photo: Element = q('[data-hero-photo]')[0]
      const items: Element[] = q('[data-hero-item]')
      const ctas = items.filter((el) => el.hasAttribute('data-hero-cta'))
      const copy = items.filter((el) => !el.hasAttribute('data-hero-cta'))
      const sky = (name: string): Element => q(`[data-sky="${name}"]`)[0]
      const nav = document.querySelector('[data-nav-wordmark]')
      const navPhoto = document.querySelector('[data-nav-photo]')
      const navBadge = document.querySelector('[data-nav-badge]')
      const starField: Element = q('[data-stars]')[0]
      const starLayerEls: Element[] = q('[data-star-layer]')

      // A conditions object only runs when at least one matches, so motionOk keeps tablet and phone covered
      gsap.matchMedia().add({ desktop: MQ.desktop, motionOk: MQ.motionOk }, (ctx) => {
        const { desktop, motionOk } = ctx.conditions as { desktop: boolean; motionOk: boolean }
        if (!motionOk) return
        const D = desktop ? 1 : 0.7

        // Scroll: the street flies past the camera in depth order while the title docks into the header
        const buildScroll = () => {
          const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: true } })
          for (const el of buildings) {
            const d = depthOf(el)
            scaleTo(tl, el, 1 + (1.15 + 1.35 * d) * D, 0.38, 0.06 + (1 - d) * 0.08)
          }
          for (const el of floaters) scaleTo(tl, el, 1 + 1.85 * D, 0.35, 0.08 + (1 - depthOf(el)) * 0.06)
          // Once they have flown past, the cubes clear out with the city instead of lingering into the next section
          tl.to(floaters, { autoAlpha: 0, duration: 0.1 }, 0.5)
          if (topFloater) {
            tl.to(topFloater, { y: -70 * D, scale: 1 + 0.3 * D, rotation: 2, duration: 0.7 }, 0.1)
            tl.to(topFloater, { autoAlpha: 0, y: -130 * D, duration: 0.14 }, 0.84)
          }
          tl.to(ctas, { autoAlpha: 0, duration: 0.16 }, 0.06)
          tl.to(copy, { autoAlpha: 0, duration: 0.24, stagger: 0.04 }, 0.12)
          // The name flies up onto the header wordmark, measured against it so the hand-off lands exactly
          if (nav) {
            tl.to(
              logo,
              {
                x: () => {
                  const a = logo.getBoundingClientRect()
                  const b = nav.getBoundingClientRect()
                  return b.left + b.width / 2 - (a.left + a.width / 2)
                },
                y: () => {
                  const s = stage.getBoundingClientRect()
                  const a = logo.getBoundingClientRect()
                  const b = nav.getBoundingClientRect()
                  return b.top + b.height / 2 - (a.top - s.top + a.height / 2)
                },
                scale: () => nav.getBoundingClientRect().width / logo.getBoundingClientRect().width,
                duration: 0.55,
              },
              0.2,
            )
            tl.to(logo, { autoAlpha: 0, duration: 0.03 }, 0.75)
            tl.fromTo(nav, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.73)
          }
          // The portrait docks into the header badge on the same straight, linear flight as the name, landing a
          // little sooner (0.65) so the merge finishes before the header's glass fills in at 0.73 and can't blur it.
          // The merge is a crossfade on the spot, only once the photo has landed: the KS badge clears as the photo
          // nears, then the header's copy fades up while the flying one fades out, so there is never a second mark.
          if (navPhoto && navBadge) {
            // Measured from the photo's untransformed box, so a refresh mid-flight still aims at the badge
            const rest = () => {
              const r = photo.getBoundingClientRect()
              const k = Number(gsap.getProperty(photo, 'scale'))
              const cx = r.left + r.width / 2 - Number(gsap.getProperty(photo, 'x'))
              const cy = r.top + r.height / 2 - Number(gsap.getProperty(photo, 'y')) - stage.getBoundingClientRect().top
              return { cx, cy, w: r.width / k }
            }
            const target = () => navPhoto.getBoundingClientRect()
            tl.to(
              photo,
              {
                x: () => target().left + target().width / 2 - rest().cx,
                y: () => target().top + target().height / 2 - rest().cy,
                scale: () => target().width / rest().w,
                duration: 0.45,
              },
              0.2,
            )
            tl.to(navBadge, { autoAlpha: 0, duration: 0.12 }, 0.5)
            tl.fromTo(navPhoto, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.65)
            tl.to(photo, { autoAlpha: 0, duration: 0.03 }, 0.66)
          }
          tl.to(sky('bright'), { autoAlpha: 0, y: 120 * D, scale: 1.3, transformOrigin: '50% 100%', duration: 0.35 }, 0.42)
          tl.fromTo(sky('dark'), { scale: 1, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1.18, duration: 0.55 }, 0.4)
          tl.to(sky('grid'), { autoAlpha: 0, scale: 1.22, transformOrigin: '50% 45%', duration: 0.35 }, 0.45)
          tl.to(sky('void'), { autoAlpha: 1, duration: 0.25 }, 0.6)
          tl.set(buildings, { autoAlpha: 0 }, 0.62)

          // The sky deepens: stars brighten through the middle of the flight and each layer pushes in at its own rate
          const travel = () => hero.offsetHeight - window.innerHeight
          gsap.fromTo(
            starField,
            { opacity: 0.5 },
            { opacity: 1, ease: 'none', scrollTrigger: { trigger: hero, start: () => `top+=${0.2 * travel()} top`, end: () => `top+=${0.6 * travel()} top`, scrub: true } },
          )
          starLayerEls.forEach((layer, i) => {
            gsap.fromTo(layer, { scale: 1 }, { scale: STAR_DEPTH[i].scale, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: true } })
          })
        }

        // Pointer parallax: near buildings drift a little, light floaters drift more
        const mouse = (el: Element) => el.querySelector('[data-city-mouse]')
        const offMouse = desktop
          ? pointerParallax([
              ...lightOnes.map((el) => ({ el: mouse(el), range: el === topFloater ? 13 : 4 + 8 * (1 - depthOf(el)), duration: 0.6 })),
              ...buildings.map((el) => ({ el: mouse(el), range: 1.5 + 4.5 * depthOf(el), duration: 0.8, yScale: 0.5 })),
              ...starLayerEls.map((el, i) => ({ el, range: STAR_DEPTH[i].range, duration: 0.8 })),
            ])
          : undefined

        // Load-in: the city falls into place from outside the frame, then the copy rises in.
        // Skipped when arriving mid-page (reload partway down, or back navigation).
        const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
        if (window.scrollY > 0.1 * window.innerHeight || entry?.type === 'back_forward') {
          buildScroll()
          return () => offMouse?.()
        }

        gsap.set([...items, logo, photo], { autoAlpha: 0, y: 20 })
        const fall = { h: 1 }
        const ease = gsap.parseEase(EASE.physical)
        // Each building waits its turn by depth, then eases from its flown-out spot to rest
        const settle = () => {
          const h = fall.h
          for (const el of buildings) {
            const d = depthOf(el)
            const start = 1 - 0.28 * d
            const r = ease(clamp01((start - h) / (start - 0.42 * (1 - d))))
            gsap.set(el, { z: flyZ(el, 1 + (0.35 + 0.95 * d) * D * (1 - r)), autoAlpha: clamp01(r / 0.15), force3D: true })
          }
          for (const el of lightOnes) {
            const r = ease(clamp01((0.5 - h) / 0.4))
            gsap.set(el, { z: flyZ(el, 1 + 1.2 * D * (1 - r)), autoAlpha: clamp01(r / 0.15), force3D: true })
          }
          gsap.set(sky('dark'), { scale: 1 + 0.12 * h, transformOrigin: '50% 50%' })
          gsap.set(sky('grid'), { autoAlpha: 0.45 * (1 - h) ** 1.5, scale: 1 + 0.25 * h, transformOrigin: '50% 45%' })
          const t = (1 - h) ** 2
          gsap.set(sky('bright'), { autoAlpha: 0.4 + 0.6 * t, scale: 1 + 0.35 * (1 - t), transformOrigin: '50% 100%' })
        }
        settle()
        const intro = gsap.timeline({ onComplete: buildScroll })
        intro.to(fall, { h: 0, duration: 2.6, ease: EASE.physical, onUpdate: settle })
        // Top to bottom: portrait, name, then the copy and buttons
        intro.to([photo, logo, ...items], { autoAlpha: 1, y: 0, duration: 0.65, ease: EASE.editorial, stagger: 0.07 }, 1.15)
        // Any scroll during the intro jumps straight to the settled city
        const skip = () => {
          if (intro.isActive()) intro.progress(1)
        }
        window.addEventListener('scroll', skip, { once: true, passive: true })
        return () => {
          offMouse?.()
          window.removeEventListener('scroll', skip)
        }
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="top" className="relative h-[120svh] motion-reduce:h-auto md:h-[145svh] md:motion-reduce:h-auto lg:h-[230svh] lg:motion-reduce:h-auto">
      <div data-hero-stage className="sticky top-0 h-svh overflow-hidden bg-raised">
        <div aria-hidden className="absolute inset-0">
          {/* Both skies overhang the stage, which sets where the horizon glow sits */}
          <div data-sky="bright" className="sky-bright absolute top-[-2.7%] right-[-1.4%] bottom-[-1.75%] left-[-11.775%]" />
          <div data-sky="dark" className="sky-dark invisible absolute top-[-2.7%] right-[-1.4%] bottom-[-1.75%] left-[-11.775%] opacity-0" />
          <div data-sky="void" className="invisible absolute inset-0 bg-surface opacity-0" />
          <div data-sky="grid" className="grid-lines absolute inset-0 opacity-45" />
          <div data-stars className="absolute inset-0 motion-safe:opacity-50">
            {starLayers.map((layer, l) => (
              <div key={l} data-star-layer className="absolute inset-0">
                {layer.map((star, i) => (
                  <span
                    key={i}
                    className={`absolute rounded-full bg-ink ${star.big ? 'size-[3px] shadow-[0_0_9px_rgb(251_250_249/.7)]' : 'size-[2px] shadow-[0_0_6px_rgb(251_250_249/.7)]'}`}
                    style={{ left: star.left, top: star.top, opacity: star.opacity, animation: star.twinkle }}
                  />
                ))}
              </div>
            ))}
          </div>
          <City boxes={street} />
          {/* Grain: 40% black under the noise tile, hard-light blended, which deepens the whole sky */}
          <div className="noise absolute inset-0 bg-black/40 opacity-25 mix-blend-hard-light" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pt-16 pb-20 text-center">
          <div className="flex w-full max-w-[60rem] flex-col items-center gap-11">
            <div className="flex w-full flex-col items-center gap-9">
              <img
                data-hero-photo
                src={profile.photo}
                alt={`Portrait of ${profile.name}`}
                fetchPriority="high"
                className="chamfer size-20 object-cover [--c:10px] [object-position:center_30%] md:size-24"
              />
              <h1 data-hero-logo className="sheen font-display text-[clamp(2.1rem,6.1vw,5.5rem)] leading-none uppercase lg:whitespace-nowrap">
                {profile.name}
              </h1>
            </div>
            <p data-hero-item className="font-mono text-[22px] leading-none font-semibold tracking-[-0.02em] uppercase md:text-[28px]">
              Applied AI Engineer
            </p>
            <div data-hero-item data-hero-cta className="flex flex-wrap justify-center gap-3">
              <Button href={profile.resume}>View resume</Button>
              <Button href="#projects" variant="secondary">
                Explore projects
              </Button>
            </div>
          </div>
        </div>

        <a data-hero-item data-hero-cta href="#about" className="absolute inset-x-0 bottom-14 z-10 mx-auto flex w-fit items-center gap-1 py-1.5 pr-2.5 pl-3">
          <span aria-hidden className="chamfer absolute inset-0 bg-void" />
          <span className="mono relative text-ink">Scroll</span>
          <span aria-hidden className="relative size-3.5 overflow-hidden text-[13px] leading-[14px]">
            <span className="block animate-nudge">↓</span>
          </span>
        </a>
      </div>
    </section>
  )
}
