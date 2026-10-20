import type { ReactNode } from 'react'
import { palettes, profile, publications } from '../content'
import { Noise, Reveal, Tag } from './ui'

type Paper = (typeof publications)[number]
// Palette glow per card from each palette's horizontal (top-face) gradient, so it sweeps between pink and blue;
// a vertical one only showed its bottom colour. Pink and blue sit well under the blue venue marks.
const TONE = [0, 1]

// Whole card is the link once the paper is out
function CardLink({ paper, children }: { paper: Paper; children: ReactNode }) {
  const base = 'group relative flex w-full flex-col transition-transform duration-200 ease-out motion-safe:pointer-fine:hover:-translate-y-1'
  return paper.link ? (
    <a href={paper.link.href} target="_blank" rel="noopener noreferrer" className={base}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <div className={base}>{children}</div>
  )
}

// A journal-style masthead carrying the venue's own mark on white, over a dark body lit from below by a
// palette glow on the city grid, like the project cards
function Card({ paper, i }: { paper: Paper; i: number }) {
  return (
    <CardLink paper={paper}>
      <div aria-hidden className="notch absolute inset-0 bg-white/8 [--n:32px]" />
      <div aria-hidden className="notch absolute inset-px overflow-hidden bg-raised [--n:32px]">
        <span className="grid-lines absolute inset-0 opacity-60" />
        <span
          className="absolute inset-x-0 bottom-0 h-[32%] opacity-90 [mask-image:radial-gradient(70%_90%_at_50%_100%,black,transparent)]"
          style={{ background: palettes[TONE[i % TONE.length]][2] }}
        />
        <span className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(22_22_26/.96)_38%,rgb(22_22_26/.5)_72%,rgb(22_22_26/.1))]" />
        <Noise className="opacity-25" />
      </div>
      <div className="relative m-px h-40 overflow-hidden bg-white md:h-44">
        <img
          src={paper.logo}
          alt={paper.venue}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 m-auto h-[62%] w-[78%] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="relative flex flex-1 flex-col gap-6 p-7 md:p-9">
        <h3 className="font-sans text-[22px] leading-[30px] font-semibold tracking-[-0.02em] text-balance text-ink md:text-[26px] md:leading-[34px]">{paper.title}</h3>
        <p className="text-pretty text-base leading-6 text-ink-dim">
          {paper.authors.map((a, k) => (
            <span key={a}>
              {k > 0 && ', '}
              <span className={a === profile.name ? 'text-ink' : ''}>{a}</span>
            </span>
          ))}
        </p>
        <p className="text-pretty text-base leading-6 text-ink-dim">{paper.summary}</p>
        <span className="mono mt-auto flex w-fit items-center gap-2 pt-6 text-ink">
          {paper.link ? (
            <>
              <span className="border-b border-current pb-1">{paper.link.label}</span>
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">
                →
              </span>
            </>
          ) : (
            'Publication pending'
          )}
        </span>
      </div>
    </CardLink>
  )
}

export default function Publications() {
  return (
    <section id="publications" className="relative bg-surface">
      <div className="shell pt-8 pb-28 lg:pb-40">
        <Reveal y={18} duration={0.6} stagger={0.08} start="top 75%" className="flex flex-col gap-8">
          <div data-reveal>
            <Tag>Research</Tag>
          </div>
          <h2 data-reveal className="h2">
            Published work
          </h2>
        </Reveal>
        <Reveal y={28} stagger={0.12} start="top 80%" className="mt-14 grid gap-8 md:grid-cols-2 lg:mt-20">
          {publications.map((paper, i) => (
            <div key={paper.title} data-reveal className="flex">
              <Card paper={paper} i={i} />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
