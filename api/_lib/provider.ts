/**
 * Platform-agnostic types shared by every provider (GitHub, Bluesky, …).
 *
 * Each platform normalizes its native user object into `Account` so the
 * `/api/unfollowers` route and the frontend never need to know which platform
 * produced the data.
 */

export type PlatformId = 'github' | 'bluesky'

/** A normalized account, the same shape regardless of platform. */
export interface Account {
  /** Stable unique id — GitHub: String(user.id); Bluesky: the DID. */
  id: string
  /** Human-readable handle — GitHub login; Bluesky handle (name.bsky.social). */
  handle: string
  displayName?: string
  avatarUrl?: string
  profileUrl: string
}

export type ProviderErrorCode = 'NOT_FOUND' | 'RATE_LIMIT' | 'UPSTREAM'

/** Thrown by a provider's fetch layer and mapped to an HTTP response by the route. */
export class ProviderError extends Error {
  status: number
  code: ProviderErrorCode
  retryAfter?: number

  constructor(
    code: ProviderErrorCode,
    message: string,
    status: number,
    retryAfter?: number,
  ) {
    super(message)
    this.name = 'ProviderError'
    this.code = code
    this.status = status
    this.retryAfter = retryAfter
  }
}

/**
 * Reduce whatever was passed (a profile URL, an @-prefixed handle, a bare name)
 * to a plain identifier. Mirrors the client-side normalizer so direct API hits
 * and legacy links are tolerant too.
 */
export const normalizeHandle = (platform: PlatformId, raw: string): string => {
  let value = raw.trim()

  if (/^https?:\/\//i.test(value) || /^[\w.-]+\.[a-z]{2,}\//i.test(value)) {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
    try {
      const segments = new URL(withProtocol).pathname.split('/').filter(Boolean)
      if (platform === 'bluesky') {
        const idx = segments.indexOf('profile')
        value = idx >= 0 && segments[idx + 1] ? segments[idx + 1] : segments[0] ?? ''
      } else {
        value = segments[0] ?? ''
      }
    } catch {
      // keep the raw value
    }
  }

  return value.replace(/^@+/, '').replace(/^\/+|\/+$/g, '').trim()
}

/**
 * The contract every platform implements. Auth/unfollow capabilities are added
 * incrementally per platform; the read path (`getUnfollowers`) is the baseline.
 */
export interface Provider {
  id: PlatformId
  /** Validate a handle before hitting the upstream API. */
  validateHandle(handle: string): boolean
  /** Public read path (no user auth): who does `handle` follow that doesn't follow back. */
  getUnfollowers(handle: string): Promise<Account[]>
}
