/**
 * OAuth session helpers (Cloudflare Workers).
 *
 * Session values (a platform access token, or a Bluesky DID) live in an
 * HMAC-signed, httpOnly, Secure cookie so the browser's JavaScript can never
 * read them and they can't be tampered with. Signing uses AUTH_SECRET.
 *
 * node:crypto works on Workers under the `nodejs_compat` flag, so the HMAC code
 * is unchanged from the Node version. The only difference vs. Vercel: the secret
 * is passed in (Worker env is per-request, not a module-scope `process.env`),
 * and cookie I/O is done with plain header strings instead of res.setHeader.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

export type Platform = 'github' | 'bluesky' | 'gitlab'

/** One cookie per platform, so the user can stay signed in to several at once. */
const SESSION_COOKIES: Record<Platform, string> = {
  github: 'gh_session',
  bluesky: 'bsky_session',
  gitlab: 'gl_session',
}
export const STATE_COOKIE = 'oauth_state'

const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const STATE_MAX_AGE = 60 * 10 // 10 minutes

/** Sign a value as `value.signature` (base64url HMAC-SHA256). */
export const sign = (value: string, secret: string): string => {
  const signature = createHmac('sha256', secret).update(value).digest('base64url')
  return `${value}.${signature}`
}

/** Verify a `value.signature` token and return the value, or null if invalid. */
export const unsign = (
  signed: string | undefined,
  secret: string,
): string | null => {
  if (!signed) return null
  const index = signed.lastIndexOf('.')
  if (index < 0) return null

  const value = signed.slice(0, index)
  const signature = signed.slice(index + 1)
  const expected = createHmac('sha256', secret).update(value).digest('base64url')

  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return null
  return timingSafeEqual(a, b) ? value : null
}

/** Random hex token for CSRF state. Web Crypto (always available on Workers). */
export const randomToken = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Parse a raw Cookie header into a map. */
export const parseCookies = (header: string | null): Record<string, string> => {
  if (!header) return {}
  const out: Record<string, string> = {}
  for (const part of header.split(';')) {
    const eq = part.indexOf('=')
    if (eq < 0) continue
    const key = part.slice(0, eq).trim()
    out[key] = decodeURIComponent(part.slice(eq + 1).trim())
  }
  return out
}

interface CookieOptions {
  maxAge?: number
  httpOnly?: boolean
}

/** Serialize a single Set-Cookie header value. */
export const serializeCookie = (
  name: string,
  value: string,
  { maxAge, httpOnly = true }: CookieOptions = {},
): string => {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'SameSite=Lax']
  if (httpOnly) parts.push('HttpOnly')
  parts.push('Secure')
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`)
  return parts.join('; ')
}

export const stateCookie = (state: string, secret: string): string =>
  serializeCookie(STATE_COOKIE, sign(state, secret), { maxAge: STATE_MAX_AGE })

export const clearStateCookie = (): string =>
  serializeCookie(STATE_COOKIE, '', { maxAge: 0 })

/** Set-Cookie value that stores a platform's signed session. */
export const sessionCookie = (
  platform: Platform,
  value: string,
  secret: string,
): string =>
  serializeCookie(SESSION_COOKIES[platform], sign(value, secret), {
    maxAge: SESSION_MAX_AGE,
  })

/** Set-Cookie value that clears a platform's session. */
export const clearSessionCookie = (platform: Platform): string =>
  serializeCookie(SESSION_COOKIES[platform], '', { maxAge: 0 })

/**
 * Read the verified session value for one platform from the request cookies.
 * GitHub/GitLab: the access token. Bluesky: the user's DID (tokens live in KV).
 * Returns null if not signed in to that platform.
 *
 * Back-compat: an older single-cookie format stored JSON {platform, value} in
 * gh_session; if we find that, we honor it for its tagged platform.
 */
export const getPlatformSession = (
  cookieHeader: string | null,
  platform: Platform,
  secret: string,
): string | null => {
  const cookies = parseCookies(cookieHeader)
  const value = unsign(cookies[SESSION_COOKIES[platform]], secret)
  if (value) {
    const legacy = parseLegacySession(value)
    if (legacy) return legacy.platform === platform ? legacy.value : null
    return value
  }

  if (platform === 'bluesky') {
    const legacyValue = unsign(cookies[SESSION_COOKIES.github], secret)
    const legacy = legacyValue ? parseLegacySession(legacyValue) : null
    if (legacy?.platform === 'bluesky') return legacy.value
  }
  return null
}

interface LegacySession {
  platform: Platform
  value: string
}

const parseLegacySession = (value: string): LegacySession | null => {
  try {
    const parsed = JSON.parse(value) as Partial<LegacySession>
    if (
      (parsed.platform === 'github' || parsed.platform === 'bluesky') &&
      typeof parsed.value === 'string'
    ) {
      return { platform: parsed.platform, value: parsed.value }
    }
  } catch {
    // Not JSON — a plain per-platform value.
  }
  return null
}
