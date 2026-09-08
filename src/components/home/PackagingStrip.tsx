import { useState } from 'react'
import type { PackagingFlip } from '@/types'
import { ImageSlot } from '@/components/ImageSlot'
import { useInterval } from '@/lib/useInterval'
import { useCopy } from '@/lib/useSiteContent'
import styles from './PackagingStrip.module.css'

const STAGGER_MS = 150

interface Props {
  flips: PackagingFlip[]
}

/**
 * Before/after packaging wipe. Every card runs the same two-state animation,
 * staggered by index, so the row reads as one sweep rather than four.
 */
export function PackagingStrip({ flips }: Props) {
  const copy = useCopy()
  const [tick, setTick] = useState(0)
  useInterval(() => setTick((t) => t + 1), 3400)
  const revealed = tick % 2 === 1

  return (
    <section className={styles.band}>
      <div className={styles.head}>
        <div className="eyebrow">{copy('home.packaging.eyebrow')}</div>
        <div className={styles.sub}>{copy('home.packaging.sub')}</div>
      </div>
      <div className={styles.grid}>
        {flips.map((flip, i) => {
          const delay = i * STAGGER_MS
          return (
            <div
              key={flip.id}
              className={styles.card}
              style={{
                transitionDelay: `${delay}ms`,
                transform: revealed ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <div className={styles.frame}>
                <div
                  className={`${styles.layer} ${styles.before}`}
                  style={{
                    opacity: revealed ? 0 : 1,
                    transitionDelay: `${revealed ? delay + 950 : delay}ms`,
                  }}
                >
                  <ImageSlot
                    src={flip.beforeUrl}
                    placeholder={copy('home.packaging.placeholder_before', 'their thumbnail')}
                  />
                </div>
                <div
                  className={`${styles.layer} ${styles.after}`}
                  style={{
                    clipPath: revealed ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  <ImageSlot
                    src={flip.afterUrl}
                    placeholder={copy('home.packaging.placeholder_after', 'ours')}
                  />
                </div>
                <div
                  className={styles.seam}
                  style={{ left: revealed ? '100%' : '0%', transitionDelay: `${delay}ms` }}
                  aria-hidden="true"
                />
                <div
                  className={styles.pill}
                  style={{
                    background: revealed ? 'var(--accent-deep)' : 'rgba(17,20,23,0.74)',
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  {revealed
                    ? copy('home.packaging.label_after', 'OURS')
                    : copy('home.packaging.label_before', 'BEFORE')}
                </div>
                <div
                  className={styles.lift}
                  style={{
                    opacity: revealed ? 1 : 0,
                    transform: revealed ? 'none' : 'translateY(150%)',
                    transitionDelay: `${revealed ? delay + 780 : delay}ms`,
                  }}
                >
                  {flip.lift}
                </div>
              </div>
              <div className={styles.meta}>
                <span className={styles.creator}>{flip.creator}</span>
                <span className={styles.videoTitle}>{flip.title}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
