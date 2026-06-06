/**
 * OAuth session helpers.
 *
 * The user's GitHub access token is stored in an HMAC-signed, httpOnly, Secure
 * cookie so the browser's JavaScript can never read it and it can't be tampered
 * with. All signing uses AUTH_SECRET.
 */
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export type Platform = 'github' | 'bluesky'

/** One cookie per platform, so the user can stay signed in to both at once. */
const SESSION_COOKIES: Record<Platform, string> = {
  github: 'gh_session',
  bluesky: 'bsky_session',
}
export const STATE_COOKIE = 'oauth_state'

const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const STATE_MAX_AGE = 60 * 10 // 10 minutes

const secret = (): string => {
  const value = process.env.AUTH_SECRET
  if (!value) throw new Error('AUTH_SECRET is not configured')
  return value
}

/** Sign a value as `value.signature` (base64url HMAC-SHA256). */
export const sign = (value: string): string => {
  const signature = createHmac('sha256', secret())
    .update(value)
    .digest('base64url')
  return `${value}.${signature}`
}

/** Verify a `value.signature` token and return the value, or null if invalid. */
export const unsign = (signed: string | undefined): string | null => {
  if (!signed) return null
  const index = signed.lastIndexOf('.')
  if (index < 0) return null

  const value = signed.slice(0, index)
  const signature = signed.slice(index + 1)
  const expected = createHmac('sha256', secret())
    .update(value)
    .digest('base64url')

  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return null
  return timingSafeEqual(a, b) ? value : null
}

export const randomToken = (): string => randomBytes(16).toString('hex')

/** Parse the request's Cookie header into a map. */
export const parseCookies = (req: VercelRequest): Record<string, string> => {
  const header = req.headers.cookie
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

const serializeCookie = (
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

/** Append a Set-Cookie header without clobbering existing ones. */
const appendCookie = (res: VercelResponse, cookie: string): void => {
  const existing = res.getHeader('Set-Cookie')
  if (!existing) {
    res.setHeader('Set-Cookie', cookie)
  } else if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, cookie])
  } else {
    res.setHeader('Set-Cookie', [String(existing), cookie])
  }
}

export const setStateCookie = (res: VercelResponse, state: string): void => {
  appendCookie(res, serializeCookie(STATE_COOKIE, sign(state), { maxAge: STATE_MAX_AGE }))
}

export const clearStateCookie = (res: VercelResponse): void => {
  appendCookie(res, serializeCookie(STATE_COOKIE, '', { maxAge: 0 }))
}

/**
 * Read the verified session value for one platform.
 * GitHub: the access token. Bluesky: the user's DID (tokens live in Redis).
 * Returns null if not signed in to that platform.
 *
 * Back-compat: an older single-cookie format stored JSON {platform, value} in
 * gh_session; if we find that, we honor it for its tagged platform.
 */
export const getPlatformSession = (
  req: VercelRequest,
  platform: Platform,
): string | null => {
  const cookies = parseCookies(req)
  const value = unsign(cookies[SESSION_COOKIES[platform]])
  if (value) {
    const legacy = parseLegacySession(value)
    // A legacy JSON blob landed in gh_session; use it only for its platform.
    if (legacy) return legacy.platform === platform ? legacy.value : null
    return value
  }

  // Legacy: the old gh_session held a JSON {platform, value} for either side.
  if (platform === 'bluesky') {
    const legacyValue = unsign(cookies[SESSION_COOKIES.github])
    const legacy = legacyValue ? parseLegacySession(legacyValue) : null
    if (legacy?.platform === 'bluesky') return legacy.value
  }
  return null
}

/** Store the session value in that platform's signed, httpOnly cookie. */
export const setPlatformSession = (
  res: VercelResponse,
  platform: Platform,
  value: string,
): void => {
  appendCookie(
    res,
    serializeCookie(SESSION_COOKIES[platform], sign(value), {
      maxAge: SESSION_MAX_AGE,
    }),
  )
}

/** Clear one platform's session cookie. */
export const clearPlatformSession = (
  res: VercelResponse,
  platform: Platform,
): void => {
  appendCookie(res, serializeCookie(SESSION_COOKIES[platform], '', { maxAge: 0 }))
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
