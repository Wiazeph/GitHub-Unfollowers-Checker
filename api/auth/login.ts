import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomToken, setStateCookie } from '../_lib/auth.js'
import {
  GITHUB_AUTHORIZE_URL,
  OAUTH_SCOPE,
  getRedirectUri,
} from '../_lib/oauth.js'

/** Start the GitHub OAuth flow: set a CSRF state cookie and redirect to GitHub. */
export default function handler(req: VercelRequest, res: VercelResponse): void {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID
  if (!clientId) {
    res.status(500).json({ error: 'OAuth is not configured', code: 'CONFIG' })
    return
  }

  const state = randomToken()
  setStateCookie(res, state)

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(req),
    scope: OAUTH_SCOPE,
    state,
    allow_signup: 'false',
  })

  res.redirect(302, `${GITHUB_AUTHORIZE_URL}?${params.toString()}`)
}
