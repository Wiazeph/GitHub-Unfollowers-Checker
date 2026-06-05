import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getOAuthClient } from './_lib/bluesky-oauth.js'

/**
 * Serves the public JWKS at /jwks.json (see the rewrite in vercel.json). The
 * client-metadata document's jwks_uri points here. These are the public halves
 * of BLUESKY_PRIVATE_KEY, used by Bluesky to verify our private_key_jwt.
 */
export default async function handler(
  _req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  try {
    const client = await getOAuthClient()
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.status(200).json(client.jwks)
  } catch {
    res.status(500).json({ error: 'OAuth is not configured', code: 'CONFIG' })
  }
}
