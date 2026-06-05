import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSessionToken } from './_lib/auth.js'

const USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/
const MAX_USERNAMES = 200
/** Unfollow requests sent in parallel at a time. */
const CONCURRENCY = 5

const unfollowOne = async (
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

/** Unfollow one or more users on behalf of the authenticated session. */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed', code: 'BAD_REQUEST' })
    return
  }

  const token = getSessionToken(req)
  if (!token) {
    res.status(401).json({ error: 'You must sign in first', code: 'UNAUTHORIZED' })
    return
  }

  const body = (req.body ?? {}) as { usernames?: unknown }
  const usernames = Array.isArray(body.usernames)
    ? body.usernames.filter(
        (u): u is string => typeof u === 'string' && USERNAME_PATTERN.test(u),
      )
    : []

  if (usernames.length === 0) {
    res.status(400).json({ error: 'No valid usernames provided', code: 'BAD_REQUEST' })
    return
  }
  if (usernames.length > MAX_USERNAMES) {
    res
      .status(400)
      .json({ error: `Too many users (max ${MAX_USERNAMES})`, code: 'BAD_REQUEST' })
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
        ok: await unfollowOne(username, token),
      })),
    )
    for (const { username, ok } of results) {
      if (ok) removed.push(username)
      else failed.push(username)
    }
  }

  res.status(200).json({ removed, failed })
}
