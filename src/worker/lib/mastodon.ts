/**
 * Server-side Mastodon provider.
 *
 * Reads are unauthenticated against the account's own instance: we resolve the
 * `user@instance` handle, look up the account id, then page its following and
 * followers lists. Mastodon paginates with a `Link` header carrying a `max_id`
 * cursor (NOT `?page=N` like GitHub), so paging is inherently sequential — we
 * cap the page count to stay under the function timeout.
 *
 * Some instances run in AUTHORIZED_FETCH / limited-federation mode and refuse
 * anonymous reads (401/403); we surface a clear error rather than a blank list.
 */

import { ProviderError, type Account, type Provider } from './provider.js'

const PER_PAGE = 80 // Mastodon caps following/followers page size at 80.
/** Hard cap so a huge account can't blow the timeout (≈ MAX_PAGES × 80 accounts). */
const MAX_PAGES = 80

/** `user@instance.tld` — a local username plus a domain-style instance host. */
const HANDLE_PATTERN = /^[a-zA-Z0-9_]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/

/** Mastodon account ids are numeric strings. */
export const isMastodonId = (value: string): boolean => /^\d+$/.test(value)

/** Raw subset of a Mastodon account object. */
interface MastodonAccount {
  id: string
  username: string
  acct: string
  display_name?: string
  avatar?: string
  url: string
}

/** Split `user@instance` into its parts. */
const parseHandle = (handle: string): { user: string; instance: string } => {
  const at = handle.indexOf('@')
  return { user: handle.slice(0, at), instance: handle.slice(at + 1) }
}

const mapErrorResponse = (response: Response): ProviderError => {
  if (response.status === 404) {
    return new ProviderError('NOT_FOUND', 'Account not found', 404)
  }
  if (response.status === 401 || response.status === 403) {
    return new ProviderError(
      'UPSTREAM',
      'This Mastodon instance restricts public follow lists',
      502,
    )
  }
  if (response.status === 429) {
    const retry = Number(response.headers.get('x-ratelimit-reset'))
    return new ProviderError(
      'RATE_LIMIT',
      'Mastodon rate limit exceeded. Please try again later.',
      429,
      Number.isFinite(retry) ? retry : undefined,
    )
  }
  return new ProviderError('UPSTREAM', 'Mastodon API error', 502)
}

const toAccount = (account: MastodonAccount): Account => ({
  id: account.id,
  handle: account.acct,
  ...(account.display_name ? { displayName: account.display_name } : {}),
  ...(account.avatar ? { avatarUrl: account.avatar } : {}),
  profileUrl: account.url,
})

/** Pull the `max_id` cursor out of a `Link: <…?max_id=123>; rel="next"` header. */
const parseNextMaxId = (linkHeader: string | null): string | null => {
  if (!linkHeader) return null
  for (const part of linkHeader.split(',')) {
    const match = part.match(/[?&]max_id=([^>&]+)[^>]*>;\s*rel="next"/)
    if (match) return decodeURIComponent(match[1])
  }
  return null
}

/** Resolve a `user@instance` handle to its numeric account id on that instance. */
const lookupAccountId = async (
  user: string,
  instance: string,
): Promise<string> => {
  const url =
    `https://${instance}/api/v1/accounts/lookup?acct=${encodeURIComponent(user)}`
  let response: Response
  try {
    response = await fetch(url, { headers: { Accept: 'application/json' } })
  } catch {
    throw new ProviderError('UPSTREAM', 'Network error reaching Mastodon', 502)
  }
  if (!response.ok) throw mapErrorResponse(response)
  const account = (await response.json()) as MastodonAccount
  return account.id
}

/** Walk every page of an account's following/followers list (max_id cursor). */
const listAll = async (
  endpoint: 'following' | 'followers',
  accountId: string,
  instance: string,
): Promise<Account[]> => {
  const out: Account[] = []
  let maxId: string | null = null

  for (let page = 0; page < MAX_PAGES; page++) {
    const url =
      `https://${instance}/api/v1/accounts/${accountId}/${endpoint}` +
      `?limit=${PER_PAGE}` +
      (maxId ? `&max_id=${encodeURIComponent(maxId)}` : '')

    let response: Response
    try {
      response = await fetch(url, { headers: { Accept: 'application/json' } })
    } catch {
      throw new ProviderError('UPSTREAM', 'Network error reaching Mastodon', 502)
    }
    if (!response.ok) throw mapErrorResponse(response)

    const accounts = (await response.json()) as MastodonAccount[]
    for (const account of accounts) out.push(toAccount(account))

    maxId = parseNextMaxId(response.headers.get('link'))
    if (!maxId || accounts.length === 0) break
  }

  return out
}

/**
 * Compute the set of accounts `handle` follows but who don't follow back.
 * Fetches the following list first; if it's empty there can be no unfollowers,
 * so the followers list is skipped entirely.
 */
export const getUnfollowers = async (handle: string): Promise<Account[]> => {
  const { user, instance } = parseHandle(handle)
  const accountId = await lookupAccountId(user, instance)

  const following = await listAll('following', accountId, instance)
  if (following.length === 0) return []

  const followers = await listAll('followers', accountId, instance)
  const followerIds = new Set(followers.map((account) => account.id))
  return following.filter((account) => !followerIds.has(account.id))
}

/** The Mastodon provider. Public reads are unauthenticated, on any instance. */
export const mastodonProvider: Provider = {
  id: 'mastodon',
  validateHandle: (handle) => HANDLE_PATTERN.test(handle),
  getUnfollowers: (handle) => getUnfollowers(handle),
}
