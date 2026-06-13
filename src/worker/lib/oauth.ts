/** Shared OAuth constants and helpers for the GitHub login flow. */

export const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'
export const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'
export const OAUTH_SCOPE = 'user:follow'

/**
 * Absolute origin of the deployment. Prefer the explicit PUBLIC_URL (stable,
 * required for the Bluesky client_id), falling back to the request's own origin
 * for local dev / preview where PUBLIC_URL may be unset.
 */
export const getOrigin = (request: Request, env: Env): string => {
  if (env.PUBLIC_URL) return env.PUBLIC_URL.replace(/\/$/, '')
  return new URL(request.url).origin
}

export const getRedirectUri = (request: Request, env: Env): string =>
  `${getOrigin(request, env)}/api/auth/callback`
