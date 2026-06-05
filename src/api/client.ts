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
  let response: Response
  try {
    response = await fetch(
      `/api/unfollowers?platform=${platform}&handle=${encodeURIComponent(handle)}`,
    )
  } catch {
    throw new ApiError(
      { error: 'Network error. Check your connection and try again.', code: 'UPSTREAM' },
      0,
    )
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null
    // Vercel returns no JSON body on a function timeout (504).
    const fallback: ApiErrorBody =
      response.status === 504
        ? {
            error:
              'This account is very large and timed out. Try again, or a smaller account.',
            code: 'UPSTREAM',
          }
        : { error: 'Something went wrong. Please try again.', code: 'UPSTREAM' }
    throw new ApiError(body ?? fallback, response.status)
  }

  return (await response.json()) as UnfollowersResponse
}

/** Fetch the current authentication state. */
export const fetchMe = async (): Promise<AuthState> => {
  const response = await fetch('/api/auth/me')
  if (!response.ok) return { authenticated: false }
  return (await response.json()) as AuthState
}

/** Redirect the browser into the GitHub OAuth flow. */
export const login = (): void => {
  window.location.href = '/api/auth/login'
}

/** Clear the session and reload. */
export const logout = async (): Promise<void> => {
  await fetch('/api/auth/logout', { method: 'POST' })
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
      { error: 'Network error. Check your connection and try again.', code: 'UPSTREAM' },
      0,
    )
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null
    throw new ApiError(
      body ?? { error: 'Could not unfollow. Please try again.', code: 'UPSTREAM' },
      response.status,
    )
  }

  return (await response.json()) as UnfollowResult
}
