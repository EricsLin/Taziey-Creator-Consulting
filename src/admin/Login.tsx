import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import styles from './admin.module.css'

/**
 * Password sign-in for the admin. There is deliberately no sign-up: accounts are
 * created in the Supabase dashboard and added to the `admins` table, which is
 * what RLS actually checks.
 */
export function Login({ notice }: { notice?: string }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signIn(email, password)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.login}>
      <form className={styles.loginCard} onSubmit={handleSubmit}>
        <div className={styles.brand} style={{ padding: 0 }}>
          <span className={styles.mark}>T</span> Taziey admin
        </div>
        <h1 className={styles.loginTitle}>Sign in</h1>
        <p className={styles.loginNote}>
          {notice ?? 'Editing the live site. Admin accounts only.'}
        </p>

        {error && <div className={`${styles.banner} ${styles.bannerError}`}>{error}</div>}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="admin-email">
            Email
          </label>
          <input
            id="admin-email"
            className={styles.input}
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            className={styles.input}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className={`${styles.action} ${styles.actionPrimary}`}
          disabled={busy}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
