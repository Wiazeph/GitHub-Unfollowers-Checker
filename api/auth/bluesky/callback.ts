import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getOAuthClient } from '../../_lib/bluesky-oauth.js'
import { setSession } from '../../_lib/auth.js'

/**
 * Finish the Bluesky OAuth flow. The library validates state/PKCE/DPoP and
 * persists the token set in our Redis sessionStore (keyed by DID). We then store
 * just the DID in our signed app-session cookie; tokens never reach the browser.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const fail = (reason: string) =>
    res.redirect(302, `/?auth_error=${encodeURIComponent(reason)}`)

  // The library reads the OAuth response params (code, state, iss) from the URL.
  const url = new URL(req.url ?? '', 'http://localhost')

  try {
    const client = await getOAuthClient()
    const { session } = await client.callback(url.searchParams)
    setSession(res, { platform: 'bluesky', value: session.did })
    res.redirect(302, '/')
  } catch {
    fail('bluesky_exchange_failed')
  }
}
