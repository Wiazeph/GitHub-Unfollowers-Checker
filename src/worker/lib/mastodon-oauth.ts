/**
 * Shared OAuth constants and helpers for the Mastodon login flow.
 *
 * Mastodon is multi-instance: every server has its own API host and its own
 * OAuth app. This MVP signs in against a single configured instance
 * (env.MASTODON_INSTANCE) with a pre-registered app, while the public read path
 * still works for accounts on ANY instance (see mastodon.ts). The session value
 * therefore carries both the token and the instance host, since every
 * authenticated call is instance-scoped.
 */
import { ProviderError } from './provider.js'
import { getOrigin } from './oauth.js'

/**
 * read:accounts → verify_credentials (who am I); read:follows → list follows;
 * write:follows → unfollow. verify_credentials returns 403 without read:accounts.
 */
export const MASTODON_OAUTH_SCOPE = 'read:accounts read:follows write:follows'

/** Unfollow requests sent in parallel at a time. */
const UNFOLLOW_CONCURRENCY = 5

/** The session cookie stores `<token>|<instance>` — '|' can't appear in a token. */
const SESSION_DELIMITER = '|'

export const packSession = (token: string, instance: string): string =>
  `${token}${SESSION_DELIMITER}${instance}`

export const unpackSession = (
  value: string,
): { token: string; instance: string } | null => {
  const index = value.indexOf(SESSION_DELIMITER)
  if (index < 0) return null
  const token = value.slice(0, index)
  const instance = value.slice(index + 1)
  if (!token || !instance) return null
  return { token, instance }
}

/** Normalize a configured instance (strip protocol / trailing slash). */
export const normalizeInstance = (raw: string): string =>
  raw.replace(/^https?:\/\//i, '').replace(/\/+$/, '').trim()

export const authorizeUrl = (instance: string): string =>
  `https://${instance}/oauth/authorize`

export const tokenUrl = (instance: string): string =>
  `https://${instance}/oauth/token`

export const getRedirectUri = (request: Request, env: Env): string =>
  `${getOrigin(request, env)}/api/auth/mastodon/callback`

const baseHeaders = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/json',
  'User-Agent': 'unfollowers-checker',
})

/** The signed-in user's handle (used by /api/auth/me). */
export const getMyHandle = async (
  token: string,
  instance: string,
): Promise<string> => {
  let response: Response
  try {
    response = await fetch(`https://${instance}/api/v1/accounts/verify_credentials`, {
      headers: baseHeaders(token),
    })
  } catch {
    throw new ProviderError('UPSTREAM', 'Network error reaching Mastodon', 502)
  }
  if (!response.ok) {
    if (response.status === 401) {
      throw new ProviderError('UPSTREAM', 'Mastodon session expired', 401)
    }
    throw new ProviderError('UPSTREAM', 'Mastodon API error', 502)
  }
  const me = (await response.json()) as { acct: string; username: string }
  // verify_credentials returns the LOCAL acct (no @domain) for the user's own
  // instance. The app's handle format is user@instance everywhere, so append it
  // — otherwise the frontend's handle validation rejects the auto-loaded list.
  const local = me.acct || me.username
  return local.includes('@') ? local : `${local}@${instance}`
}

const unfollowOne = async (
  id: string,
  token: string,
  instance: string,
): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://${instance}/api/v1/accounts/${encodeURIComponent(id)}/unfollow`,
      { method: 'POST', headers: baseHeaders(token) },
    )
    return response.ok
  } catch {
    return false
  }
}

/** Unfollow each account id on behalf of the signed-in user. */
export const unfollow = async (
  token: string,
  instance: string,
  ids: string[],
): Promise<{ removed: string[]; failed: string[] }> => {
  const removed: string[] = []
  const failed: string[] = []
  const queue = [...ids]
  while (queue.length > 0) {
    const batch = queue.splice(0, UNFOLLOW_CONCURRENCY)
    const results = await Promise.all(
      batch.map(async (id) => ({ id, ok: await unfollowOne(id, token, instance) })),
    )
    for (const { id, ok } of results) {
      if (ok) removed.push(id)
      else failed.push(id)
    }
  }
  return { removed, failed }
}
