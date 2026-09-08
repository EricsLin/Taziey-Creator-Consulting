import { useTheme } from '@/lib/useTheme'
import styles from './ThemeToggle.module.css'

/* Two icons, both always rendered — the CSS crossfades between them so the
   swap animates instead of popping. */
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.4" />
      <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.5 1.5M17.1 17.1l1.5 1.5M18.6 5.4l-1.5 1.5M6.9 17.1l-1.5 1.5" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20.2 14.6A8.6 8.6 0 1 1 9.4 3.8a6.9 6.9 0 0 0 10.8 10.8Z" />
    </svg>
  )
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      /* The button is an icon only, so it needs its own label; `title` gives
         sighted users the same hint on hover. */
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <span className={styles.icons} data-theme-state={theme}>
        <span className={`${styles.icon} ${styles['icon--sun']}`}>
          <SunIcon />
        </span>
        <span className={`${styles.icon} ${styles['icon--moon']}`}>
          <MoonIcon />
        </span>
      </span>
    </button>
  )
}
