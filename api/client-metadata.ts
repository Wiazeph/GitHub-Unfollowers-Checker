import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getClientMetadata } from './_lib/bluesky-oauth.js'

/**
 * Serves the AT Protocol OAuth client-metadata document at /client-metadata.json
 * (see the rewrite in vercel.json). The client_id IS this URL, and the document
 * embeds the public JWKS that matches BLUESKY_PRIVATE_KEY, so it must be built
 * from the same client instance.
 */
export default async function handler(
  _req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  try {
    const metadata = await getClientMetadata()
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'public, max-age=300')
    // clientMetadata already includes the public jwks for a confidential client.
    res.status(200).json(metadata)
  } catch {
    res.status(500).json({ error: 'OAuth is not configured', code: 'CONFIG' })
  }
}
