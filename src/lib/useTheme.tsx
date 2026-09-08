import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/** What the user picked. `system` defers to the OS setting. */
export type ThemePref = 'light' | 'dark' | 'system'
/** What `system` actually resolves to — the only two things the CSS knows about. */
export type Theme = 'light' | 'dark'

/* Kept in sync with the boot script in index.html, which applies the stored
   preference before first paint so the page never flashes the wrong theme. */
const STORAGE_KEY = 'taziey-theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

/** localStorage throws in some privacy modes, so every access is guarded. */
function readStored(): ThemePref {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  } catch {
    /* unavailable — fall through to the system default */
  }
  return 'system'
}

function writeStored(pref: ThemePref) {
  try {
    localStorage.setItem(STORAGE_KEY, pref)
  } catch {
    /* not persisting is survivable; the choice still applies this session */
  }
}

function systemTheme(): Theme {
  return window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light'
}

type ThemeContextValue = {
  /** The user's preference, including `system`. */
  pref: ThemePref
  /** The theme actually on screen. */
  theme: Theme
  setPref: (pref: ThemePref) => void
  /** Flip to the opposite of what's currently showing. */
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(readStored)
  const [system, setSystem] = useState<Theme>(systemTheme)

  // Follow the OS while the preference is `system` (and stay subscribed either
  // way, so switching back to `system` is already up to date).
  useEffect(() => {
    const mq = window.matchMedia?.(DARK_QUERY)
    if (!mq) return
    const onChange = (e: MediaQueryListEvent) => setSystem(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const theme: Theme = pref === 'system' ? system : pref

  // The single place the theme reaches the DOM. tokens.css keys off this.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const setPref = useCallback((next: ThemePref) => {
    setPrefState(next)
    writeStored(next)
  }, [])

  const toggle = useCallback(() => {
    setPref(theme === 'dark' ? 'light' : 'dark')
  }, [setPref, theme])

  const value = useMemo(
    () => ({ pref, theme, setPref, toggle }),
    [pref, theme, setPref, toggle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
