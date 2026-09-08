import { useState } from 'react'
import type { Video } from '@/types'
import { ImageSlot } from '@/components/ImageSlot'
import { SmartLink } from '@/components/SmartLink'
import { useInterval } from '@/lib/useInterval'
import { useCopy } from '@/lib/useSiteContent'
import styles from './RecentWork.module.css'

interface Props {
  /** One entry per column; each column crossfades through its videos. */
  columns: Video[][]
}

export function RecentWork({ columns }: Props) {
  const copy = useCopy()
  const [tick, setTick] = useState(0)
  useInterval(() => setTick((t) => t + 1), 4200)

  const slideCount = Math.max(1, ...columns.map((c) => c.length))
  const active = tick % slideCount

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <div>
          <div className={`eyebrow ${styles.eyebrowSpacing}`}>{copy('home.recent.eyebrow')}</div>
          <h2 className={styles.title}>{copy('home.recent.title')}</h2>
        </div>
        <SmartLink to={copy('home.recent.link_href', '/content')} className={styles.more}>
          {copy('home.recent.link_label')}
        </SmartLink>
      </div>
      <div className={styles.grid}>
        {columns.map((column, ci) => (
          <div className={styles.column} key={ci}>
            {column.map((video, si) => {
              const isActive = si === active % column.length
              return (
                <div
                  key={video.id}
                  className={styles.slide}
                  style={{ opacity: isActive ? 1 : 0 }}
                  aria-hidden={!isActive}
                >
                  <div className={styles.thumb}>
                    <ImageSlot
                      src={video.thumbnailUrl}
                      alt={video.title}
                      placeholder="thumbnail"
                    />
                  </div>
                  <div className={styles.body}>
                    <div className={styles.cardTitle}>{video.title}</div>
                    <div className={styles.meta}>
                      <span>{video.creator}</span>
                      <span className={styles.sep}>&bull;</span>
                      <span>{video.views} views</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
