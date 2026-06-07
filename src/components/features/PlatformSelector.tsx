import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  INSTAGRAM_TAB,
  TWITTER_TAB,
  PLATFORM_LIST,
  type SelectorTab,
} from '../../platforms'

interface PlatformSelectorProps {
  value: SelectorTab
  onChange: (tab: SelectorTab) => void
}

// Platform names are proper nouns — they stay the same across languages.
// Order: GitHub, Bluesky, Instagram, X.
const TABS = [
  ...PLATFORM_LIST.map((p) => ({ id: p.id as SelectorTab, label: p.label, icon: p.icon })),
  { id: INSTAGRAM_TAB.id as SelectorTab, label: INSTAGRAM_TAB.label, icon: INSTAGRAM_TAB.icon },
  { id: TWITTER_TAB.id as SelectorTab, label: TWITTER_TAB.label, icon: TWITTER_TAB.icon },
]

/** Build a horizontal mask that fades whichever edges can still be scrolled.
 *  Using a mask fades the actual content (vs. painting an overlay on top), so it
 *  never tints or leaves a sliver on the tab underneath. */
const edgeMask = (left: boolean, right: boolean): string | undefined => {
  if (!left && !right) return undefined
  const start = left ? 'transparent, black 1.5rem' : 'black'
  const end = right ? 'black calc(100% - 1.5rem), transparent' : 'black'
  return `linear-gradient(to right, ${start}, ${end})`
}

/**
 * Platform tabs. They scroll horizontally when they don't fit (mobile); the
 * scrollable edges fade out (via a mask) to hint there's more. Theme, language
 * and sign-in now live in the header, so this bar is just the tabs.
 */
export const PlatformSelector = ({ value, onChange }: PlatformSelectorProps) => {
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  const updateEdges = () => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setEdges({
      left: scrollLeft > 1,
      right: scrollLeft + clientWidth < scrollWidth - 1,
    })
  }

  useEffect(() => {
    updateEdges()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateEdges, { passive: true })
    window.addEventListener('resize', updateEdges)
    return () => {
      el.removeEventListener('scroll', updateEdges)
      window.removeEventListener('resize', updateEdges)
    }
  }, [])

  const mask = edgeMask(edges.left, edges.right)

  return (
    <div className="mx-auto flex h-11 w-fit max-w-full items-center gap-1 rounded-lg border border-border bg-surface px-1">
      {/* Scrollable platform tabs; edges fade via a mask (no overlay → no tint).
          The bar hugs its tabs and centers; on narrow screens min-w-0 lets it
          shrink and scroll horizontally instead of overflowing. */}
      <div
        ref={scrollRef}
        role="tablist"
        aria-label={t('selector.label')}
        style={
          mask
            ? { maskImage: mask, WebkitMaskImage: mask }
            : undefined
        }
        className="scrollbar-none flex min-w-0 items-center gap-1 overflow-x-auto py-1.5"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = value === id
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(id)}
              className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-400 ${
                active
                  ? 'bg-brand-500 text-bg'
                  : 'text-fg-muted hover:bg-surface-hover hover:text-fg'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
