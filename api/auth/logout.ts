import type { VercelRequest, VercelResponse } from '@vercel/node'
import { clearPlatformSession, type Platform } from '../_lib/auth.js'

/**
 * Clear a session cookie. With `?platform=github|bluesky`, only that platform is
 * signed out; without it, both are cleared.
 */
export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const raw = req.query.platform
  const platform = (Array.isArray(raw) ? raw[0] : raw) as Platform | undefined

  if (platform === 'github' || platform === 'bluesky') {
    clearPlatformSession(res, platform)
  } else {
    clearPlatformSession(res, 'github')
    clearPlatformSession(res, 'bluesky')
  }

  res.status(200).json({ ok: true })
}
