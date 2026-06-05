import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getOAuthClient } from '../../_lib/bluesky-oauth.js'
import { randomToken } from '../../_lib/auth.js'
import { normalizeHandle } from '../../_lib/provider.js'

const param = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? ''

/** Bluesky handle: domain-style, at least one dot. */
const HANDLE_PATTERN = /^(?!-)[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/

/** Start the Bluesky OAuth flow: resolve the handle and redirect to authorize. */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const handle = normalizeHandle('bluesky', param(req.query.handle))
  if (!handle || !HANDLE_PATTERN.test(handle)) {
    res
      .status(400)
      .json({ error: 'A valid Bluesky handle is required', code: 'BAD_REQUEST' })
    return
  }

  try {
    const client = await getOAuthClient()
    const url = await client.authorize(handle, {
      scope: 'atproto transition:generic',
      state: randomToken(),
    })
    res.redirect(302, url.toString())
  } catch (error) {
    const reason =
      error instanceof Error && /resolve|handle|did/i.test(error.message)
        ? 'handle_not_found'
        : 'oauth_init_failed'
    res.redirect(302, `/?auth_error=${encodeURIComponent(reason)}`)
  }
}
