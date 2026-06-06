import { LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { logout } from '../../api/client'
import { PLATFORMS } from '../../platforms'

/** Top-right session indicator: "@handle · Sign out" when authenticated. */
export const AuthStatus = () => {
  const { t } = useTranslation()
  const { data: auth, isLoading } = useAuth()

  // Sign-in is offered contextually per platform (see GuestCta); the header only
  // reflects an existing session.
  if (isLoading || !auth?.authenticated) return null

  const Icon = PLATFORMS[auth.platform].icon

  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-fg-muted" aria-hidden="true" />
      <span className="font-medium text-fg">@{auth.handle}</span>
      <span aria-hidden="true" className="text-border">
        ·
      </span>
      <button
        onClick={() => void logout()}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-fg-muted outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        {t('auth.signOut')}
      </button>
    </div>
  )
}
