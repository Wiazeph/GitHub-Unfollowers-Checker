import type { VercelRequest, VercelResponse } from '@vercel/node'
import { clearPlatformSession, getPlatformSession } from '../_lib/auth.js'
import { getHandleForDid } from '../_lib/bluesky-oauth.js'
import { getMyHandle } from '../_lib/gitlab.js'

/**
 * Report sign-in state for every platform independently, so a user can be
 * signed in to several platforms at the same time:
 *   { github: { handle } | null, bluesky: { handle } | null, gitlab: { handle } | null }
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  res.setHeader('Cache-Control', 'private, no-store')

  const github = await resolveGithub(req, res)
  const bluesky = await resolveBluesky(req, res)
  const gitlab = await resolveGitlab(req, res)

  res.status(200).json({ github, bluesky, gitlab })
}

/** Validate the GitLab session and return its handle, or null. */
const resolveGitlab = async (
  req: VercelRequest,
  res: VercelResponse,
): Promise<{ handle: string } | null> => {
  const token = getPlatformSession(req, 'gitlab')
  if (!token) return null

  try {
    const handle = await getMyHandle(token)
    return { handle }
  } catch {
    // Token expired or revoked → clear the stale cookie.
    clearPlatformSession(res, 'gitlab')
    return null
  }
}

/** Validate the GitHub session and return its handle, or null. */
const resolveGithub = async (
  req: VercelRequest,
  res: VercelResponse,
): Promise<{ handle: string } | null> => {
  const token = getPlatformSession(req, 'github')
  if (!token) return null

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
    return null
  }

  // Token expired or revoked → clear the stale cookie.
  if (!response.ok) {
    clearPlatformSession(res, 'github')
    return null
  }

  const user = (await response.json()) as { login: string }
  return { handle: user.login }
}

/** Restore the Bluesky session and return its handle, or null. */
const resolveBluesky = async (
  req: VercelRequest,
  res: VercelResponse,
): Promise<{ handle: string } | null> => {
  const did = getPlatformSession(req, 'bluesky')
  if (!did) return null

  try {
    const handle = await getHandleForDid(did)
    return { handle }
  } catch {
    clearPlatformSession(res, 'bluesky')
    return null
  }
}
