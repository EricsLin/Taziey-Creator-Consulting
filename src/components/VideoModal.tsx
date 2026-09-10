import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { Video } from '@/types'
import { ImageSlot } from '@/components/ImageSlot'
import styles from './VideoModal.module.css'

interface VideoModalState {
  /** Opens the detail popup for a video. */
  open: (video: Video) => void
  close: () => void
}

const VideoModalContext = createContext<VideoModalState>({ open: () => {}, close: () => {} })

/**
 * Owns the one video detail popup for the whole site.
 *
 * Every thumbnail — the hero carousel, the portfolio grid — calls `open()`
 * instead of linking straight out, so a click lands on the stats first and the
 * trip to YouTube is a deliberate second click.
 */
export function VideoModalProvider({ children }: { children: React.ReactNode }) {
  const [video, setVideo] = useState<Video | null>(null)

  const open = useCallback((next: Video) => setVideo(next), [])
  const close = useCallback(() => setVideo(null), [])
  const value = useMemo(() => ({ open, close }), [open, close])

  return (
    <VideoModalContext.Provider value={value}>
      {children}
      {video && <VideoModal video={video} onClose={close} />}
    </VideoModalContext.Provider>
  )
}

export function useVideoModal(): VideoModalState {
  return useContext(VideoModalContext)
}

/** "2024-07-19" -> "19 July 2024". Returns null for an empty or unparseable date. */
function formatDate(value?: string | null): string | null {
  if (!value) return null
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function VideoModal({ video, onClose }: { video: Video; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  /* While the popup is up: escape closes it, tab stays inside it, and the page
     behind it holds still rather than scrolling under the backdrop. */
  useEffect(() => {
    const returnTo = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      returnTo?.focus?.()
    }
  }, [onClose])

  const published = formatDate(video.publishedAt)
  const facts: Array<{ label: string; value: string }> = [
    { label: 'Views', value: video.views },
    { label: 'Likes', value: video.likes },
    { label: 'Runtime', value: video.duration },
    { label: 'Published', value: published ?? '' },
  ].filter((fact) => fact.value)

  const highlights = video.highlights
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)

  return (
    <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-modal-title"
      >
        <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="Close">
          &#10005;
        </button>

        <div className={styles.banner}>
          <ImageSlot src={video.thumbnailUrl} alt={video.title} placeholder={video.niche || 'thumbnail'} />
          <span className={styles.scrim} aria-hidden="true" />
          {video.duration && <span className={styles.duration}>{video.duration}</span>}
        </div>

        <div className={styles.body}>
          <div className={styles.tags}>
            {video.niche && <span className={styles.tag}>{video.niche}</span>}
            {video.game && <span className={`${styles.tag} ${styles.tagGame}`}>{video.game}</span>}
          </div>

          <h2 id="video-modal-title" className={styles.title}>
            {video.title}
          </h2>

          {video.creator && (
            <div className={styles.creator}>
              {video.channelUrl ? (
                <a className={styles.channel} href={video.channelUrl} target="_blank" rel="noreferrer">
                  {video.creator}
                </a>
              ) : (
                video.creator
              )}
            </div>
          )}

          {facts.length > 0 && (
            <dl className={styles.facts}>
              {facts.map((fact) => (
                <div key={fact.label} className={styles.fact}>
                  <dt className={styles.factLabel}>{fact.label}</dt>
                  <dd className={styles.factValue}>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {video.summary && <p className={styles.summary}>{video.summary}</p>}

          {highlights.length > 0 && (
            <ul className={styles.highlights}>
              {highlights.map((line, i) => (
                <li key={i} className={styles.highlight}>
                  {line}
                </li>
              ))}
            </ul>
          )}

          <div className={styles.actions}>
            {video.youtubeUrl && (
              <a className={styles.watch} href={video.youtubeUrl} target="_blank" rel="noreferrer">
                Watch the video
                <span className={styles.watchArrow} aria-hidden="true">
                  &#8594;
                </span>
              </a>
            )}
            <button type="button" className={styles.dismiss} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
