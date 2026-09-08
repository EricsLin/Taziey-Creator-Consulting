import styles from './PageState.module.css'

export function PageState({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrap} role="status">
      {children}
    </div>
  )
}
