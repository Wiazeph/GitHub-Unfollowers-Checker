import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Agent } from '@atproto/api'
import { getPlatformSession, type Platform } from './_lib/auth.js'
import { getOAuthClient } from './_lib/bluesky-oauth.js'
import { isDid, unfollow as blueskyUnfollow } from './_lib/bluesky.js'

const USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/
const MAX_TARGETS = 200
/** Unfollow requests sent in parallel at a time (GitHub). */
const CONCURRENCY = 5

const githubUnfollowOne = async (
  username: string,
  token: string,
): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://api.github.com/user/following/${encodeURIComponent(username)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'github-unfollowers-checker',
        },
      },
    )
    // 204 No Content on success.
    return response.status === 204
  } catch {
    return false
  }
}

const readTargets = (body: {
  targets?: unknown
  usernames?: unknown
}): string[] => {
  // Accept `targets` (new) or `usernames` (legacy).
  const raw = Array.isArray(body.targets)
    ? body.targets
    : Array.isArray(body.usernames)
      ? body.usernames
      : []
  return raw.filter((t): t is string => typeof t === 'string')
}

/** Unfollow one or more accounts on behalf of the authenticated session. */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed', code: 'BAD_REQUEST' })
    return
  }

  const body = (req.body ?? {}) as {
    platform?: unknown
    targets?: unknown
    usernames?: unknown
  }
  const platform: Platform =
    body.platform === 'bluesky' ? 'bluesky' : 'github'

  const sessionValue = getPlatformSession(req, platform)
  if (!sessionValue) {
    res.status(401).json({ error: 'You must sign in first', code: 'UNAUTHORIZED' })
    return
  }

  const targets = readTargets(body)
  if (targets.length === 0) {
    res.status(400).json({ error: 'No valid targets provided', code: 'BAD_REQUEST' })
    return
  }
  if (targets.length > MAX_TARGETS) {
    res
      .status(400)
      .json({ error: `Too many users (max ${MAX_TARGETS})`, code: 'BAD_REQUEST' })
    return
  }

  if (platform === 'bluesky') {
    const dids = targets.filter(isDid)
    if (dids.length === 0) {
      res.status(400).json({ error: 'No valid targets provided', code: 'BAD_REQUEST' })
      return
    }
    try {
      const client = await getOAuthClient()
      const oauthSession = await client.restore(sessionValue)
      const agent = new Agent(oauthSession)
      const result = await blueskyUnfollow(agent, sessionValue, dids)
      res.status(200).json(result)
    } catch {
      res.status(502).json({ error: 'Could not unfollow on Bluesky', code: 'UPSTREAM' })
    }
    return
  }

  // GitHub
  const usernames = targets.filter((u) => USERNAME_PATTERN.test(u))
  if (usernames.length === 0) {
    res.status(400).json({ error: 'No valid usernames provided', code: 'BAD_REQUEST' })
    return
  }

  const removed: string[] = []
  const failed: string[] = []
  const queue = [...usernames]
  while (queue.length > 0) {
    const batch = queue.splice(0, CONCURRENCY)
    const results = await Promise.all(
      batch.map(async (username) => ({
        username,
        ok: await githubUnfollowOne(username, sessionValue),
      })),
    )
    for (const { username, ok } of results) {
      if (ok) removed.push(username)
      else failed.push(username)
    }
  }

  res.status(200).json({ removed, failed })
}
