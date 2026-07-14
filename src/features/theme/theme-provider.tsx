import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  isThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '@/features/theme/model'

const STORAGE_KEY = 'rike-theme-preference'
const MEDIA_QUERY = '(prefers-color-scheme: dark)'

interface ThemeContextValue {
  preference: ThemePreference
  resolvedTheme: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function readThemePreference(storage: Pick<Storage, 'getItem'> = localStorage) {
  try {
    const value = storage.getItem(STORAGE_KEY)
    return isThemePreference(value) ? value : 'system'
  } catch {
    return 'system'
  }
}

export function applyTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
  root: HTMLElement = document.documentElement,
) {
  const resolved = resolveTheme(preference, systemPrefersDark)
  root.dataset.theme = resolved
  root.dataset.themePreference = preference
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute(
    'content',
    resolved === 'dark' ? '#171a18' : '#e8ece7',
  )
  return resolved
}

export function initializeTheme() {
  const preference = readThemePreference()
  const systemPrefersDark = window.matchMedia?.(MEDIA_QUERY).matches ?? false
  applyTheme(preference, systemPrefersDark)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const media = useMemo(() => window.matchMedia?.(MEDIA_QUERY), [])
  const [preference, setPreferenceState] = useState<ThemePreference>(readThemePreference)
  const [systemPrefersDark, setSystemPrefersDark] = useState(media?.matches ?? false)
  const resolvedTheme = resolveTheme(preference, systemPrefersDark)

  useEffect(() => {
    if (!media) return
    const update = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [media])

  useEffect(() => {
    applyTheme(preference, systemPrefersDark)
  }, [preference, systemPrefersDark])

  const setPreference = (nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference)
    try {
      localStorage.setItem(STORAGE_KEY, nextPreference)
    } catch {
      // The active session still uses the selected theme when storage is unavailable.
    }
  }

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, setPreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}
