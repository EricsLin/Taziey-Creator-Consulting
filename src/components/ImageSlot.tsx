import { useEffect, useState } from 'react'
import styles from './ImageSlot.module.css'

interface Props {
  src?: string | null
  alt?: string
  /** Shown as a hint while the real asset is missing. */
  placeholder?: string
  shape?: 'rect' | 'circle'
}

/**
 * Stand-in for an uploaded image. Renders the asset when we have one and a
 * labelled placeholder when we don't, so unpopulated CMS rows still lay out.
 * Also falls back to the placeholder if the asset fails to load — the seed
 * imagery is hotlinked from third parties, so a dead URL shouldn't show a
 * broken-image icon.
 */
export function ImageSlot({ src, alt = '', placeholder = 'image', shape = 'rect' }: Props) {
  const [failed, setFailed] = useState(false)

  useEffect(() => setFailed(false), [src])

  return (
    <div className={`${styles.slot} ${shape === 'circle' ? styles['slot--circle'] : ''}`}>
      {src && !failed ? (
        <img
          className={styles.img}
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className={styles.placeholder} aria-hidden="true">
          <span className={styles.label}>{placeholder}</span>
        </div>
      )}
    </div>
  )
}
