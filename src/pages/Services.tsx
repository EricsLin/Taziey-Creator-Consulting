import { useMemo, useState } from 'react'
import { PageState } from '@/components/PageState'
import { Skeleton, SkeletonScreen } from '@/components/Skeleton'
import { SmartLink } from '@/components/SmartLink'
import { useCopy, useSiteContent } from '@/lib/useSiteContent'
import type { Service } from '@/types'
import styles from './Services.module.css'

const ALL = 'All'

/**
 * Every description opens with a "what it is" sentence and follows with the
 * "how it works" detail — splitting them lets the card lead with the point.
 */
function splitDescription(description: string): [string, string] {
  const end = description.indexOf('. ')
  if (end === -1) return [description, '']
  return [description.slice(0, end + 1), description.slice(end + 2)]
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const [lead, detail] = splitDescription(service.description)
  return (
    <article className={styles.card}>
      <span className={styles.num}>{String(index).padStart(2, '0')}</span>
      <h3 className={styles.cardName}>{service.name}</h3>
      <p className={styles.cardLead}>{lead}</p>
      {detail && <p className={styles.cardDetail}>{detail}</p>}
    </article>
  )
}

/** Placeholder shaped like the real page — same widths, same grid. */
function ServicesSkeleton() {
  return (
    <SkeletonScreen>
      <section className={styles.intro}>
        <Skeleton w={150} h={13} className={styles.eyebrowSpacing} />
        <div className={styles.skelTitle}>
          <Skeleton w="min(600px, 85%)" h={54} />
          <Skeleton w="min(380px, 55%)" h={54} />
        </div>
        <div className={styles.skelStack}>
          <Skeleton w="min(520px, 90%)" h={17} />
          <Skeleton w="min(400px, 72%)" h={17} />
        </div>
      </section>

      <div className={styles.filters}>
        <div className={styles.filterRow}>
          {[120, 96, 132, 108].map((w, i) => (
            <Skeleton key={i} w={w} h={37} radius="var(--r-pill)" />
          ))}
        </div>
      </div>

      <section className={styles.groups}>
        {[0, 1].map((group) => (
          <div key={group} className={styles.group}>
            <div className={styles.groupHead}>
              <Skeleton w={180} h={25} />
              <Skeleton w={220} h={15} />
            </div>
            <div className={styles.grid}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`${styles.card} ${styles.skelStack}`}>
                  <Skeleton w={26} h={12} />
                  <Skeleton w="70%" h={20} />
                  <Skeleton w="95%" h={15} />
                  <Skeleton w="80%" h={15} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </SkeletonScreen>
  )
}

export function Services() {
  const { content, loading, error } = useSiteContent()
  const copy = useCopy()
  const [filter, setFilter] = useState<string>(ALL)

  const groups = useMemo(() => {
    if (!content) return []
    return content.categories
      .map((category) => ({
        category,
        items: content.services.filter((service) => service.category === category.name),
      }))
      .filter((group) => group.items.length > 0)
  }, [content])

  // Numbering runs across the whole list, not per group, so a card keeps its
  // number when a filter is applied.
  const numberOf = useMemo(() => {
    const map = new Map<string, number>()
    content?.services.forEach((service, i) => map.set(service.id, i + 1))
    return map
  }, [content])

  if (loading) return <ServicesSkeleton />
  if (error || !content) return <PageState>Couldn&rsquo;t load the services list.</PageState>

  const shown = filter === ALL ? groups : groups.filter((g) => g.category.name === filter)

  return (
    <>
      <section className={styles.intro}>
        <div className={`eyebrow ${styles.eyebrowSpacing}`}>{copy('services.eyebrow')}</div>
        <h1 className={styles.title}>{copy('services.title')}</h1>
        <p className={styles.lede}>{copy('services.lede')}</p>
      </section>

      <section className={styles.filters} aria-label="Filter services by area">
        <div className={styles.filterRow}>
          <button
            type="button"
            className={`${styles.chip} ${filter === ALL ? styles['chip--on'] : ''}`}
            aria-pressed={filter === ALL}
            onClick={() => setFilter(ALL)}
          >
            {copy('services.filter_all_label', 'Everything')}{' '}
            <span className={styles.chipCount}>{content.services.length}</span>
          </button>
          {groups.map((group) => (
            <button
              key={group.category.id}
              type="button"
              className={`${styles.chip} ${filter === group.category.name ? styles['chip--on'] : ''}`}
              aria-pressed={filter === group.category.name}
              onClick={() => setFilter(group.category.name)}
            >
              {group.category.name} <span className={styles.chipCount}>{group.items.length}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.groups}>
        {shown.map((group) => (
          <div key={group.category.id} className={styles.group}>
            <div className={styles.groupHead}>
              <h2 className={styles.groupTitle}>{group.category.name}</h2>
              <p className={styles.groupBlurb}>{group.category.blurb}</p>
            </div>
            <div className={styles.grid}>
              {group.items.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  index={numberOf.get(service.id) ?? 0}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className={styles.consult}>
        <div className={styles.consultPanel}>
          <div className={styles.consultBody}>
            <div className={`eyebrow ${styles.eyebrowSpacing}`}>
              {copy('services.consult.eyebrow')}
            </div>
            <h2 className={styles.consultTitle}>{copy('services.consult.title')}</h2>
            <p className={styles.consultText}>{copy('services.consult.text')}</p>
            <div className={styles.bullets}>
              {copy('services.consult.bullets')
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => (
                  <div key={line} className={styles.bullet}>
                    <span className={styles.arrow}>&rarr;</span> {line}
                  </div>
                ))}
            </div>
          </div>
          <div className={styles.priceCol}>
            <div className={styles.priceRow}>
              <div className={styles.price}>{copy('services.consult.price')}</div>
              <div className={styles.per}>{copy('services.consult.per')}</div>
            </div>
            <div className={styles.priceNote}>{copy('services.consult.price_note')}</div>
            <SmartLink to={copy('services.consult.book_href', '/contact')} className={styles.book}>
              {copy('services.consult.book_label')}
            </SmartLink>
          </div>
        </div>
      </section>
    </>
  )
}
