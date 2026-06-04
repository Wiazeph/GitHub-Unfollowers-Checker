import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUnfollowers, GitHubError } from './_lib/github'

/** GitHub username rules: 1–39 chars, alphanumeric or single hyphens (not leading/trailing). */
const USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed', code: 'BAD_REQUEST' })
    return
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    res.status(500).json({ error: 'Server is misconfigured', code: 'CONFIG' })
    return
  }

  const raw = req.query.username
  const username = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? ''

  if (!username) {
    res
      .status(400)
      .json({ error: 'A GitHub username is required', code: 'BAD_REQUEST' })
    return
  }

  if (!USERNAME_PATTERN.test(username)) {
    res
      .status(400)
      .json({ error: 'That is not a valid GitHub username', code: 'BAD_REQUEST' })
    return
  }

  try {
    const unfollowers = await getUnfollowers(username, token)
    res.setHeader('Cache-Control', 'private, max-age=0')
    res.status(200).json({ unfollowers, count: unfollowers.length })
  } catch (error) {
    if (error instanceof GitHubError) {
      res.status(error.status).json({
        error: error.message,
        code: error.code,
        ...(error.retryAfter !== undefined && { retryAfter: error.retryAfter }),
      })
      return
    }
    res
      .status(502)
      .json({ error: 'Unexpected server error', code: 'UPSTREAM' })
  }
}
