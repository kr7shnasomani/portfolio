import { useEffect, useRef, useState } from 'react'
import { profile, sections } from '../content'
import { ScrollTrigger, trackSections, useGSAP } from '../lib/motion'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const [onPaper, setOnPaper] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  // Scroll state comes from ScrollTrigger (no scroll listeners or layout reads); React skips same-value updates
  useGSAP(() => {
    const hero = document.getElementById('top')
    if (hero) {
      // The bar fills in as the hero title docks, 73% through the hero's pinned scroll
      ScrollTrigger.create({
        trigger: hero,
        start: () => `top+=${Math.max((hero.offsetHeight - window.innerHeight) * 0.73, window.innerHeight * 0.6)} top`,
        end: 'max',
        // Keyed off progress, not isActive: the trigger counts itself left at the very bottom, and a jump
        // straight past it (End key, a deep link) never toggles at all. Same-value updates don't re-render.
        onUpdate: (self) => setScrolled(self.progress > 0),
        onRefresh: (self) => setScrolled(self.progress > 0),
      })
    }
    // Invert while the bar sits over the light sections (one span, so adjacent sections can't race)
    const papers = document.querySelectorAll('.bg-paper')
    if (papers.length) {
      ScrollTrigger.create({ trigger: papers[0], endTrigger: papers[papers.length - 1], start: 'top 64px', end: 'bottom 64px', onToggle: (self) => setOnPaper(self.isActive) })
    }
    // Clear the label when its section leaves, so scrolling back into the hero shows the first section again
    trackSections(
      sections.map((s) => s.id),
      (i, on) => setActive((current) => (on ? sections[i].id : current === sections[i].id ? null : current)),
    )
  })

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      toggle.current?.focus() // the menu turns inert, which would otherwise drop focus to <body>
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Over the hero, the menu shows the first section's name rather than a generic label
  const label = sections.find((s) => s.id === active)?.label ?? sections[0].label

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-16 border-b transition-colors duration-500 ${!scrolled ? 'border-transparent' : onPaper ? 'border-hairline-onpaper bg-paper/80 text-ink-onpaper backdrop-blur-md' : 'border-hairline bg-void/70 backdrop-blur-md'}`}
    >
      <div className="relative flex h-full items-center justify-between px-6 md:px-12 lg:px-[7.25rem]">
        <a href="#top" aria-label={`KS, ${profile.name}, back to top`} className="relative -m-1.5 p-1.5">
          <span
            data-nav-badge
            className={`chamfer grid size-8 place-items-center font-display text-[13px] transition-colors duration-500 ${onPaper ? 'bg-ink-onpaper text-paper' : 'bg-ink text-void'}`}
          >
            KS
          </span>
          {/* The hero portrait docks here; GSAP drives its opacity, the class is the reduced-motion fallback */}
          <img
            aria-hidden
            data-nav-photo
            src={profile.photo}
            alt=""
            className={`chamfer absolute top-1.5 left-1.5 size-8 object-cover [--c:4px] [object-position:center_30%] transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
          />
        </a>

        {/* The hero title flies onto this wordmark; GSAP drives its opacity, the class is the reduced-motion fallback */}
        <span
          aria-hidden
          data-nav-wordmark
          className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[13px] whitespace-nowrap uppercase transition-opacity duration-300 md:text-sm ${scrolled ? 'opacity-100' : 'opacity-0'}`}
        >
          {profile.name}
        </span>

        <div className="relative">
          <button
            ref={toggle}
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((o) => !o)}
            className={`mono flex min-h-11 min-w-11 items-center justify-end gap-2.5 transition-colors duration-300 ${onPaper ? 'text-dim-onpaper hover:text-ink-onpaper' : 'text-ink-dim hover:text-ink'}`}
          >
            {/* Mobile: three-line burger that folds into a cross */}
            <span aria-hidden className="relative block h-3.5 w-5 md:hidden">
              <span className={`absolute inset-x-0 top-0 h-[1.5px] bg-current transition-transform duration-300 ${open ? 'translate-y-[6.25px] rotate-45' : ''}`} />
              <span className={`absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-current transition-opacity duration-300 ${open ? 'opacity-0' : ''}`} />
              <span className={`absolute inset-x-0 bottom-0 h-[1.5px] bg-current transition-transform duration-300 ${open ? '-translate-y-[6.25px] -rotate-45' : ''}`} />
            </span>
            <span className="sr-only">Menu, current section: </span>
            <span className="sr-only md:not-sr-only">{label}</span>
            {/* Desktop: caret that flips while open */}
            <svg aria-hidden viewBox="0 0 12 12" className={`hidden size-3 transition-transform duration-300 md:block ${open ? 'rotate-180' : ''}`}>
              <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>

          {/* Always mounted so it can transition out; inert and hidden from tab order while closed */}
          <nav
            id="site-menu"
            aria-label="Sections"
            inert={!open}
            className={`chamfer absolute top-full right-0 mt-2 w-[244px] border border-hairline bg-raised py-2 transition-[opacity,translate,visibility] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'}`}
          >
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setOpen(false)}
                aria-current={active === s.id ? 'location' : undefined}
                className={`mono flex min-h-11 items-center px-4 transition-colors hover:bg-white/6 md:min-h-0 md:py-2 hover:text-ink ${active === s.id ? 'text-ink shadow-[inset_2px_0_0_var(--color-ink)]' : 'text-ink-dim'}`}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
