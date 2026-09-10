import { Skeleton, SkeletonScreen } from '@/components/Skeleton'
import styles from './HomeSkeleton.module.css'

export function HomeSkeleton() {
  return (
    <SkeletonScreen>
      {/* Mirrors the hero: slogan left, one big frame right. */}
      <section className={styles.hero}>
        <div className={styles.grid}>
          <div className={styles.slogan}>
            <Skeleton w={110} h={13} className={styles.eyebrow} />
            <Skeleton w="90%" h={44} />
            <Skeleton w="70%" h={44} />
          </div>
          <Skeleton w="100%" h="auto" radius="var(--r-lg)" className={styles.frame} />
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

      <section className={styles.strip}>
        <div className={styles.stripGrid}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} w="100%" h="auto" radius="var(--r-md)" className={styles.thumb} />
          ))}
        </div>
      </section>
    </SkeletonScreen>
  )
}
