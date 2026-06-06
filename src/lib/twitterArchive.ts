/**
 * Parse the follower/following files from an official X (Twitter) data archive
 * and compute who you follow that doesn't follow you back — entirely offline.
 *
 * The archive ships these as `.js` files (not JSON) that assign a global:
 *   window.YTD.following.part0 = [ { "following": { "accountId": "123", ... } }, ... ]
 *   window.YTD.follower.part0  = [ { "follower":  { "accountId": "456", ... } }, ... ]
 *
 * Large accounts split across multiple files (following-part1.js → .part1, …),
 * so callers pass every matching file's text and we concatenate.
 *
 * The archive contains ONLY numeric account ids — no @handle / display name — so
 * results link to https://x.com/i/user/<id>, which redirects to the real profile.
 */

import type { Account } from '../types/platform'

type WrapperKey = 'following' | 'follower'

/** Build the profile link X resolves from a bare account id. */
const profileUrl = (accountId: string): string =>
  `https://x.com/i/user/${accountId}`

/** Turn one archive entry's account id into a normalized Account. */
const toAccount = (accountId: string): Account => ({
  id: accountId,
  // No handle in the archive — fall back to the id so the UI has something to show.
  handle: accountId,
  profileUrl: profileUrl(accountId),
})

/**
 * Extract account ids from a single `window.YTD.<key>.partN = [...]` file.
 * Throws a friendly error if the file isn't the expected shape.
 */
export const parseArchiveFile = (text: string, key: WrapperKey): string[] => {
  const eq = text.indexOf('=')
  if (eq === -1) {
    throw new Error('This does not look like an X archive file.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text.slice(eq + 1).trim())
  } catch {
    throw new Error('Could not read this X archive file — is it the right one?')
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Unexpected X archive format.')
  }

  const ids: string[] = []
  for (const entry of parsed) {
    const inner = (entry as Record<string, unknown>)?.[key] as
      | { accountId?: unknown }
      | undefined
    const id = inner?.accountId
    if (typeof id === 'string' && id.length > 0) ids.push(id)
  }
  return ids
}

/** Parse and concatenate several part files of the same kind. */
export const parseArchiveFiles = (
  texts: string[],
  key: WrapperKey,
): string[] => {
  const ids: string[] = []
  for (const text of texts) ids.push(...parseArchiveFile(text, key))
  return ids
}

/**
 * Compute the accounts you follow who don't follow you back.
 * `followingTexts` come from following*.js, `followerTexts` from follower*.js.
 */
export const computeArchiveUnfollowers = (
  followingTexts: string[],
  followerTexts: string[],
): Account[] => {
  const followingIds = parseArchiveFiles(followingTexts, 'following')
  const followerIds = new Set(parseArchiveFiles(followerTexts, 'follower'))

  const seen = new Set<string>()
  const result: Account[] = []
  for (const id of followingIds) {
    if (followerIds.has(id) || seen.has(id)) continue
    seen.add(id)
    result.push(toAccount(id))
  }
  return result
}

/** Heuristic to route a dropped/selected file to the right bucket by name. */
export const classifyArchiveFile = (
  fileName: string,
): WrapperKey | null => {
  const name = fileName.toLowerCase()
  if (name.startsWith('following')) return 'following'
  if (name.startsWith('follower')) return 'follower'
  return null
}
