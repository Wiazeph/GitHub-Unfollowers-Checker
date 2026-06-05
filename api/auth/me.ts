import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Agent } from '@atproto/api'
import { clearSessionCookie, getSession } from '../_lib/auth.js'
import { getOAuthClient } from '../_lib/bluesky-oauth.js'

/** Report the current session: { authenticated, platform?, handle? }. */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  res.setHeader('Cache-Control', 'private, no-store')

  const session = getSession(req)
  if (!session) {
    res.status(200).json({ authenticated: false })
    return
  }

  if (session.platform === 'bluesky') {
    try {
      const client = await getOAuthClient()
      const oauthSession = await client.restore(session.value)
      const agent = new Agent(oauthSession)
      const profile = await agent.getProfile({ actor: agent.assertDid })
      res.status(200).json({
        authenticated: true,
        platform: 'bluesky',
        handle: profile.data.handle,
      })
    } catch {
      clearSessionCookie(res)
      res.status(200).json({ authenticated: false })
    }
    return
  }

  // GitHub
  let response: Response
  try {
    response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${session.value}`,
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
