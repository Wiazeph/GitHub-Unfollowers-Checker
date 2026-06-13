import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomToken, setStateCookie } from '../../_lib/auth.js'
import {
  GITLAB_AUTHORIZE_URL,
  GITLAB_OAUTH_SCOPE,
  getRedirectUri,
} from '../../_lib/gitlab-oauth.js'

/** Start the GitLab OAuth flow: set a CSRF state cookie and redirect to GitLab. */
export default function handler(req: VercelRequest, res: VercelResponse): void {
  const clientId = process.env.GITLAB_OAUTH_CLIENT_ID
  if (!clientId) {
    res.status(500).json({ error: 'OAuth is not configured', code: 'CONFIG' })
    return
  }

  const state = randomToken()
  setStateCookie(res, state)

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(req),
    response_type: 'code',
    scope: GITLAB_OAUTH_SCOPE,
    state,
  })

  res.redirect(302, `${GITLAB_AUTHORIZE_URL}?${params.toString()}`)
}
