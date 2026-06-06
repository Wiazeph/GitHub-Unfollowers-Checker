import { useAuth } from '../../hooks/useAuth'
import { useActiveTab } from '../../hooks/activeTab'
import { ThemeToggle } from '../ui/ThemeToggle'
import { LanguageToggle } from '../ui/LanguageToggle'
import { AuthStatus } from './AuthStatus'
import { HeaderSignIn } from './HeaderSignIn'
import { PLATFORMS } from '../../platforms'
import type { PlatformId } from '../../types/platform'

/**
 * Top-right header cluster. The leading slot is session-aware: when signed in
 * to the active platform it shows "@handle · Sign out" (AuthStatus); otherwise
 * it shows an always-visible "Sign in" button for that platform — so a fresh
 * visitor finds sign-in immediately, without having to search first. The
 * standalone tabs (X / Instagram) have no server sign-in, so the slot is empty
 * there. Theme + language toggles are always pinned on the right.
 */
export const HeaderActions = () => {
  const { data: auth, isLoading } = useAuth()
  const { tab } = useActiveTab()

  // Only GitHub / Bluesky have a server session + sign-in.
  const platform: PlatformId | null =
    tab === 'github' || tab === 'bluesky' ? tab : null
  const isAuthedHere = platform ? Boolean(auth?.[platform]) : false
  const canSignIn =
    platform !== null && PLATFORMS[platform].authKind === 'oauth'

  return (
    <div className="flex items-center gap-2">
      {!isLoading && platform && (
        isAuthedHere ? (
          <AuthStatus />
        ) : (
          canSignIn && <HeaderSignIn platform={platform} />
        )
      )}
      <ThemeToggle />
      <LanguageToggle />
    </div>
  )
}
