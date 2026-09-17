import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { SiteContent } from '@/types'
import { fetchSiteContent } from './content'
import { COPY_DEFAULTS } from './copyKeys'

interface State {
  content: SiteContent | null
  loading: boolean
  error: Error | null
  refresh: () => void
}

const SiteContentContext = createContext<State>({
  content: null,
  loading: true,
  error: null,
  refresh: () => {},
})

/**
 * Loads all site content once for the whole app. Sits above the router so the
 * nav and footer can read editable copy without each page refetching.
 */
export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [nonce, setNonce] = useState(0)
  const [state, setState] = useState<Omit<State, 'refresh'>>({
    content: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true }))
    fetchSiteContent()
      .then((content) => {
        if (alive) setState({ content, loading: false, error: null })
      })
      .catch((error: Error) => {
        if (alive) setState({ content: null, loading: false, error })
      })
    return () => {
      alive = false
    }
  }, [nonce])

  const refresh = useCallback(() => setNonce((n) => n + 1), [])
  const value = useMemo(() => ({ ...state, refresh }), [state, refresh])

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>
}

export function useSiteContent(): State {
  return useContext(SiteContentContext)
}

/**
 * Reader for `site_copy`. A key that has a row uses it, blank included — an
 * admin who clears a field means to clear it. Everything else falls back to the
 * default in `copyKeys.ts`, which covers both the keys nobody has edited yet
 * and the first paint before the fetch lands, so the site never flashes blank.
 */
export function useCopy(): (key: string, fallback?: string) => string {
  const { content } = useSiteContent()
  return useCallback(
    (key: string, fallback?: string) => {
      const stored = content?.copy[key]
      if (stored !== undefined) return stored
      return fallback ?? COPY_DEFAULTS[key] ?? ''
    },
    [content],
  )
}
