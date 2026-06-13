import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { loginGitlab } from '../../../api/client'
import { PLATFORMS } from '../../../platforms'

/**
 * GitLab's follower/following lists aren't public (the API returns 403 without a
 * token), so there's no "search any handle" flow like GitHub. Instead we gate
 * the GitLab tab behind sign-in: the user authorizes, then we auto-load their
 * own list. This is what guests see on the GitLab tab.
 */
export const GitlabSignInGate = () => {
  const { t } = useTranslation()
  const Icon = PLATFORMS.gitlab.icon
  const [redirecting, setRedirecting] = useState(false)

  const start = () => {
    setRedirecting(true)
    loginGitlab()
  }

  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/15 text-brand-400">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-fg">{t('results.gitlabGateTitle')}</p>
        <p className="max-w-md text-sm text-fg-muted">{t('results.gitlabGateBody')}</p>
      </div>
      <button
        onClick={start}
        disabled={redirecting}
        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-bg outline-none transition-colors hover:bg-brand-600 focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {redirecting ? (
          <LoaderCircle className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
        ) : (
          <Icon className="h-4 w-4" aria-hidden="true" />
        )}
        {redirecting
          ? t('results.signingIn')
          : t('results.signInWith', { platform: 'GitLab' })}
      </button>
      <p className="max-w-sm text-xs text-fg-muted">{t('results.privacyNote')}</p>
    </div>
  )
}
