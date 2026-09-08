import { SmartLink } from '@/components/SmartLink'
import { useCopy } from '@/lib/useSiteContent'
import styles from './Hero.module.css'

export function Hero() {
  const copy = useCopy()

  return (
    <section className={styles.hero}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.badge}>
        <span className={styles.dot} />
        {copy('home.hero.badge')}
      </div>
      <h1 className={styles.title}>
        {copy('home.hero.title_before')}
        <span className={styles.accent}>{copy('home.hero.title_accent')}</span>
        {copy('home.hero.title_after')}
      </h1>
      <p className={styles.lede}>{copy('home.hero.lede')}</p>
      <div className={styles.actions}>
        <SmartLink to={copy('home.hero.cta_primary_href', '/contact')} className="btn btn--primary">
          {copy('home.hero.cta_primary_label')}
        </SmartLink>
        <SmartLink
          to={copy('home.hero.cta_secondary_href', '/services')}
          className="btn btn--ghost"
        >
          {copy('home.hero.cta_secondary_label')}
        </SmartLink>
      </div>
    </section>
  )
}
