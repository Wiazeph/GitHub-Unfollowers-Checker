/**
 * Server-side GitLab (gitlab.com) data layer.
 *
 * Unlike GitHub, GitLab's followers/following endpoints are NOT public — they
 * return 403 without a token even for public profiles. So GitLab only works for
 * the *signed-in* user checking their *own* list, using their own OAuth token.
 * That's why GitLab is not a `Provider` (which models the public read path):
 * its read function takes the user's token, and "the handle" is always "me".
 */

import { ProviderError, type Account } from './provider.js'
import { GITLAB_API } from './gitlab-oauth.js'

const PER_PAGE = 100
/** How many list pages to fetch in parallel. Keeps large accounts under the timeout. */
const CONCURRENCY = 8
/** Unfollow requests sent in parallel at a time. */
const UNFOLLOW_CONCURRENCY = 5

/** GitLab usernames: 1–255 chars, alphanumeric plus _ . - (no consecutive/edge specials, but we keep it permissive). */
const USERNAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,254}$/

/** Raw subset of the GitLab user object we read off the wire. */
interface GitLabUser {
  id: number
  username: string
  name: string
  avatar_url: string | null
  web_url: string
}

const baseHeaders = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/json',
  'User-Agent': 'unfollowers-checker',
})

export const isUserId = (value: string): boolean => /^\d+$/.test(value)

const mapErrorResponse = (response: Response): ProviderError => {
  if (response.status === 401) {
    return new ProviderError('UPSTREAM', 'GitLab session expired', 401)
  }
  if (response.status === 404) {
    return new ProviderError('NOT_FOUND', 'User not found', 404)
  }
  if (response.status === 429) {
    const retry = Number(response.headers.get('retry-after'))
    return new ProviderError(
      'RATE_LIMIT',
      'GitLab rate limit exceeded. Please try again later.',
      429,
      Number.isFinite(retry) ? retry : undefined,
    )
  }
  return new ProviderError('UPSTREAM', 'GitLab API error', 502)
}

/** Normalize a raw GitLab user into the platform-agnostic Account. */
const toAccount = (user: GitLabUser): Account => ({
  id: String(user.id),
  handle: user.username,
  displayName: user.name,
  ...(user.avatar_url ? { avatarUrl: user.avatar_url } : {}),
  profileUrl: user.web_url,
})

/** Read the total page count from GitLab's `x-total-pages` header (1 if absent). */
const parseTotalPages = (response: Response): number => {
  const total = Number(response.headers.get('x-total-pages'))
  return Number.isFinite(total) && total > 0 ? total : 1
}

const fetchPage = async (
  path: string,
  page: number,
  token: string,
): Promise<Account[]> => {
  let response: Response
  try {
    response = await fetch(
      `${GITLAB_API}${path}?per_page=${PER_PAGE}&page=${page}`,
      { headers: baseHeaders(token) },
    )
  } catch {
    throw new ProviderError('UPSTREAM', 'Network error reaching GitLab', 502)
  }
  if (!response.ok) throw mapErrorResponse(response)
  return ((await response.json()) as GitLabUser[]).map(toAccount)
}

/**
 * Fetch every page of a paginated GitLab list endpoint. The first page reveals
 * the total page count via the `x-total-pages` header, so the rest are fetched
 * in bounded-concurrency batches instead of one slow sequential chain.
 */
const fetchAllPages = async (
  path: string,
  token: string,
): Promise<Account[]> => {
  let response: Response
  try {
    response = await fetch(`${GITLAB_API}${path}?per_page=${PER_PAGE}`, {
      headers: baseHeaders(token),
    })
  } catch {
    throw new ProviderError('UPSTREAM', 'Network error reaching GitLab', 502)
  }
  if (!response.ok) throw mapErrorResponse(response)

  const users = ((await response.json()) as GitLabUser[]).map(toAccount)
  const lastPage = parseTotalPages(response)
  if (lastPage <= 1) return users

  const remaining = []
  for (let page = 2; page <= lastPage; page++) remaining.push(page)

  while (remaining.length > 0) {
    const batch = remaining.splice(0, CONCURRENCY)
    const results = await Promise.all(
      batch.map((page) => fetchPage(path, page, token)),
    )
    for (const result of results) users.push(...result)
  }

  return users
}

/** Resolve the signed-in user (id + username) from their token. */
const resolveMe = async (
  token: string,
): Promise<{ id: number; username: string }> => {
  let response: Response
  try {
    response = await fetch(`${GITLAB_API}/user`, { headers: baseHeaders(token) })
  } catch {
    throw new ProviderError('UPSTREAM', 'Network error reaching GitLab', 502)
  }
  if (!response.ok) throw mapErrorResponse(response)
  const user = (await response.json()) as { id: number; username: string }
  return { id: user.id, username: user.username }
}

/** Just the signed-in user's handle (used by /api/auth/me). */
export const getMyHandle = async (token: string): Promise<string> => {
  const me = await resolveMe(token)
  return me.username
}

/**
 * Compute the set of users the signed-in user follows but who don't follow back.
 * Requires the user's own OAuth token (the lists aren't public on GitLab).
 */
export const getMyUnfollowers = async (token: string): Promise<Account[]> => {
  const me = await resolveMe(token)

  // Fetch the following list first; if it's empty there can be no unfollowers.
  const following = await fetchAllPages(`/users/${me.id}/following`, token)
  if (following.length === 0) return []

  const followers = await fetchAllPages(`/users/${me.id}/followers`, token)
  const followerIds = new Set(followers.map((user) => user.id))
  return following.filter((user) => !followerIds.has(user.id))
}

const unfollowOne = async (userId: string, token: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${GITLAB_API}/users/${encodeURIComponent(userId)}/unfollow`,
      { method: 'POST', headers: baseHeaders(token) },
    )
    // 200/201 on success; 404 if already not following.
    return response.ok
  } catch {
    return false
  }
}

/** Unfollow each user id on behalf of the signed-in user. */
export const unfollow = async (
  token: string,
  userIds: string[],
): Promise<{ removed: string[]; failed: string[] }> => {
  const removed: string[] = []
  const failed: string[] = []
  const queue = [...userIds]
  while (queue.length > 0) {
    const batch = queue.splice(0, UNFOLLOW_CONCURRENCY)
    const results = await Promise.all(
      batch.map(async (id) => ({ id, ok: await unfollowOne(id, token) })),
    )
    for (const { id, ok } of results) {
      if (ok) removed.push(id)
      else failed.push(id)
    }
  }
  return { removed, failed }
}

export { USERNAME_PATTERN as GITLAB_USERNAME_PATTERN }
