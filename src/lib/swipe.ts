import { useEffect, useRef, useState } from 'react'
import { MQ } from './motion'

// Sideways swipe row for phones and tablets: which card it rests on, and one-card steps for the arrow buttons.
// Spread `row` onto the scrolling element and give it `rowClass`; its children are the cards.
export function useSwipeRow(count: number) {
  const ref = useRef<HTMLUListElement & HTMLDivElement>(null)
  const [at, setAt] = useState(0)
  // One card plus the gap, measured on first use and again after a resize rather than on every scroll event
  const size = useRef(0)
  const step = () => {
    const t = ref.current!
    return (size.current ||= (t.firstElementChild as HTMLElement).offsetWidth + parseFloat(getComputedStyle(t).columnGap))
  }
  useEffect(() => {
    const reset = () => (size.current = 0)
    window.addEventListener('resize', reset)
    return () => window.removeEventListener('resize', reset)
  }, [])
  const onScroll = () => {
    const t = ref.current!
    // The last card can't snap to the start edge, so the row's end counts as reaching it
    setAt(t.scrollLeft + t.clientWidth >= t.scrollWidth - 2 ? count - 1 : Math.round(t.scrollLeft / step()))
  }
  const go = (dir: number) => ref.current!.scrollBy({ left: dir * step(), behavior: window.matchMedia(MQ.reduced).matches ? 'auto' : 'smooth' })
  // The row bleeds to the screen edges so the next card peeks in; from desktop up the cards sit in the page's own layout
  const rowClass =
    '-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto overscroll-x-contain px-6 [scrollbar-width:none] md:-mx-12 md:scroll-px-12 md:gap-6 md:px-12 lg:mx-0 lg:overflow-visible lg:px-0'
  return { row: { ref, onScroll }, rowClass, at, go }
}
