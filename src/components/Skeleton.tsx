import styles from './Skeleton.module.css'

interface SkeletonProps {
  /** Any CSS length; a bare number is treated as pixels. */
  w?: string | number
  h?: string | number
  radius?: string
  className?: string
}

/** A single shimmering placeholder block. */
export function Skeleton({ w = '100%', h = 14, radius, className = '' }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.block} ${className}`}
      style={{ width: w, height: h, borderRadius: radius }}
    />
  )
}

/**
 * Wraps a page's placeholder layout. One `role="status"` for the whole screen
 * keeps screen readers hearing "Loading" once instead of per block.
 */
export function SkeletonScreen({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-label="Loading" className={styles.screen}>
      {children}
    </div>
  )
}
