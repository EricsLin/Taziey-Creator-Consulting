import { useMemo, useState } from 'react'
import type { PackagingFlip, Video } from '@/types'
import { ImageSlot } from '@/components/ImageSlot'
import { useVideoModal } from '@/components/VideoModal'
import { useInterval } from '@/lib/useInterval'
import { fillCopy } from '@/lib/copyKeys'
import { useCopy } from '@/lib/useSiteContent'
import styles from './PackagingStrip.module.css'

const STAGGER_MS = 150

interface Props {
  flips: PackagingFlip[]
  /** The full video list, so a flip's `videoId` can resolve to a popup. */
  videos: Video[]
}

/**
 * Before/after packaging wipe. Every card runs the same two-state animation,
 * staggered by index, so the row reads as one sweep rather than four.
 *
 * A flip linked to a video opens the same detail popup the portfolio grid and
 * the hero carousel open; an unlinked one is inert, since there would be
 * nothing to show.
 */
export function PackagingStrip({ flips, videos }: Props) {
  const copy = useCopy()
  const { open } = useVideoModal()
  const [tick, setTick] = useState(0)
  useInterval(() => setTick((t) => t + 1), 3400)
  const revealed = tick % 2 === 1

  const videoById = useMemo(() => new Map(videos.map((v) => [v.id, v])), [videos])

  return (
    <section className={styles.band}>
      <div className={styles.head}>
        <div className="eyebrow">{copy('home.packaging.eyebrow')}</div>
        <div className={styles.sub}>{copy('home.packaging.sub')}</div>
      </div>
      <div className={styles.grid}>
        {flips.map((flip, i) => {
          const delay = i * STAGGER_MS
          const video = flip.videoId ? videoById.get(flip.videoId) : undefined

          const frame = (
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
                  placeholder={copy('home.packaging.placeholder_before')}
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
                  placeholder={copy('home.packaging.placeholder_after')}
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
                  ? copy('home.packaging.label_after')
                  : copy('home.packaging.label_before')}
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
          )

          return (
            <div
              key={flip.id}
              className={styles.card}
              data-revealed={revealed}
              style={{
                transitionDelay: `${delay}ms`,
                transform: revealed ? 'translateY(-5px)' : 'none',
              }}
            >
              {video ? (
                <button
                  type="button"
                  className={styles.frameButton}
                  onClick={() => open(video)}
                  aria-label={fillCopy(copy('video.details_label'), { title: flip.title })}
                >
                  {frame}
                </button>
              ) : (
                frame
              )}
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
