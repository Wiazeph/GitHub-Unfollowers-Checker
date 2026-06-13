import { useEffect, useRef, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { login, loginBluesky, loginGitlab } from '../../api/client'
import { PLATFORMS, normalizeHandle } from '../../platforms'
import type { PlatformId } from '../../types/platform'

/**
 * Always-visible sign-in affordance for the header (guests only). It's keyed to
 * the active platform so a first-time visitor never has to search before they
 * can find how to sign in. GitHub and GitLab are one-click redirects; Bluesky's
 * OAuth needs the handle up front, so it opens a small popover to collect it.
 */
export const HeaderSignIn = ({ platform }: { platform: PlatformId }) => {
  if (platform === 'bluesky') return <BlueskyHeaderSignIn />
  if (platform === 'gitlab') {
    return <OneClickHeaderSignIn platform="gitlab" label="GitLab" onStart={loginGitlab} />
  }
  return <OneClickHeaderSignIn platform="github" label="GitHub" onStart={login} />
}

const buttonClass =
  'inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3 text-sm font-medium text-bg outline-none transition-colors hover:bg-brand-600 focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-70'

const OneClickHeaderSignIn = ({
  platform,
  label,
  onStart,
}: {
  platform: PlatformId
  label: string
  onStart: () => void
}) => {
  const { t } = useTranslation()
  const Icon = PLATFORMS[platform].icon
  const [redirecting, setRedirecting] = useState(false)

  const start = () => {
    setRedirecting(true)
    onStart()
  }

  return (
    <button onClick={start} disabled={redirecting} className={buttonClass}>
      {redirecting ? (
        <LoaderCircle className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
      ) : (
        <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">
        {redirecting ? t('results.signingIn') : t('results.signInWith', { platform: label })}
      </span>
      <span className="sm:hidden">
        {redirecting ? t('results.signingIn') : t('auth.signIn')}
      </span>
    </button>
  )
}

const BlueskyHeaderSignIn = () => {
  const { t } = useTranslation()
  const Icon = PLATFORMS.bluesky.icon
  const [open, setOpen] = useState(false)
  const [handle, setHandle] = useState('')
  const [redirecting, setRedirecting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const normalized = normalizeHandle('bluesky', handle)
  const valid = PLATFORMS.bluesky.handlePattern.test(normalized)

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
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

  // Focus the input when the popover opens.
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!valid || redirecting) return
    setRedirecting(true)
    loginBluesky(normalized)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={buttonClass}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">
          {t('results.signInWith', { platform: 'Bluesky' })}
        </span>
        <span className="sm:hidden">{t('auth.signIn')}</span>
      </button>

      {open && (
        <form
          onSubmit={submit}
          className="absolute right-0 z-20 mt-1 w-72 space-y-2 rounded-lg border border-border bg-surface p-3 shadow-lg shadow-black/30"
        >
          <p className="text-xs text-fg-muted">{t('results.signInNote')}</p>
          <input
            ref={inputRef}
            type="text"
            value={handle}
            onChange={(event) => setHandle(event.target.value)}
            placeholder={t('results.blueskyHandlePlaceholder')}
            aria-label={t('results.blueskyHandleAriaLabel')}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={redirecting}
            className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm text-fg placeholder:text-fg-muted outline-none focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-400/40 disabled:opacity-60"
          />
          <button type="submit" disabled={!valid || redirecting} className={`${buttonClass} w-full`}>
            {redirecting && (
              <LoaderCircle className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
            )}
            {redirecting
              ? t('results.signingIn')
              : t('results.signInWith', { platform: 'Bluesky' })}
          </button>
        </form>
      )}
    </div>
  )
}
