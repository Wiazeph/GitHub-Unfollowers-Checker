import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPlatformSession } from './_lib/auth.js'
import { ProviderError } from './_lib/provider.js'
import { getMyUnfollowers } from './_lib/gitlab.js'

/**
 * Authenticated read path for platforms whose follow lists are NOT public.
 * The handle is implicit: "me" = the signed-in user. Today only GitLab needs
 * this (GitHub/Bluesky use the public `/api/unfollowers`), so we key on the
 * `platform` param and read the session token for that platform.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed', code: 'BAD_REQUEST' })
    return
  }

  const platform = Array.isArray(req.query.platform)
    ? req.query.platform[0]
    : req.query.platform

  if (platform !== 'gitlab') {
    res.status(400).json({ error: 'Unsupported platform', code: 'BAD_REQUEST' })
    return
  }

  const token = getPlatformSession(req, 'gitlab')
  if (!token) {
    res.status(401).json({ error: 'You must sign in first', code: 'UNAUTHORIZED' })
    return
  }

  try {
    const unfollowers = await getMyUnfollowers(token)
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
