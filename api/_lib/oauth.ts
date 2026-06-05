/** Shared OAuth constants and helpers for the GitHub login flow. */
import type { VercelRequest } from '@vercel/node'

export const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'
export const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'
export const OAUTH_SCOPE = 'user:follow'

/** Absolute origin of the current deployment, derived from request headers. */
export const getOrigin = (req: VercelRequest): string => {
  const proto = (req.headers['x-forwarded-proto'] as string) ?? 'https'
  const host = req.headers['x-forwarded-host'] ?? req.headers.host ?? ''
  return `${proto}://${host}`
}

export const getRedirectUri = (req: VercelRequest): string =>
  `${getOrigin(req)}/api/auth/callback`
