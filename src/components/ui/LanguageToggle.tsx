import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Languages, Check } from 'lucide-react'
import { SUPPORTED_LANGUAGES } from '../../i18n'

/** Compact language menu: globe button → list of the 5 supported languages. */
export const LanguageToggle = () => {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = i18n.resolvedLanguage ?? i18n.language

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = (code: string) => {
    void i18n.changeLanguage(code)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t('language.label')}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t('language.label')}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-sm font-medium text-fg-muted outline-none transition-colors hover:bg-surface-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <Languages className="h-4 w-4" aria-hidden="true" />
        <span className="uppercase">{current}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 min-w-36 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg shadow-black/30"
        >
          {SUPPORTED_LANGUAGES.map(({ code, label }) => {
            const active = current === code
            return (
              <button
                key={code}
                role="menuitemradio"
                aria-checked={active}
                onClick={() => choose(code)}
                className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-1.5 text-left text-sm outline-none transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover ${
                  active ? 'text-fg' : 'text-fg-muted'
                }`}
              >
                {label}
                {active && (
                  <Check className="h-4 w-4 text-brand-500" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
