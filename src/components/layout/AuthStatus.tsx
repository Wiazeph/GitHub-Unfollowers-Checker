import { LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { useActiveTab } from '../../hooks/activeTab'
import { logout } from '../../api/client'
import { PLATFORMS } from '../../platforms'
import type { PlatformId } from '../../types/platform'

/**
 * Top-right session indicator. Sessions are per-platform, so this shows the
 * one for the active tab: "@handle · Sign out". On the standalone tabs
 * (X / Instagram) it falls back to any signed-in platform, if one exists.
 */
export const AuthStatus = () => {
  const { t } = useTranslation()
  const { data: auth, isLoading } = useAuth()
  const { tab } = useActiveTab()

  if (isLoading || !auth) return null

  // Prefer the active tab's platform; otherwise the first signed-in one.
  const active = tab === 'github' || tab === 'bluesky' ? tab : null
  const platform: PlatformId | null =
    active && auth[active]
      ? active
      : auth.github
        ? 'github'
        : auth.bluesky
          ? 'bluesky'
          : null

  if (!platform) return null

  const session = auth[platform]
  if (!session) return null

  const Icon = PLATFORMS[platform].icon

  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-fg-muted" aria-hidden="true" />
      <span className="font-medium text-fg">@{session.handle}</span>
      <span aria-hidden="true" className="text-border">
        ·
      </span>
      <button
        onClick={() => void logout(platform)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-fg-muted outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        {t('auth.signOut')}
      </button>
    </div>
  )
}
