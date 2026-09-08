import { useState } from 'react'
import type { Creator } from '@/types'
import { ImageSlot } from '@/components/ImageSlot'
import { useInterval } from '@/lib/useInterval'
import { useCopy } from '@/lib/useSiteContent'
import styles from './CreatorRail.module.css'

const PER_PAGE = 6

interface Props {
  creators: Creator[]
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

export function CreatorRail({ creators }: Props) {
  const copy = useCopy()
  const pages = chunk(creators, PER_PAGE)
  const [page, setPage] = useState(0)
  useInterval(() => setPage((p) => (p + 1) % Math.max(1, pages.length)), 5600)

  const active = pages.length ? page % pages.length : 0

  return (
    <section className={styles.section}>
      <div className={styles.panel}>
        <div className={styles.head}>
          <div>
            <h2 className={styles.title}>{copy('home.creators.title')}</h2>
            <p className={styles.sub}>{copy('home.creators.sub')}</p>
          </div>
          <div className={styles.dots}>
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show creators ${i * PER_PAGE + 1}–${i * PER_PAGE + PER_PAGE}`}
                aria-current={i === active}
                onClick={() => setPage(i)}
                className={`${styles.dot} ${i === active ? styles['dot--active'] : ''}`}
              />
            ))}
          </div>
        </div>
        <div className={styles.stage}>
          {pages.map((group, pi) => {
            const on = pi === active
            return (
              <div
                key={pi}
                className={styles.page}
                style={{ opacity: on ? 1 : 0, pointerEvents: on ? 'auto' : 'none' }}
                aria-hidden={!on}
              >
                {group.map((creator, ci) => (
                  <div
                    key={creator.id}
                    className={styles.creator}
                    style={{
                      opacity: on ? 1 : 0,
                      transform: on ? 'none' : 'translateY(14px)',
                      transitionDelay: `${on ? ci * 70 : 0}ms`,
                    }}
                  >
                    <div className={styles.avatar}>
                      <ImageSlot
                        src={creator.avatarUrl}
                        alt={creator.name}
                        placeholder="pfp"
                        shape="circle"
                      />
                    </div>
                    <div className={styles.name}>{creator.name}</div>
                    <div className={styles.subs}>{creator.subscribers} subs</div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
