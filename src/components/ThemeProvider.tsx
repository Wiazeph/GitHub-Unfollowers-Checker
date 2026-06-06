import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from '../hooks/themeContext'

const STORAGE_KEY = 'theme'

/** Read the theme already applied to <html> by the pre-paint script in index.html. */
const currentTheme = (): Theme =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light'

/**
 * Shared dark/light theme state. The initial class is set before paint (see the
 * inline script in index.html); this provider syncs React state with it,
 * persists changes, and follows the OS preference until the user chooses.
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(currentTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore storage failures (private mode, etc.)
    }
  }, [theme])

  // Follow OS changes only while the user hasn't chosen explicitly.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return
      } catch {
        // fall through and follow the system
      }
      setTheme(event.matches ? 'dark' : 'light')
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>
  )
}
