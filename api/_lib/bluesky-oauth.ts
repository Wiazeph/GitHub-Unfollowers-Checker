// @ts-nocheck
/**
 * AT Protocol OAuth client (confidential / BFF).
 *
 * The library handles DPoP, PAR, PKCE, token refresh and metadata/DID
 * resolution for us. We only provide: a public client-metadata document (served
 * at /client-metadata.json), a signing keyset, and persistent state/session
 * stores. Vercel functions are stateless, so the stores are backed by Upstash
 * Redis rather than memory.
 *
 * This module is the single place that touches `@atproto/*`. Those packages are
 * `exports`-only and their types only resolve under NodeNext/bundler module
 * resolution. The `@vercel/node` builder type-checks each function with the
 * legacy `node` resolution and ignores our tsconfig, so it can't see those
 * types and the build fails ("no exported member JoseKey", "restore does not
 * exist on NodeOAuthClient"). We isolate all @atproto usage here behind plainly
 * typed wrapper functions and disable type-checking for THIS FILE ONLY, so every
 * other API function stays fully type-checked and never imports @atproto. The
 * real type-checking still happens locally via `tsc -b` in `pnpm build`.
 *
 * Required env vars (see .env.local.example):
 *   PUBLIC_URL            e.g. https://your-app.vercel.app (no trailing slash)
 *   BLUESKY_PRIVATE_KEY   a PEM/JWK private key (ES256) for private_key_jwt
 *   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 */

import {
  NodeOAuthClient,
  JoseKey,
  type NodeSavedState,
  type NodeSavedSession,
} from '@atproto/oauth-client-node'
import { Agent } from '@atproto/api'
import { Redis } from '@upstash/redis'
import { unfollow as repoUnfollow } from './bluesky.js'

/** OAuth records expire on their own; we add a TTL as a backstop for orphans. */
const STATE_TTL_SECONDS = 60 * 10 // 10 minutes
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 90 // 90 days

/** Resolve the public origin this deployment is reachable at. */
export const publicUrl = (): string => {
  const explicit = process.env.PUBLIC_URL
  if (explicit) return explicit.replace(/\/$/, '')
  // Vercel provides the deployment host without protocol.
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://127.0.0.1:3000'
}

let redisInstance: Redis | null = null
const redis = (): Redis => {
  if (!redisInstance) {
    redisInstance = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL ?? '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
    })
  }
  return redisInstance
}

const STATE_PREFIX = 'bsky:oauth:state:'
const SESSION_PREFIX = 'bsky:oauth:session:'

let clientInstance: NodeOAuthClient | null = null

export const getOAuthClient = async (): Promise<NodeOAuthClient> => {
  if (clientInstance) return clientInstance

  const privateKey = process.env.BLUESKY_PRIVATE_KEY
  if (!privateKey) throw new Error('BLUESKY_PRIVATE_KEY is not configured')

  const base = publicUrl()
  const r = redis()

  clientInstance = new NodeOAuthClient({
    clientMetadata: {
      client_id: `${base}/client-metadata.json`,
      client_name: 'Unfollowers Checker',
      client_uri: base,
      redirect_uris: [`${base}/api/auth/bluesky/callback`],
      scope: 'atproto transition:generic',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      application_type: 'web',
      token_endpoint_auth_method: 'private_key_jwt',
      token_endpoint_auth_signing_alg: 'ES256',
      dpop_bound_access_tokens: true,
      jwks_uri: `${base}/jwks.json`,
    },
    keyset: [await JoseKey.fromImportable(privateKey, 'bsky-key-1')],

    stateStore: {
      async set(key: string, state: NodeSavedState): Promise<void> {
        await r.set(STATE_PREFIX + key, JSON.stringify(state), {
          ex: STATE_TTL_SECONDS,
        })
      },
      async get(key: string): Promise<NodeSavedState | undefined> {
        const value = await r.get<NodeSavedState | string>(STATE_PREFIX + key)
        if (value == null) return undefined
        return typeof value === 'string'
          ? (JSON.parse(value) as NodeSavedState)
          : value
      },
      async del(key: string): Promise<void> {
        await r.del(STATE_PREFIX + key)
      },
    },

    sessionStore: {
      async set(sub: string, session: NodeSavedSession): Promise<void> {
        await r.set(SESSION_PREFIX + sub, JSON.stringify(session), {
          ex: SESSION_TTL_SECONDS,
        })
      },
      async get(sub: string): Promise<NodeSavedSession | undefined> {
        const value = await r.get<NodeSavedSession | string>(
          SESSION_PREFIX + sub,
        )
        if (value == null) return undefined
        return typeof value === 'string'
          ? (JSON.parse(value) as NodeSavedSession)
          : value
      },
      async del(sub: string): Promise<void> {
        await r.del(SESSION_PREFIX + sub)
      },
    },
  })

  return clientInstance
}

/* -------------------------------------------------------------------------- */
/* Plainly-typed wrappers — the only @atproto surface other functions touch.  */
/* -------------------------------------------------------------------------- */

/** Public OAuth client-metadata document (served at /client-metadata.json). */
export const getClientMetadata = async (): Promise<unknown> => {
  const client = await getOAuthClient()
  return client.clientMetadata
}

/** Public JWKS (served at /jwks.json). */
export const getJwks = async (): Promise<unknown> => {
  const client = await getOAuthClient()
  return client.jwks
}

/** Begin the OAuth flow for a handle; returns the authorize URL to redirect to. */
export const startAuthorize = async (
  handle: string,
  state: string,
): Promise<string> => {
  const client = await getOAuthClient()
  const url = await client.authorize(handle, {
    scope: 'atproto transition:generic',
    state,
  })
  return url.toString()
}

/** Finish the OAuth flow from the callback query; returns the user's DID. */
export const finishCallback = async (
  params: URLSearchParams,
): Promise<string> => {
  const client = await getOAuthClient()
  const { session } = await client.callback(params)
  return session.did
}

/** Restore a session by DID and return the account handle (for /api/auth/me). */
export const getHandleForDid = async (did: string): Promise<string> => {
  const client = await getOAuthClient()
  const oauthSession = await client.restore(did)
  const agent = new Agent(oauthSession)
  const profile = await agent.getProfile({ actor: agent.assertDid })
  return profile.data.handle
}

/** Restore a session by DID and unfollow the given subject DIDs. */
export const unfollowForDid = async (
  did: string,
  subjectDids: string[],
): Promise<{ removed: string[]; failed: string[] }> => {
  const client = await getOAuthClient()
  const oauthSession = await client.restore(did)
  const agent = new Agent(oauthSession)
  return repoUnfollow(agent, did, subjectDids)
}
