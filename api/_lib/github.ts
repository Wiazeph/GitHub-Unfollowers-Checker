/**
 * Server-side GitHub API helpers.
 *
 * The GitHub token lives only on the server (process.env.GITHUB_TOKEN), so the
 * browser never sees it and we get the authenticated rate limit (5000 req/h)
 * instead of the unauthenticated one (60 req/h).
 */

const GITHUB_API = 'https://api.github.com'
const PER_PAGE = 100

/** Subset of the GitHub user object we actually care about. */
export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  html_url: string
}

export type GitHubErrorCode = 'NOT_FOUND' | 'RATE_LIMIT' | 'UPSTREAM'

/** Thrown by the fetch layer and mapped to an HTTP response by the route. */
export class GitHubError extends Error {
  status: number
  code: GitHubErrorCode
  retryAfter?: number

  constructor(
    code: GitHubErrorCode,
    message: string,
    status: number,
    retryAfter?: number,
  ) {
    super(message)
    this.name = 'GitHubError'
    this.code = code
    this.status = status
    this.retryAfter = retryAfter
  }
}

const baseHeaders = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'github-unfollowers-checker',
})

/** Extract the `rel="next"` URL from a GitHub `Link` header, if present. */
const parseNextLink = (linkHeader: string | null): string | null => {
  if (!linkHeader) return null
  for (const part of linkHeader.split(',')) {
    const match = part.match(/<([^>]+)>;\s*rel="next"/)
    if (match) return match[1]
  }
  return null
}

const mapErrorResponse = (response: Response): GitHubError => {
  if (response.status === 404) {
    return new GitHubError('NOT_FOUND', 'User not found', 404)
  }

  const remaining = response.headers.get('x-ratelimit-remaining')
  const isRateLimited =
    (response.status === 403 || response.status === 429) && remaining === '0'

  if (isRateLimited) {
    const reset = Number(response.headers.get('x-ratelimit-reset'))
    const retryAfter = Number.isFinite(reset)
      ? Math.max(0, reset - Math.floor(Date.now() / 1000))
      : undefined
    return new GitHubError(
      'RATE_LIMIT',
      'GitHub rate limit exceeded. Please try again later.',
      429,
      retryAfter,
    )
  }

  return new GitHubError('UPSTREAM', 'GitHub API error', 502)
}

/** Fetch every page of a paginated GitHub list endpoint, following Link headers. */
const fetchAllPages = async (
  startPath: string,
  token: string,
): Promise<GitHubUser[]> => {
  const users: GitHubUser[] = []
  let url: string | null = `${GITHUB_API}${startPath}?per_page=${PER_PAGE}`

  while (url) {
    let response: Response
    try {
      response = await fetch(url, { headers: baseHeaders(token) })
    } catch {
      throw new GitHubError('UPSTREAM', 'Network error reaching GitHub', 502)
    }

    if (!response.ok) throw mapErrorResponse(response)

    const page = (await response.json()) as GitHubUser[]
    for (const user of page) {
      users.push({
        login: user.login,
        id: user.id,
        avatar_url: user.avatar_url,
        html_url: user.html_url,
      })
    }

    url = parseNextLink(response.headers.get('link'))
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
): Promise<GitHubUser[]> => {
  const [followers, following] = await Promise.all([
    fetchAllPages(`/users/${username}/followers`, token),
    fetchAllPages(`/users/${username}/following`, token),
  ])

  const followerLogins = new Set(followers.map((user) => user.login))
  return following.filter((user) => !followerLogins.has(user.login))
}
