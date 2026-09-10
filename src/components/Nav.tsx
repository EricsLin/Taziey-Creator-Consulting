import { Link, NavLink } from 'react-router-dom'
import { useCopy } from '@/lib/useSiteContent'
import { ThemeToggle } from './ThemeToggle'
import styles from './Nav.module.css'

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/content', label: 'Content' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
]

export function Nav() {
  const copy = useCopy()

  return (
    <header className={styles.bar}>
      <nav className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <img className={styles.mark} src="/icon.png" alt="" width={30} height={30} />
          <span className={styles.wordmark}>{copy('brand.wordmark', 'Taziey')}</span>
        </Link>
        <div className={styles.links}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles['link--active']}` : styles.link
              }
            >
              {item.label}
            </NavLink>
          ))}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
