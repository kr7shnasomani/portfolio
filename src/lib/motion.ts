import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect } from 'react'

gsap.registerPlugin(ScrollTrigger, useGSAP)
ScrollTrigger.config({ ignoreMobileResize: true })
ScrollTrigger.defaults({ invalidateOnRefresh: true })

// Easing roles: editorial for copy, physical for interaction, panel for heavier surfaces
export const EASE = { editorial: 'power3.out', physical: 'power2.out', panel: 'quint.out' } as const

// CSS perspective (px) of every city stage; choreography uses it to size z travel
export const PERSPECTIVE = 900

export const MQ = {
  desktop: '(min-width: 64rem)',
  mobile: '(max-width: 47.9999rem)',
  motionOk: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
} as const

let lenis: Lenis | null = null

// Programmatic scrolls go through Lenis when it is running so they glide like user scrolls
export const scrollToY = (y: number) => (lenis ? lenis.scrollTo(y, { duration: 1.2 }) : window.scrollTo({ top: y, behavior: 'smooth' }))

// Freeze page scrolling under a modal: Lenis drives scroll from wheel events itself, so the page would otherwise
// keep moving behind an open dialog
export const lockScroll = (locked: boolean) => {
  if (locked) lenis?.stop()
  else lenis?.start()
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

// Inertial smooth scroll driven by GSAP's ticker so ScrollTrigger and Lenis stay frame-locked
export function useSmoothScroll() {
  useEffect(() => {
    // Web fonts change line heights, so trigger positions are re-measured once they land
    void document.fonts?.ready.then(() => ScrollTrigger.refresh())
    // Scrolling slides content under a resting cursor, which the browser then counts as hovered. Tag the page until
    // the pointer really moves, so hover effects behind the `still:` variant don't fire from scrolling alone.
    const root = document.documentElement
    const idle = () => root.classList.add('pointer-idle')
    const moved = () => root.classList.remove('pointer-idle')
    window.addEventListener('scroll', idle, { passive: true })
    window.addEventListener('pointermove', moved, { passive: true })
    const unlisten = () => {
      window.removeEventListener('scroll', idle)
      window.removeEventListener('pointermove', moved)
    }
    if (window.matchMedia(MQ.reduced).matches) return unlisten
    const instance = new Lenis({ lerp: 0.14 })
    lenis = instance
    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // In-page anchors glide through Lenis instead of jumping
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element).closest?.('a[href^="#"]')
      const id = a?.getAttribute('href')?.slice(1)
      const target = id ? document.getElementById(id) : null
      if (!target) return
      e.preventDefault()
      // Lenis already honours the root's scroll-padding-top, which clears the fixed header
      instance.scrollTo(target)
      // A native jump moves focus to the target; do the same so Tab carries on from there (the skip link relies on it)
      if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
      history.replaceState(null, '', `#${id}`)
    }
    document.addEventListener('click', onClick)

    return () => {
      unlisten()
      document.removeEventListener('click', onClick)
      gsap.ticker.remove(tick)
      instance.destroy()
      lenis = null
    }
  }, [])
}

// Elements drift toward the pointer; each mover has its own range (px) and lag. Fine pointers only.
export function pointerParallax(movers: { el: Element | null; range: number; duration: number; yScale?: number }[]) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  const setters = movers
    .filter((m) => m.el)
    .map((m) => ({
      x: gsap.quickTo(m.el, 'x', { duration: m.duration, ease: EASE.physical }),
      y: gsap.quickTo(m.el, 'y', { duration: m.duration, ease: EASE.physical }),
      range: m.range,
      yScale: m.yScale ?? 1,
    }))
  const onMove = (e: MouseEvent) => {
    const mx = e.clientX / window.innerWidth - 0.5
    const my = e.clientY / window.innerHeight - 0.5
    for (const s of setters) {
      s.x(mx * s.range * 2)
      s.y(my * s.range * 2 * s.yScale)
    }
  }
  window.addEventListener('mousemove', onMove, { passive: true })
  return () => window.removeEventListener('mousemove', onMove)
}

// Reports when each section enters or leaves the middle of the viewport
export function trackSections(ids: string[], onToggle: (index: number, active: boolean) => void) {
  ids.forEach((id, i) => {
    const section = document.getElementById(id)
    if (section) ScrollTrigger.create({ trigger: section, start: 'top center', end: 'bottom center', onToggle: (self) => onToggle(i, self.isActive) })
  })
}

// Plays an entrance once its trigger scrolls in, and rewinds it only once the trigger is back below the screen, so
// scrolling up never fades out something still in view (a plain 'reverse' toggle did, mid-screen)
export function revealOnScroll(anim: gsap.core.Animation, trigger: Element | null, start: string) {
  anim.pause()
  ScrollTrigger.create({ trigger, start, end: 'max', onEnter: () => anim.play() })
  ScrollTrigger.create({ trigger, start: 'top bottom', end: 'max', onLeaveBack: () => anim.pause(0) })
}

export { gsap, ScrollTrigger, useGSAP }
