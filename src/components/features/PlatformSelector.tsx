import { INSTAGRAM_TAB, PLATFORM_LIST, type SelectorTab } from '../../platforms'

interface PlatformSelectorProps {
  value: SelectorTab
  onChange: (tab: SelectorTab) => void
}

const TABS = [
  ...PLATFORM_LIST.map((p) => ({ id: p.id as SelectorTab, label: p.label, icon: p.icon })),
  { id: INSTAGRAM_TAB.id as SelectorTab, label: INSTAGRAM_TAB.label, icon: INSTAGRAM_TAB.icon },
]

/** Segmented control to switch between GitHub / Bluesky / Instagram. */
export const PlatformSelector = ({ value, onChange }: PlatformSelectorProps) => (
  <div
    role="tablist"
    aria-label="Platform"
    className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1"
  >
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
)
