import { useCallback, useRef, useState } from 'react'
import type { Video } from '@/types'
import { ImageSlot } from '@/components/ImageSlot'
import { useVideoModal } from '@/components/VideoModal'
import { useInterval } from '@/lib/useInterval'
import { useCopy } from '@/lib/useSiteContent'
import styles from './Hero.module.css'

/** How long a slide holds before the carousel advances. */
const DWELL_MS = 4600
/** Pointer travel that counts as a swipe rather than a click. */
const SWIPE_PX = 44

interface Props {
  /** Ordered slides — the work carries the hero, so it gets the whole frame. */
  videos: Video[]
}

/**
 * One slide is on screen at a time. This only has to tell the outgoing slide
 * from the ones still waiting: the slide we just left keeps -1 so it leaves to
 * the left, and everything else wraps forward to wait on the right.
 */
function offsetOf(i: number, index: number, count: number): number {
  const raw = i - index
  return raw < -1 ? raw + count : raw
}

export function Hero({ videos }: Props) {
  const copy = useCopy()
  const { open } = useVideoModal()
  const count = videos.length
  const [index, setIndex] = useState(0)
  const dragFrom = useRef<number | null>(null)
  const swiped = useRef(false)

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count])

  useInterval(() => go(1), count > 1 ? DWELL_MS : null)

  /* Horizontal drag advances the carousel; the trailing click is swallowed so
     a swipe doesn't also open the popup for the video the finger started on. */
  const onPointerDown = (e: React.PointerEvent) => {
    dragFrom.current = e.clientX
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const from = dragFrom.current
    dragFrom.current = null
    if (from === null) return
    const dx = e.clientX - from
    if (Math.abs(dx) < SWIPE_PX) return
    swiped.current = true
    go(dx < 0 ? 1 : -1)
  }
  const onClickCapture = (e: React.MouseEvent) => {
    if (!swiped.current) return
    swiped.current = false
    e.preventDefault()
    e.stopPropagation()
  }

  if (count === 0) return null

  return (
    <section className={styles.hero}>
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.shell}>
        <div className={styles.grid}>
          <div className={styles.slogan}>
            {/* Taziey introduces the slogan rather than standing in the carousel
                corner: at the top of the column he reads as the person saying it. */}
            <div className={styles.portrait} aria-hidden="true">
              <img className={styles.portraitImg} src="/taziey.png" alt="" />
            </div>
            <h1 className={styles.title}>
              {copy('home.hero.title_before')}
              <span className={styles.accent}>{copy('home.hero.title_accent')}</span>
              {copy('home.hero.title_after')}
            </h1>
          </div>

          {/* Everything the carousel needs lives inside the frame: the caption
              and the controls. */}
          <div
            className={styles.deck}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onClickCapture={onClickCapture}
            aria-roledescription="carousel"
            aria-label={copy('home.recent.eyebrow')}
          >
            {videos.map((video, i) => {
              const o = offsetOf(i, index, count)
              const isActive = o === 0
              return (
                <button
                  key={video.id}
                  type="button"
                  className={styles.slide}
                  data-state={isActive ? 'active' : o === -1 ? 'exiting' : 'waiting'}
                  onClick={() => open(video)}
                  tabIndex={isActive ? undefined : -1}
                  aria-hidden={!isActive}
                >
                  <ImageSlot
                    src={video.thumbnailUrl}
                    placeholder={copy('video.thumbnail_placeholder')}
                  />
                  <span className={styles.scrim} aria-hidden="true" />
                  <span className={styles.caption}>
                    <span className={styles.views}>
                      {video.views} {copy('video.views_suffix')}
                    </span>
                    <span className={styles.slideTitle}>{video.title}</span>
                    <span className={styles.slideMeta}>{video.creator}</span>
                  </span>
                </button>
              )
            })}

            {count > 1 && (
              <div className={styles.nav}>
                <span className={styles.counter}>
                  {String(index + 1).padStart(2, '0')}
                  <span className={styles.of}>/{String(count).padStart(2, '0')}</span>
                </span>
                <button
                  type="button"
                  className={styles.arrow}
                  onClick={() => go(-1)}
                  aria-label={copy('home.hero.prev_label')}
                >
                  &#8249;
                </button>
                <button
                  type="button"
                  className={styles.arrow}
                  onClick={() => go(1)}
                  aria-label={copy('home.hero.next_label')}
                >
                  &#8250;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
