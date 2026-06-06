import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  INSTAGRAM_TAB,
  TWITTER_TAB,
  PLATFORM_LIST,
  type SelectorTab,
} from '../../platforms'
import { ThemeToggle } from '../ui/ThemeToggle'
import { LanguageToggle } from '../ui/LanguageToggle'

interface PlatformSelectorProps {
  value: SelectorTab
  onChange: (tab: SelectorTab) => void
}

// Platform names are proper nouns — they stay the same across languages.
const TABS = [
  ...PLATFORM_LIST.map((p) => ({ id: p.id as SelectorTab, label: p.label, icon: p.icon })),
  { id: TWITTER_TAB.id as SelectorTab, label: TWITTER_TAB.label, icon: TWITTER_TAB.icon },
  { id: INSTAGRAM_TAB.id as SelectorTab, label: INSTAGRAM_TAB.label, icon: INSTAGRAM_TAB.icon },
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
 * Top bar: the platform tabs scroll horizontally when they don't fit (mobile);
 * the scrollable edges fade out (via a mask) to hint there's more. The
 * theme/language actions stay pinned on the right — outside the scroll area, so
 * the language dropdown is never clipped — separated by a divider.
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
    <div className="flex h-11 items-center gap-1 rounded-lg border border-border bg-surface px-1">
      {/* Scrollable platform tabs; edges fade via a mask (no overlay → no tint). */}
      <div
        ref={scrollRef}
        role="tablist"
        aria-label={t('selector.label')}
        style={
          mask
            ? { maskImage: mask, WebkitMaskImage: mask }
            : undefined
        }
        className="scrollbar-none flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-1.5"
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

      {/* Divider + pinned actions (theme, language). */}
      <div className="h-6 w-px shrink-0 bg-border" aria-hidden="true" />
      <div className="flex shrink-0 items-center gap-1">
        <ThemeToggle />
        <LanguageToggle />
      </div>
    </div>
  )
}
