import i18n from '../i18n'
import {
  ApiError,
  type ApiErrorBody,
  type AuthState,
  type PlatformId,
  type UnfollowersResponse,
  type UnfollowResult,
} from '../types/platform'

/** Call the serverless proxy to compute the unfollowers for a handle. */
export const fetchUnfollowers = async (
  platform: PlatformId,
  handle: string,
): Promise<UnfollowersResponse> => {
  // GitLab's follow lists aren't public, so the server reads the signed-in
  // user's own list from their session token; the handle is ignored there.
  const url = `/api/unfollowers?platform=${platform}&handle=${encodeURIComponent(handle)}`

  let response: Response
  try {
    response = await fetch(url)
  } catch {
    throw new ApiError(
      { error: i18n.t('errors.network'), code: 'UPSTREAM' },
      0,
    )
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null
    // Localize known error codes (the server's own message is English); fall
    // back to a 504 timeout message or a generic one.
    const localized = body ? localizeError(body) : null
    const fallback: ApiErrorBody =
      response.status === 504
        ? { error: i18n.t('errors.timeout'), code: 'UPSTREAM' }
        : { error: i18n.t('errors.generic'), code: 'UPSTREAM' }
    throw new ApiError(localized ?? fallback, response.status)
  }

  return (await response.json()) as UnfollowersResponse
}

/** Replace the server's English message with a localized one when we know the code. */
const localizeError = (body: ApiErrorBody): ApiErrorBody => {
  switch (body.code) {
    case 'RATE_LIMIT':
      return { ...body, error: i18n.t('errors.rateLimit') }
    case 'NOT_FOUND':
      return { ...body, error: i18n.t('errors.notFound') }
    default:
      return body
  }
}

/** Fetch the current per-platform authentication state. */
export const fetchMe = async (): Promise<AuthState> => {
  const empty: AuthState = { github: null, bluesky: null, gitlab: null, mastodon: null }
  const response = await fetch('/api/auth/me')
  if (!response.ok) return empty
  return { ...empty, ...((await response.json()) as Partial<AuthState>) }
}

/**
 * Remember which platform an OAuth flow was started for, so that when the
 * provider redirects back we can return the user to that tab — not just the
 * first platform they happen to be signed in to. Read once and cleared on the
 * next load (see Unfollowers' tab-initialization effect).
 */
export const PENDING_AUTH_KEY = 'pendingAuthPlatform'

const rememberPendingAuth = (platform: PlatformId): void => {
  try {
    localStorage.setItem(PENDING_AUTH_KEY, platform)
  } catch {
    // Private mode / storage disabled — fall back to default tab behavior.
  }
}

/** Redirect the browser into the GitHub OAuth flow. */
export const login = (): void => {
  rememberPendingAuth('github')
  window.location.href = '/api/auth/login'
}

/** Redirect the browser into the Bluesky OAuth flow for a given handle. */
export const loginBluesky = (handle: string): void => {
  rememberPendingAuth('bluesky')
  window.location.href = `/api/auth/bluesky/login?handle=${encodeURIComponent(handle)}`
}

/** Redirect the browser into the GitLab OAuth flow (one-click, like GitHub). */
export const loginGitlab = (): void => {
  rememberPendingAuth('gitlab')
  window.location.href = '/api/auth/gitlab/login'
}

/**
 * Redirect the browser into the Mastodon OAuth flow. Single-instance MVP: the
 * server signs in against its configured instance, so this is a one-click
 * redirect (the public search box is what accepts any user@instance handle).
 */
export const loginMastodon = (): void => {
  rememberPendingAuth('mastodon')
  window.location.href = '/api/auth/mastodon/login'
}

/** Sign out of one platform (or all if omitted) and reload. */
export const logout = async (platform?: PlatformId): Promise<void> => {
  const query = platform ? `?platform=${platform}` : ''
  await fetch(`/api/auth/logout${query}`, { method: 'POST' })
  window.location.reload()
}

/** Unfollow one or more accounts on behalf of the signed-in user. */
export const unfollowAccounts = async (
  platform: PlatformId,
  targets: string[],
): Promise<UnfollowResult> => {
  let response: Response
  try {
    response = await fetch('/api/unfollow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, targets }),
    })
  } catch {
    throw new ApiError(
      { error: i18n.t('errors.network'), code: 'UPSTREAM' },
      0,
    )
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null
    throw new ApiError(
      body ?? { error: i18n.t('errors.unfollowGeneric'), code: 'UPSTREAM' },
      response.status,
    )
  }

  return (await response.json()) as UnfollowResult
}
