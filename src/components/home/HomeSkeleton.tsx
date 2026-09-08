import { Skeleton, SkeletonScreen } from '@/components/Skeleton'
import styles from './HomeSkeleton.module.css'

function ThumbCard({ lines = 2 }: { lines?: number }) {
  return (
    <div className={styles.card}>
      <Skeleton w="100%" h="auto" radius="var(--r-md)" className={styles.thumb} />
      <Skeleton w="45%" h={11} />
      <Skeleton w="85%" h={16} />
      {lines > 1 && <Skeleton w="60%" h={13} />}
    </div>
  )
}

export function HomeSkeleton() {
  return (
    <SkeletonScreen>
      <section className={styles.hero}>
        <Skeleton w={190} h={31} radius="var(--r-pill)" className={styles.badge} />
        <Skeleton w="min(760px, 92%)" h={72} />
        <Skeleton w="min(640px, 80%)" h={72} />
        <Skeleton w="min(420px, 55%)" h={72} />
        <Skeleton w="min(560px, 90%)" h={17} />
        <Skeleton w="min(430px, 70%)" h={17} />
        <div className={styles.actions}>
          <Skeleton w={168} h={48} radius="var(--r-pill)" />
          <Skeleton w={132} h={48} radius="var(--r-pill)" />
        </div>
      </section>

      <section className={styles.strip}>
        <div className={styles.stripGrid}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} w="100%" h="auto" radius="var(--r-md)" className={styles.thumb} />
          ))}
        </div>
      </section>

      <section className={styles.work}>
        <Skeleton w={220} h={13} />
        <div className={styles.workGrid}>
          {[0, 1, 2].map((i) => (
            <ThumbCard key={i} />
          ))}
        </div>
      </section>

      <section className={styles.rail}>
        <div className={styles.railPanel}>
          <Skeleton w={240} h={26} />
          <div className={styles.railGrid}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} w="100%" h={54} radius="var(--r-md)" />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.stats}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles.stat}>
            <Skeleton w="55%" h={40} />
            <Skeleton w="75%" h={14} />
          </div>
        ))}
      </section>
    </SkeletonScreen>
  )
}
