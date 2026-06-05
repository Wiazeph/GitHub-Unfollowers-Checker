import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  STATE_COOKIE,
  clearStateCookie,
  parseCookies,
  setSessionCookie,
  unsign,
} from '../_lib/auth.js'
import {
  GITHUB_TOKEN_URL,
  getOrigin,
  getRedirectUri,
} from '../_lib/oauth.js'

const param = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? ''

/** Finish the OAuth flow: validate state, exchange code for a token, set session. */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const origin = getOrigin(req)
  const fail = (reason: string) =>
    res.redirect(302, `${origin}/?auth_error=${encodeURIComponent(reason)}`)

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    res.status(500).json({ error: 'OAuth is not configured', code: 'CONFIG' })
    return
  }

  const code = param(req.query.code)
  const state = param(req.query.state)
  const expectedState = unsign(parseCookies(req)[STATE_COOKIE])

  clearStateCookie(res)

  if (!code || !state || !expectedState || state !== expectedState) {
    fail('invalid_state')
    return
  }

  let tokenResponse: Response
  try {
    tokenResponse = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: getRedirectUri(req),
      }),
    })
  } catch {
    fail('network')
    return
  }

  if (!tokenResponse.ok) {
    fail('exchange_failed')
    return
  }

  const data = (await tokenResponse.json()) as {
    access_token?: string
    error?: string
  }

  if (!data.access_token) {
    fail(data.error ?? 'no_token')
    return
  }

  setSessionCookie(res, data.access_token)
  res.redirect(302, `${origin}/`)
}
