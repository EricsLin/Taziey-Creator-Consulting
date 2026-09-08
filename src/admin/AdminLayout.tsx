import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Login } from './Login'
import styles from './admin.module.css'

const SECTIONS: Array<{ label: string; links: Array<{ to: string; label: string }> }> = [
  {
    label: 'Overview',
    links: [{ to: '/admin', label: 'Dashboard' }],
  },
  {
    label: 'Content',
    links: [
      { to: '/admin/videos', label: 'Videos' },
      { to: '/admin/packaging', label: 'Packaging flips' },
      { to: '/admin/creators', label: 'Creators' },
    ],
  },
  {
    label: 'Offer',
    links: [
      { to: '/admin/services', label: 'Services' },
      { to: '/admin/categories', label: 'Service categories' },
      { to: '/admin/stats', label: 'Stats' },
    ],
  },
  {
    label: 'Reach',
    links: [{ to: '/admin/contact', label: 'Contact links' }],
  },
]

/**
 * Admin shell and its gate. Signed-out visitors get the login form; signed-in
 * users who aren't on the `admins` allowlist are told so rather than shown
 * editors whose every save would be rejected by RLS.
 */
export function AdminLayout() {
  const { session, isAdmin, loading, signOut } = useAuth()

  if (loading) return <div className={styles.login}>Checking your session…</div>
  if (!session) return <Login />
  if (isAdmin === null) return <div className={styles.login}>Checking access…</div>
  if (!isAdmin) {
    return (
      <div className={styles.login}>
        <div className={styles.loginCard}>
          <h1 className={styles.loginTitle}>No admin access</h1>
          <p className={styles.loginNote}>
            {session.user.email} is signed in but isn’t on the admin allowlist. Add that address to{' '}
            <code>admin_invites</code> and run <code>select private.sync_admin_invites()</code>, then
            sign in again.
          </p>
          <button type="button" className={styles.action} onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.mark}>T</span> Taziey admin
        </div>

        {SECTIONS.map((section) => (
          <div key={section.label}>
            <div className={styles.sectionLabel}>{section.label}</div>
            {section.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin'}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        ))}

        <div className={styles.sidebarFoot}>
          <div className={styles.who}>{session.user.email}</div>
          <NavLink to="/" className={styles.navLink}>
            View site ↗
          </NavLink>
          <button type="button" className={styles.action} onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
