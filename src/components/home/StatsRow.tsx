import type { Stat } from '@/types'
import styles from './StatsRow.module.css'

export function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {stats.map((stat) => (
          <div key={stat.id} className={styles.card}>
            <div className={styles.value}>{stat.value}</div>
            <div className={styles.label}>{stat.label}</div>
            <div className={styles.note}>{stat.note}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
