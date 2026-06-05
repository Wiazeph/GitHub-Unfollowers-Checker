import type { VercelRequest, VercelResponse } from '@vercel/node'
import { clearSessionCookie, getSessionToken } from '../_lib/auth.js'

/** Report the current session: { authenticated, platform?, handle? }. */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  res.setHeader('Cache-Control', 'private, no-store')

  const token = getSessionToken(req)
  if (!token) {
    res.status(200).json({ authenticated: false })
    return
  }

  let response: Response
  try {
    response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'github-unfollowers-checker',
      },
    })
  } catch {
    res.status(200).json({ authenticated: false })
    return
  }

  // Token expired or revoked → clear the stale cookie.
  if (!response.ok) {
    clearSessionCookie(res)
    res.status(200).json({ authenticated: false })
    return
  }

  const user = (await response.json()) as { login: string }
  res
    .status(200)
    .json({ authenticated: true, platform: 'github', handle: user.login })
}
