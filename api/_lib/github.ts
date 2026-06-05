/**
 * Server-side GitHub provider.
 *
 * The GitHub token lives only on the server (process.env.GITHUB_TOKEN), so the
 * browser never sees it and we get the authenticated rate limit (5000 req/h)
 * instead of the unauthenticated one (60 req/h).
 */

import { ProviderError, type Account, type Provider } from './provider.js'

const GITHUB_API = 'https://api.github.com'
const PER_PAGE = 100
/** How many list pages to fetch in parallel. Keeps large accounts under the timeout. */
const CONCURRENCY = 8

/** GitHub username rules: 1–39 chars, alphanumeric or single hyphens (not leading/trailing). */
const USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/

/** Back-compat alias: GitHubError used to be a distinct class with the same codes. */
export { ProviderError as GitHubError }

/** Raw subset of the GitHub user object we read off the wire. */
interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  html_url: string
}

const baseHeaders = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'github-unfollowers-checker',
})

const mapErrorResponse = (response: Response): ProviderError => {
  if (response.status === 404) {
    return new ProviderError('NOT_FOUND', 'User not found', 404)
  }

  const remaining = response.headers.get('x-ratelimit-remaining')
  const isRateLimited =
    (response.status === 403 || response.status === 429) && remaining === '0'

  if (isRateLimited) {
    const reset = Number(response.headers.get('x-ratelimit-reset'))
    const retryAfter = Number.isFinite(reset)
      ? Math.max(0, reset - Math.floor(Date.now() / 1000))
      : undefined
    return new ProviderError(
      'RATE_LIMIT',
      'GitHub rate limit exceeded. Please try again later.',
      429,
      retryAfter,
    )
  }

  return new ProviderError('UPSTREAM', 'GitHub API error', 502)
}

/** Read the total page count from a `Link` header's `rel="last"` URL (1 if absent). */
const parseLastPage = (linkHeader: string | null): number => {
  if (!linkHeader) return 1
  for (const part of linkHeader.split(',')) {
    const match = part.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/)
    if (match) return Number(match[1])
  }
  return 1
}

/** Normalize a raw GitHub user into the platform-agnostic Account. */
const toAccount = (user: GitHubUser): Account => ({
  id: String(user.id),
  handle: user.login,
  avatarUrl: user.avatar_url,
  profileUrl: user.html_url,
})

const fetchPage = async (
  path: string,
  page: number,
  token: string,
): Promise<Account[]> => {
  let response: Response
  try {
    response = await fetch(
      `${GITHUB_API}${path}?per_page=${PER_PAGE}&page=${page}`,
      { headers: baseHeaders(token) },
    )
  } catch {
    throw new ProviderError('UPSTREAM', 'Network error reaching GitHub', 502)
  }
  if (!response.ok) throw mapErrorResponse(response)
  return ((await response.json()) as GitHubUser[]).map(toAccount)
}

/**
 * Fetch every page of a paginated GitHub list endpoint. The first page reveals
 * the total page count via the `Link` header, so the rest are fetched in
 * bounded-concurrency batches instead of one slow sequential chain — this keeps
 * accounts with tens of thousands of followers inside the function timeout.
 */
const fetchAllPages = async (
  path: string,
  token: string,
): Promise<Account[]> => {
  let response: Response
  try {
    response = await fetch(`${GITHUB_API}${path}?per_page=${PER_PAGE}`, {
      headers: baseHeaders(token),
    })
  } catch {
    throw new ProviderError('UPSTREAM', 'Network error reaching GitHub', 502)
  }
  if (!response.ok) throw mapErrorResponse(response)

  const users = ((await response.json()) as GitHubUser[]).map(toAccount)
  const lastPage = parseLastPage(response.headers.get('link'))
  if (lastPage <= 1) return users

  // Pages 2..lastPage, fetched CONCURRENCY at a time.
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

/**
 * Compute the set of users that `username` follows but who do not follow back.
 * Fetches both lists in parallel.
 */
export const getUnfollowers = async (
  username: string,
  token: string,
): Promise<Account[]> => {
  // Fetch the (usually small) following list first; if it's empty there can be
  // no unfollowers, so we skip pulling the follower list entirely.
  const following = await fetchAllPages(`/users/${username}/following`, token)
  if (following.length === 0) return []

  const followers = await fetchAllPages(`/users/${username}/followers`, token)
  const followerHandles = new Set(followers.map((user) => user.handle))
  return following.filter((user) => !followerHandles.has(user.handle))
}

/** The GitHub provider. Reads its token from the environment itself. */
export const githubProvider: Provider = {
  id: 'github',
  validateHandle: (handle) => USERNAME_PATTERN.test(handle),
  getUnfollowers: (handle) => {
    const token = process.env.GITHUB_TOKEN
    if (!token) {
      throw new ProviderError('UPSTREAM', 'Server is misconfigured', 500)
    }
    return getUnfollowers(handle, token)
  },
}
