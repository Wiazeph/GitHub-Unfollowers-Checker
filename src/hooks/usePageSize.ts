import { useEffect, useState } from 'react'

/** Tailwind `sm` breakpoint — below it we show a single-column grid. */
const DESKTOP_QUERY = '(min-width: 640px)'

const DESKTOP_PAGE_SIZE = 60 // 20 rows × 3 columns
const MOBILE_PAGE_SIZE = 30

/**
 * How many accounts to show per page, responsive to viewport width:
 * 60 on desktop (3-column grid), 30 on mobile (single column).
 */
export const usePageSize = (): number => {
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia(DESKTOP_QUERY).matches,
  )

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY)
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return isDesktop ? DESKTOP_PAGE_SIZE : MOBILE_PAGE_SIZE
}
