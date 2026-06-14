/** A normalized account that a target follows but who does not follow back. */
export interface Account {
  /** Stable unique id — GitHub: numeric id as string; Bluesky: the DID; GitLab: numeric id as string; Mastodon: account id. */
  id: string
  /** Human-readable handle — GitHub login; Bluesky handle (name.bsky.social); GitLab username; Mastodon acct (user@instance). */
  handle: string
  displayName?: string
  avatarUrl?: string
  profileUrl: string
}

export type PlatformId = 'github' | 'bluesky' | 'gitlab' | 'mastodon'

/** Successful response shape from `/api/unfollowers`. */
export interface UnfollowersResponse {
  unfollowers: Account[]
  count: number
}

export type ApiErrorCode =
  | 'NOT_FOUND'
  | 'RATE_LIMIT'
  | 'UPSTREAM'
  | 'BAD_REQUEST'
  | 'CONFIG'
  | 'UNAUTHORIZED'

/** Per-platform sign-in state from `/api/auth/me`. A user can be signed in to
 *  several platforms at once, so each is reported independently. */
export type PlatformSession = { handle: string } | null

export type AuthState = Record<PlatformId, PlatformSession>

/** Result of an unfollow request from `/api/unfollow`. */
export interface UnfollowResult {
  removed: string[]
  failed: string[]
}

/** Error response shape from `/api/unfollowers`. */
export interface ApiErrorBody {
  error: string
  code: ApiErrorCode
  retryAfter?: number
}

/** Error thrown by the client API layer, carrying a user-friendly message. */
export class ApiError extends Error {
  code: ApiErrorCode
  status: number
  retryAfter?: number

  constructor(body: ApiErrorBody, status: number) {
    super(body.error)
    this.name = 'ApiError'
    this.code = body.code
    this.status = status
    this.retryAfter = body.retryAfter
  }
}
