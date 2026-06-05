/** A normalized account that a target follows but who does not follow back. */
export interface Account {
  /** Stable unique id — GitHub: numeric id as string; Bluesky: the DID. */
  id: string
  /** Human-readable handle — GitHub login; Bluesky handle (name.bsky.social). */
  handle: string
  displayName?: string
  avatarUrl?: string
  profileUrl: string
}

export type PlatformId = 'github' | 'bluesky'

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

/** Current authentication state, from `/api/auth/me`. */
export type AuthState =
  | { authenticated: false }
  | { authenticated: true; platform: PlatformId; handle: string }

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
