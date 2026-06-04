/** A GitHub user the target follows who does not follow them back. */
export interface Unfollower {
  login: string
  id: number
  avatar_url: string
  html_url: string
}

/** Successful response shape from `/api/unfollowers`. */
export interface UnfollowersResponse {
  unfollowers: Unfollower[]
  count: number
}

export type ApiErrorCode =
  | 'NOT_FOUND'
  | 'RATE_LIMIT'
  | 'UPSTREAM'
  | 'BAD_REQUEST'
  | 'CONFIG'

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
