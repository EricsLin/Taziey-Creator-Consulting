import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthState {
  session: Session | null
  /** null while we're still checking the allowlist. */
  isAdmin: boolean | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  session: null,
  isAdmin: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
})

/**
 * Supabase auth session plus admin-allowlist membership.
 *
 * Being signed in is not the same as being an admin: writes are gated by RLS on
 * the `admins` table, and this checks the same table so the UI can say so up
 * front rather than letting every save fail.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setIsAdmin(null)
      return
    }
    let alive = true
    // RLS only returns a row to members, so a hit here *is* the check.
    supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (alive) setIsAdmin(!!data)
      })
    return () => {
      alive = false
    }
  }, [session])

  const value = useMemo<AuthState>(
    () => ({
      session,
      isAdmin,
      loading,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw new Error(error.message)
      },
      async signOut() {
        await supabase.auth.signOut()
      },
    }),
    [session, isAdmin, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  return useContext(AuthContext)
}
