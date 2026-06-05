import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getProvider } from './_lib/registry.js'
import { ProviderError, normalizeHandle, type PlatformId } from './_lib/provider.js'

/** Read a single string value from a query param that may be string | string[]. */
const param = (raw: VercelRequest['query'][string]): string =>
  (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? ''

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed', code: 'BAD_REQUEST' })
    return
  }

  // Default to GitHub so existing `?username=` links keep working unchanged.
  const platform = param(req.query.platform) || 'github'
  const provider = getProvider(platform)
  if (!provider) {
    res
      .status(400)
      .json({ error: 'Unsupported platform', code: 'BAD_REQUEST' })
    return
  }

  // Accept `handle` (new) or `username` (legacy) interchangeably, and tolerate
  // pasted profile URLs / @-prefixes.
  const handle = normalizeHandle(
    platform as PlatformId,
    param(req.query.handle) || param(req.query.username),
  )
  if (!handle) {
    res
      .status(400)
      .json({ error: 'A username is required', code: 'BAD_REQUEST' })
    return
  }

  if (!provider.validateHandle(handle)) {
    res
      .status(400)
      .json({ error: 'That is not a valid username', code: 'BAD_REQUEST' })
    return
  }

  try {
    const unfollowers = await provider.getUnfollowers(handle)
    res.setHeader('Cache-Control', 'private, max-age=0')
    res.status(200).json({ unfollowers, count: unfollowers.length })
  } catch (error) {
    if (error instanceof ProviderError) {
      res.status(error.status).json({
        error: error.message,
        code: error.code,
        ...(error.retryAfter !== undefined && { retryAfter: error.retryAfter }),
      })
      return
    }
    res.status(502).json({ error: 'Unexpected server error', code: 'UPSTREAM' })
  }
}
