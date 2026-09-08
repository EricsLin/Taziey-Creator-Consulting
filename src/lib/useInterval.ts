import { useEffect, useRef } from 'react'

/** setInterval that survives re-renders and respects reduced-motion. */
export function useInterval(callback: () => void, delayMs: number | null) {
  const saved = useRef(callback)
  saved.current = callback

  useEffect(() => {
    if (delayMs === null) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const id = window.setInterval(() => saved.current(), delayMs)
    return () => window.clearInterval(id)
  }, [delayMs])
}
