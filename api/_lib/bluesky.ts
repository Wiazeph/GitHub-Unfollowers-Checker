/**
 * Server-side Bluesky (AT Protocol) provider.
 *
 * Reads are unauthenticated against the public AppView (no API key, no cost).
 * Unlike GitHub's `Link`-header pagination, AT Proto is cursor-based and
 * therefore inherently sequential — we cannot fan out pages in parallel. To stay
 * under the function timeout we cap the number of pages and surface a clear
 * "account too large" error instead of returning a partial (and wrong) list.
 */

import { ProviderError, type Account, type Provider } from './provider.js'

const APPVIEW = 'https://public.api.bsky.app'
const PER_PAGE = 100
/** Hard cap so a huge account can't blow the 60s timeout (≈ MAX_PAGES × 100 accounts). */
const MAX_PAGES = 60

/** Bluesky handles are domain-style: at least one dot, e.g. name.bsky.social. */
const HANDLE_PATTERN = /^(?!-)[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/

/** Raw actor object returned by getFollows / getFollowers. */
interface BskyActor {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}

type ListMethod = 'getFollows' | 'getFollowers'

const toAccount = (actor: BskyActor): Account => ({
  id: actor.did,
  handle: actor.handle,
  displayName: actor.displayName,
  avatarUrl: actor.avatar,
  profileUrl: `https://bsky.app/profile/${actor.handle}`,
})

const mapErrorResponse = async (response: Response): Promise<ProviderError> => {
  if (response.status === 429) {
    const retryAfterHeader = Number(response.headers.get('retry-after'))
    const retryAfter = Number.isFinite(retryAfterHeader)
      ? retryAfterHeader
      : undefined
    return new ProviderError(
      'RATE_LIMIT',
      'Bluesky rate limit exceeded. Please try again later.',
      429,
      retryAfter,
    )
  }

  // AT Proto signals an unknown actor with a 400 + "Actor not found" message.
  if (response.status === 400) {
    const body = (await response.json().catch(() => null)) as {
      message?: string
    } | null
    if (body?.message && /actor not found/i.test(body.message)) {
      return new ProviderError('NOT_FOUND', 'Account not found', 404)
    }
  }

  return new ProviderError('UPSTREAM', 'Bluesky API error', 502)
}

/** Fetch every page of a cursor-paginated list, bounded by MAX_PAGES. */
const listAll = async (
  method: ListMethod,
  actor: string,
): Promise<Account[]> => {
  const key = method === 'getFollows' ? 'follows' : 'followers'
  const out: Account[] = []
  let cursor: string | undefined

  for (let page = 0; page < MAX_PAGES; page++) {
    const url =
      `${APPVIEW}/xrpc/app.bsky.graph.${method}` +
      `?actor=${encodeURIComponent(actor)}&limit=${PER_PAGE}` +
      (cursor ? `&cursor=${encodeURIComponent(cursor)}` : '')

    let response: Response
    try {
      response = await fetch(url)
    } catch {
      throw new ProviderError('UPSTREAM', 'Network error reaching Bluesky', 502)
    }
    if (!response.ok) throw await mapErrorResponse(response)

    const json = (await response.json()) as {
      [k: string]: BskyActor[] | string | undefined
      cursor?: string
    }
    const items = (json[key] as BskyActor[] | undefined) ?? []
    for (const actor of items) out.push(toAccount(actor))

    cursor = json.cursor
    if (!cursor || items.length === 0) return out
  }

  // Hit the page cap without exhausting the list → don't return a partial result.
  throw new ProviderError(
    'UPSTREAM',
    'This Bluesky account is too large to scan in one pass.',
    502,
  )
}

/**
 * Compute the set of accounts `handle` follows but who do not follow back.
 * Mirrors the GitHub provider: fetch follows first, short-circuit if empty.
 */
export const getUnfollowers = async (handle: string): Promise<Account[]> => {
  const follows = await listAll('getFollows', handle)
  if (follows.length === 0) return []

  const followers = await listAll('getFollowers', handle)
  const followerDids = new Set(followers.map((account) => account.id))
  return follows.filter((account) => !followerDids.has(account.id))
}

export const blueskyProvider: Provider = {
  id: 'bluesky',
  validateHandle: (handle) => HANDLE_PATTERN.test(handle),
  getUnfollowers,
}
