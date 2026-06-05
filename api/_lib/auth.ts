/**
 * OAuth session helpers.
 *
 * The user's GitHub access token is stored in an HMAC-signed, httpOnly, Secure
 * cookie so the browser's JavaScript can never read it and it can't be tampered
 * with. All signing uses AUTH_SECRET.
 */
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export const SESSION_COOKIE = 'gh_session'
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

export const setSessionCookie = (res: VercelResponse, token: string): void => {
  appendCookie(res, serializeCookie(SESSION_COOKIE, sign(token), { maxAge: SESSION_MAX_AGE }))
}

export const clearSessionCookie = (res: VercelResponse): void => {
  appendCookie(res, serializeCookie(SESSION_COOKIE, '', { maxAge: 0 }))
}

export const setStateCookie = (res: VercelResponse, state: string): void => {
  appendCookie(res, serializeCookie(STATE_COOKIE, sign(state), { maxAge: STATE_MAX_AGE }))
}

export const clearStateCookie = (res: VercelResponse): void => {
  appendCookie(res, serializeCookie(STATE_COOKIE, '', { maxAge: 0 }))
}

/** Return the verified GitHub access token from the session cookie, or null. */
export const getSessionToken = (req: VercelRequest): string | null => {
  return unsign(parseCookies(req)[SESSION_COOKIE])
}
