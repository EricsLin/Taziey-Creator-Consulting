import { useMemo, useState } from 'react'
import { ImageSlot } from '@/components/ImageSlot'
import { PageState } from '@/components/PageState'
import { useVideoModal } from '@/components/VideoModal'
import { Skeleton, SkeletonScreen } from '@/components/Skeleton'
import { fillCopy } from '@/lib/copyKeys'
import { useCopy, useSiteContent } from '@/lib/useSiteContent'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import styles from './Content.module.css'

/** Placeholder shaped like the real page — same widths, same grid. */
function ContentSkeleton() {
  return (
    <SkeletonScreen>
      <section className={styles.intro}>
        <Skeleton w={130} h={13} className={styles.eyebrowSpacing} />
        <div className={styles.skelTitle}>
          <Skeleton w="min(560px, 80%)" h={54} />
          <Skeleton w="min(420px, 60%)" h={54} />
        </div>
        <div className={styles.skelStack}>
          <Skeleton w="min(520px, 90%)" h={17} />
          <Skeleton w="min(380px, 70%)" h={17} />
        </div>
      </section>

      <div className={styles.filters}>
        {[92, 118, 104, 86, 110].map((w, i) => (
          <Skeleton key={i} w={w} h={39} radius="var(--r-pill)" />
        ))}
      </div>

      <section className={styles.grid}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <article key={i} className={styles.card}>
            <Skeleton w="100%" h="auto" radius="var(--r-md)" className={styles.thumb} />
            <div className={`${styles.body} ${styles.skelStack}`}>
              <Skeleton w={70} h={11} />
              <Skeleton w="88%" h={16} />
              <Skeleton w="55%" h={13} />
            </div>
          </article>
        ))}
      </section>
    </SkeletonScreen>
  )
}

export function Content() {
  const { content, loading, error } = useSiteContent()
  const copy = useCopy()
  useDocumentTitle('meta.title.content')
  const { open } = useVideoModal()
  const [filter, setFilter] = useState<string | null>(null)

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    content?.videos.forEach((v) => map.set(v.niche, (map.get(v.niche) ?? 0) + 1))
    return map
  }, [content])

  if (loading) return <ContentSkeleton />
  if (error || !content) return <PageState>{copy('content.error')}</PageState>

  const allLabel = copy('content.filter_all_label')
  // `null` is the All tab, so a niche can be renamed to anything without
  // colliding with the tab that means "no filter".
  const tabs: Array<{ key: string; label: string; niche: string | null }> = [
    { key: '__all__', label: allLabel, niche: null },
    ...content.niches.map((niche) => ({ key: niche, label: niche, niche })),
  ]
  const visible = content.videos.filter((v) => filter === null || v.niche === filter)

  return (
    <>
      <section className={styles.intro}>
        <div className={`eyebrow ${styles.eyebrowSpacing}`}>{copy('content.eyebrow')}</div>
        <h1 className={styles.title}>{copy('content.title')}</h1>
        <p className={styles.lede}>{copy('content.lede')}</p>
      </section>

      <div className={styles.filters} role="group" aria-label={copy('content.filter_label')}>
        {tabs.map((tab) => {
          const active = tab.niche === filter
          return (
            <button
              key={tab.key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(tab.niche)}
              className={`${styles.filter} ${active ? styles['filter--active'] : ''}`}
            >
              {tab.label}{' '}
              <span className={styles.count}>
                {tab.niche === null ? content.videos.length : counts.get(tab.niche) ?? 0}
              </span>
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <div className={styles.empty}>{copy('content.empty')}</div>
      ) : (
        <section className={styles.grid}>
          {visible.map((video) => (
            <article key={video.id} className={styles.card}>
              {/* The whole card opens the detail popup — the stats come before
                  the trip to YouTube. */}
              <button
                type="button"
                className={styles.cardButton}
                onClick={() => open(video)}
                aria-label={fillCopy(copy('video.details_label'), { title: video.title })}
              >
                <div className={styles.thumb}>
                  <ImageSlot
                    src={video.thumbnailUrl}
                    alt={video.title}
                    placeholder={video.niche || copy('video.thumbnail_placeholder')}
                  />
                </div>
                <div className={styles.body}>
                  <div className={styles.niche}>{video.niche.toUpperCase()}</div>
                  <div className={styles.cardTitle}>{video.title}</div>
                  <div className={styles.meta}>
                    <span>{video.creator}</span>
                    <span className={styles.sep}>&bull;</span>
                    <span>
                      {video.views} {copy('video.views_suffix')}
                    </span>
                  </div>
                </div>
              </button>
            </article>
          ))}
        </section>
      )}
    </>
  )
}
