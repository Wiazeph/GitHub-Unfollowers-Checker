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

/**
 * Top bar: platform tabs on the left, global actions (theme + language) on the
 * right. The actions area is separated so more controls can slot in.
 */
export const PlatformSelector = ({ value, onChange }: PlatformSelectorProps) => {
  const { t } = useTranslation()
  return (
  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface p-1">
    <div role="tablist" aria-label={t('selector.label')} className="flex flex-wrap gap-1">
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = value === id
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-400 ${
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

    {/* Right-side actions: theme + language. */}
    <div className="flex items-center gap-1 pr-0.5">
      <ThemeToggle />
      <LanguageToggle />
    </div>
  </div>
  )
}
