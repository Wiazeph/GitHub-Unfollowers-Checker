/**
 * Cloudflare Worker entry — the backend API for Unfollowers Checker.
 *
 * Replaces the old Vercel `api/*.ts` serverless functions: one Worker with a
 * Hono router handles every `/api/*` route (plus the two OAuth metadata docs).
 * Anything the router doesn't match falls through to the static SPA, which
 * Cloudflare serves directly via the `assets` binding (not_found_handling:
 * single-page-application), so no fallback code is needed here.
 *
 * Env (bindings + secrets) is per-request via `c.env` — never module scope.
 */
import { Hono, type Context } from 'hono'
import {
  STATE_COOKIE,
  clearSessionCookie,
  clearStateCookie,
  getPlatformSession,
  parseCookies,
  randomToken,
  sessionCookie,
  stateCookie,
  unsign,
  type Platform,
} from './lib/auth.js'
import { getProvider } from './lib/registry.js'
import { ProviderError, normalizeHandle, type PlatformId } from './lib/provider.js'
import {
  getMyHandle,
  getMyUnfollowers,
  isUserId,
  unfollow as gitlabUnfollow,
} from './lib/gitlab.js'
import { isDid } from './lib/bluesky.js'
import {
  finishCallback,
  getClientMetadata,
  getHandleForDid,
  getJwks,
  startAuthorize,
  unfollowForDid,
} from './lib/bluesky-oauth.js'
import {
  GITHUB_AUTHORIZE_URL,
  GITHUB_TOKEN_URL,
  OAUTH_SCOPE,
  getOrigin,
  getRedirectUri,
} from './lib/oauth.js'
import {
  GITLAB_AUTHORIZE_URL,
  GITLAB_OAUTH_SCOPE,
  GITLAB_TOKEN_URL,
  getRedirectUri as getGitlabRedirectUri,
} from './lib/gitlab-oauth.js'

type Ctx = Context<{ Bindings: Env }>

const app = new Hono<{ Bindings: Env }>()

/** Append a Set-Cookie header without clobbering existing ones. */
const addCookie = (c: Ctx, cookie: string) =>
  c.header('Set-Cookie', cookie, { append: true })

const GITHUB_USERNAME = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/
const BLUESKY_HANDLE = /^(?!-)[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/
const MAX_TARGETS = 200
const UNFOLLOW_CONCURRENCY = 5

/* ------------------------------- unfollowers ------------------------------ */

app.get('/api/unfollowers', async (c) => {
  // Default to GitHub so existing `?username=` links keep working unchanged.
  const platform = (c.req.query('platform') || 'github').trim()

  // GitLab isn't public — read the signed-in user's own list from their token.
  if (platform === 'gitlab') {
    const token = getPlatformSession(c.req.header('cookie') ?? null, 'gitlab', c.env.AUTH_SECRET)
    if (!token) {
      return c.json({ error: 'You must sign in first', code: 'UNAUTHORIZED' }, 401)
    }
    try {
      const unfollowers = await getMyUnfollowers(token)
      c.header('Cache-Control', 'private, max-age=0')
      return c.json({ unfollowers, count: unfollowers.length })
    } catch (error) {
      return providerErrorResponse(c, error)
    }
  }

  const provider = getProvider(platform)
  if (!provider) {
    return c.json({ error: 'Unsupported platform', code: 'BAD_REQUEST' }, 400)
  }

  const handle = normalizeHandle(
    platform as PlatformId,
    (c.req.query('handle') || c.req.query('username') || '').trim(),
  )
  if (!handle) {
    return c.json({ error: 'A username is required', code: 'BAD_REQUEST' }, 400)
  }
  if (!provider.validateHandle(handle)) {
    return c.json({ error: 'That is not a valid username', code: 'BAD_REQUEST' }, 400)
  }

  try {
    const unfollowers = await provider.getUnfollowers(handle, c.env)
    c.header('Cache-Control', 'private, max-age=0')
    return c.json({ unfollowers, count: unfollowers.length })
  } catch (error) {
    return providerErrorResponse(c, error)
  }
})

/* --------------------------------- unfollow ------------------------------- */

app.post('/api/unfollow', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    platform?: unknown
    targets?: unknown
    usernames?: unknown
  }
  const platform: Platform =
    body.platform === 'bluesky'
      ? 'bluesky'
      : body.platform === 'gitlab'
        ? 'gitlab'
        : 'github'

  const session = getPlatformSession(c.req.header('cookie') ?? null, platform, c.env.AUTH_SECRET)
  if (!session) {
    return c.json({ error: 'You must sign in first', code: 'UNAUTHORIZED' }, 401)
  }

  const raw = Array.isArray(body.targets)
    ? body.targets
    : Array.isArray(body.usernames)
      ? body.usernames
      : []
  const targets = raw.filter((t): t is string => typeof t === 'string')
  if (targets.length === 0) {
    return c.json({ error: 'No valid targets provided', code: 'BAD_REQUEST' }, 400)
  }
  if (targets.length > MAX_TARGETS) {
    return c.json({ error: `Too many users (max ${MAX_TARGETS})`, code: 'BAD_REQUEST' }, 400)
  }

  if (platform === 'bluesky') {
    const dids = targets.filter(isDid)
    if (dids.length === 0) {
      return c.json({ error: 'No valid targets provided', code: 'BAD_REQUEST' }, 400)
    }
    try {
      return c.json(await unfollowForDid(session, dids, c.env, c.req.raw))
    } catch {
      return c.json({ error: 'Could not unfollow on Bluesky', code: 'UPSTREAM' }, 502)
    }
  }

  if (platform === 'gitlab') {
    const ids = targets.filter(isUserId)
    if (ids.length === 0) {
      return c.json({ error: 'No valid targets provided', code: 'BAD_REQUEST' }, 400)
    }
    try {
      return c.json(await gitlabUnfollow(session, ids))
    } catch {
      return c.json({ error: 'Could not unfollow on GitLab', code: 'UPSTREAM' }, 502)
    }
  }

  // GitHub — DELETE /user/following/{username}, bounded concurrency.
  const usernames = targets.filter((u) => GITHUB_USERNAME.test(u))
  if (usernames.length === 0) {
    return c.json({ error: 'No valid usernames provided', code: 'BAD_REQUEST' }, 400)
  }
  const removed: string[] = []
  const failed: string[] = []
  const queue = [...usernames]
  while (queue.length > 0) {
    const batch = queue.splice(0, UNFOLLOW_CONCURRENCY)
    const results = await Promise.all(
      batch.map(async (username) => ({
        username,
        ok: await githubUnfollowOne(username, session),
      })),
    )
    for (const { username, ok } of results) {
      if (ok) removed.push(username)
      else failed.push(username)
    }
  }
  return c.json({ removed, failed })
})

/* ------------------------------- GitHub auth ------------------------------ */

app.get('/api/auth/login', (c) => {
  const clientId = c.env.GITHUB_OAUTH_CLIENT_ID
  if (!clientId) return c.json({ error: 'OAuth is not configured', code: 'CONFIG' }, 500)

  const state = randomToken()
  addCookie(c, stateCookie(state, c.env.AUTH_SECRET))

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(c.req.raw, c.env),
    scope: OAUTH_SCOPE,
    state,
    allow_signup: 'false',
  })
  return c.redirect(`${GITHUB_AUTHORIZE_URL}?${params.toString()}`, 302)
})

app.get('/api/auth/callback', async (c) => {
  const origin = getOrigin(c.req.raw, c.env)
  const fail = (reason: string) =>
    c.redirect(`${origin}/?auth_error=${encodeURIComponent(reason)}`, 302)

  const clientId = c.env.GITHUB_OAUTH_CLIENT_ID
  const clientSecret = c.env.GITHUB_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return c.json({ error: 'OAuth is not configured', code: 'CONFIG' }, 500)
  }

  const code = c.req.query('code') ?? ''
  const state = c.req.query('state') ?? ''
  const expectedState = unsign(
    parseCookies(c.req.header('cookie') ?? null)[STATE_COOKIE],
    c.env.AUTH_SECRET,
  )
  addCookie(c, clearStateCookie())

  if (!code || !state || !expectedState || state !== expectedState) return fail('invalid_state')

  let tokenResponse: Response
  try {
    tokenResponse = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: getRedirectUri(c.req.raw, c.env),
      }),
    })
  } catch {
    return fail('network')
  }
  if (!tokenResponse.ok) return fail('exchange_failed')

  const data = (await tokenResponse.json()) as { access_token?: string; error?: string }
  if (!data.access_token) return fail(data.error ?? 'no_token')

  addCookie(c, sessionCookie('github', data.access_token, c.env.AUTH_SECRET))
  return c.redirect(`${origin}/`, 302)
})

/* ------------------------------- GitLab auth ------------------------------ */

app.get('/api/auth/gitlab/login', (c) => {
  const clientId = c.env.GITLAB_OAUTH_CLIENT_ID
  if (!clientId) return c.json({ error: 'OAuth is not configured', code: 'CONFIG' }, 500)

  const state = randomToken()
  addCookie(c, stateCookie(state, c.env.AUTH_SECRET))

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGitlabRedirectUri(c.req.raw, c.env),
    response_type: 'code',
    scope: GITLAB_OAUTH_SCOPE,
    state,
  })
  return c.redirect(`${GITLAB_AUTHORIZE_URL}?${params.toString()}`, 302)
})

app.get('/api/auth/gitlab/callback', async (c) => {
  const origin = getOrigin(c.req.raw, c.env)
  const fail = (reason: string) =>
    c.redirect(`${origin}/?auth_error=${encodeURIComponent(reason)}`, 302)

  const clientId = c.env.GITLAB_OAUTH_CLIENT_ID
  const clientSecret = c.env.GITLAB_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return c.json({ error: 'OAuth is not configured', code: 'CONFIG' }, 500)
  }

  const code = c.req.query('code') ?? ''
  const state = c.req.query('state') ?? ''
  const expectedState = unsign(
    parseCookies(c.req.header('cookie') ?? null)[STATE_COOKIE],
    c.env.AUTH_SECRET,
  )
  addCookie(c, clearStateCookie())

  if (!code || !state || !expectedState || state !== expectedState) return fail('invalid_state')

  let tokenResponse: Response
  try {
    // GitLab expects the token request as application/x-www-form-urlencoded.
    tokenResponse = await fetch(GITLAB_TOKEN_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: getGitlabRedirectUri(c.req.raw, c.env),
      }).toString(),
    })
  } catch {
    return fail('network')
  }
  if (!tokenResponse.ok) return fail('exchange_failed')

  const data = (await tokenResponse.json()) as { access_token?: string; error?: string }
  if (!data.access_token) return fail(data.error ?? 'no_token')

  addCookie(c, sessionCookie('gitlab', data.access_token, c.env.AUTH_SECRET))
  return c.redirect(`${origin}/`, 302)
})

/* ------------------------------ Bluesky auth ------------------------------ */

app.get('/api/auth/bluesky/login', async (c) => {
  const handle = normalizeHandle('bluesky', (c.req.query('handle') ?? '').trim())
  if (!handle || !BLUESKY_HANDLE.test(handle)) {
    return c.json({ error: 'A valid Bluesky handle is required', code: 'BAD_REQUEST' }, 400)
  }
  try {
    const url = await startAuthorize(handle, randomToken(), c.env, c.req.raw)
    return c.redirect(url, 302)
  } catch (error) {
    const reason =
      error instanceof Error && /resolve|handle|did/i.test(error.message)
        ? 'handle_not_found'
        : 'oauth_init_failed'
    return c.redirect(`/?auth_error=${encodeURIComponent(reason)}`, 302)
  }
})

app.get('/api/auth/bluesky/callback', async (c) => {
  try {
    const did = await finishCallback(new URL(c.req.url).searchParams, c.env, c.req.raw)
    addCookie(c, sessionCookie('bluesky', did, c.env.AUTH_SECRET))
    return c.redirect('/', 302)
  } catch {
    return c.redirect(`/?auth_error=${encodeURIComponent('bluesky_exchange_failed')}`, 302)
  }
})

/* --------------------------------- me / logout ---------------------------- */

app.get('/api/auth/me', async (c) => {
  c.header('Cache-Control', 'private, no-store')
  const cookie = c.req.header('cookie') ?? null
  const secret = c.env.AUTH_SECRET

  const github = await resolveGithub(cookie, secret)
  const bluesky = await resolveBluesky(c, cookie, secret)
  const gitlab = await resolveGitlab(c, cookie, secret)

  return c.json({ github, bluesky, gitlab })
})

app.post('/api/auth/logout', (c) => {
  const raw = c.req.query('platform')
  const platform = raw as Platform | undefined
  if (platform === 'github' || platform === 'bluesky' || platform === 'gitlab') {
    addCookie(c, clearSessionCookie(platform))
  } else {
    addCookie(c, clearSessionCookie('github'))
    addCookie(c, clearSessionCookie('bluesky'))
    addCookie(c, clearSessionCookie('gitlab'))
  }
  return c.json({ ok: true })
})

/* ------------------------- Bluesky OAuth metadata ------------------------- */

// Served at /client-metadata.json and /jwks.json (the AT Proto client_id points
// at the former; the former's jwks_uri points at the latter).
app.get('/client-metadata.json', async (c) => {
  try {
    c.header('Cache-Control', 'public, max-age=300')
    return c.json((await getClientMetadata(c.env, c.req.raw)) as object)
  } catch {
    return c.json({ error: 'OAuth is not configured', code: 'CONFIG' }, 500)
  }
})

app.get('/jwks.json', async (c) => {
  try {
    c.header('Cache-Control', 'public, max-age=300')
    return c.json((await getJwks(c.env, c.req.raw)) as object)
  } catch {
    return c.json({ error: 'OAuth is not configured', code: 'CONFIG' }, 500)
  }
})

export default app

/* --------------------------------- helpers -------------------------------- */

function providerErrorResponse(c: Ctx, error: unknown): Response {
  if (error instanceof ProviderError) {
    return c.json(
      {
        error: error.message,
        code: error.code,
        ...(error.retryAfter !== undefined && { retryAfter: error.retryAfter }),
      },
      error.status as 400 | 404 | 429 | 500 | 502,
    )
  }
  return c.json({ error: 'Unexpected server error', code: 'UPSTREAM' }, 502)
}

async function githubUnfollowOne(username: string, token: string): Promise<boolean> {
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
    return response.status === 204
  } catch {
    return false
  }
}

async function resolveGithub(
  cookie: string | null,
  secret: string,
): Promise<{ handle: string } | null> {
  const token = getPlatformSession(cookie, 'github', secret)
  if (!token) return null
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'github-unfollowers-checker',
      },
    })
    if (!response.ok) return null
    const user = (await response.json()) as { login: string }
    return { handle: user.login }
  } catch {
    return null
  }
}

async function resolveGitlab(
  c: Ctx,
  cookie: string | null,
  secret: string,
): Promise<{ handle: string } | null> {
  const token = getPlatformSession(cookie, 'gitlab', secret)
  if (!token) return null
  try {
    return { handle: await getMyHandle(token) }
  } catch {
    addCookie(c, clearSessionCookie('gitlab'))
    return null
  }
}

async function resolveBluesky(
  c: Ctx,
  cookie: string | null,
  secret: string,
): Promise<{ handle: string } | null> {
  const did = getPlatformSession(cookie, 'bluesky', secret)
  if (!did) return null
  try {
    return { handle: await getHandleForDid(did, c.env, c.req.raw) }
  } catch {
    addCookie(c, clearSessionCookie('bluesky'))
    return null
  }
}
