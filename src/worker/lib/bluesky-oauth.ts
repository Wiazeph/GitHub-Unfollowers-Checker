/**
 * AT Protocol OAuth client (confidential / BFF) — Cloudflare Workers edition.
 *
 * Replaces the Node `@atproto/oauth-client-node` (which doesn't run on Workers)
 * with `atproto-oauth-client-cloudflare-workers` (`WorkersOAuthClient`), and the
 * Upstash Redis state/session stores with Cloudflare KV (`env.OAUTH_KV`):
 *   - state   → StateStoreKV   (short-lived: PKCE/DPoP, ~10m via KV TTL)
 *   - session → SessionStoreKV (long-lived: access/refresh tokens, keyed by DID)
 *
 * The library handles DPoP, PAR, PKCE, token refresh and metadata/DID
 * resolution. We provide: a public client-metadata document (served at
 * /client-metadata.json), an ES256 signing keyset, and the two KV stores.
 *
 * This module is the only place that touches the AT Protocol packages, behind
 * plainly-typed wrapper functions, so the rest of the Worker never imports them.
 *
 * Required env:
 *   PUBLIC_URL            stable origin, e.g. https://unfollowerschecker.com
 *   BLUESKY_PRIVATE_KEY   ES256 private JWK (single-line JSON) for private_key_jwt
 *   OAUTH_KV              KV namespace binding
 */
import {
  WorkersOAuthClient,
  StateStoreKV,
  SessionStoreKV,
} from 'atproto-oauth-client-cloudflare-workers'
import { JoseKey } from '@atproto/jwk-jose'
import { Agent } from '@atproto/api'
import { unfollow as repoUnfollow } from './bluesky.js'

const STATE_PREFIX = 'bsky:oauth:state:'
const SESSION_PREFIX = 'bsky:oauth:session:'

/** Origin used to build the OAuth client_id and redirect URIs (must be stable). */
const publicUrl = (env: Env, request?: Request): string => {
  if (env.PUBLIC_URL) return env.PUBLIC_URL.replace(/\/$/, '')
  if (request) return new URL(request.url).origin
  return 'http://127.0.0.1:5173'
}

/**
 * Build the OAuth client for this request. The Worker env (KV binding + private
 * key) is only available per-request, so the client is created per-call rather
 * than as a module singleton.
 */
const getOAuthClient = async (
  env: Env,
  request?: Request,
): Promise<WorkersOAuthClient> => {
  const privateKey = env.BLUESKY_PRIVATE_KEY
  if (!privateKey) throw new Error('BLUESKY_PRIVATE_KEY is not configured')

  const base = publicUrl(env, request)

  // KV stores. We namespace keys so the OAUTH_KV binding can be shared safely.
  const stateStore = new StateStoreKV(prefixedKV(env.OAUTH_KV, STATE_PREFIX))
  const sessionStore = new SessionStoreKV(
    prefixedKV(env.OAUTH_KV, SESSION_PREFIX),
  )
  const keyset = [await JoseKey.fromImportable(privateKey, 'bsky-key-1')]

  // AT Protocol requires a confidential client to be served over HTTPS with a
  // non-IP hostname. Local dev (http / 127.0.0.1) can't satisfy that, so there
  // we fall back to the spec's "loopback development client": client_id is the
  // literal `http://localhost` origin carrying the redirect_uri + scope as query
  // params, the client is public (no keyset / metadata document needed), and the
  // redirect must use a loopback IP. See RFC 8252 + the atproto OAuth spec.
  const isLoopback = base.startsWith('http://')
  if (isLoopback) {
    const redirectUri = `${base}/api/auth/bluesky/callback`
    const scope = 'atproto transition:generic'
    const clientId = `http://localhost?redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&scope=${encodeURIComponent(scope)}`
    return new WorkersOAuthClient({
      clientMetadata: {
        client_id: clientId,
        client_name: 'Unfollowers Checker (dev)',
        redirect_uris: [redirectUri],
        scope,
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        application_type: 'native',
        token_endpoint_auth_method: 'none',
        dpop_bound_access_tokens: true,
      },
      stateStore,
      sessionStore,
    })
  }

  return new WorkersOAuthClient({
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
    keyset,
    stateStore,
    sessionStore,
  })
}

/**
 * Wrap a KV namespace so every key is transparently prefixed. Lets the single
 * OAUTH_KV binding hold both the state and session stores without collisions,
 * preserving the original Redis key scheme.
 */
const prefixedKV = (kv: KVNamespace, prefix: string): KVNamespace =>
  ({
    get: (key: string, opts?: unknown) =>
      kv.get(prefix + key, opts as never),
    put: (key: string, value: string, opts?: unknown) =>
      kv.put(prefix + key, value, opts as never),
    delete: (key: string) => kv.delete(prefix + key),
  }) as unknown as KVNamespace

/* -------------------------------------------------------------------------- */
/* Plainly-typed wrappers — the only AT Protocol surface the router touches.  */
/* -------------------------------------------------------------------------- */

/** Public OAuth client-metadata document (served at /client-metadata.json). */
export const getClientMetadata = async (
  env: Env,
  request: Request,
): Promise<unknown> => {
  const client = await getOAuthClient(env, request)
  return client.clientMetadata
}

/** Public JWKS (served at /jwks.json). */
export const getJwks = async (env: Env, request: Request): Promise<unknown> => {
  const client = await getOAuthClient(env, request)
  return client.jwks
}

/** Begin the OAuth flow for a handle; returns the authorize URL to redirect to. */
export const startAuthorize = async (
  handle: string,
  state: string,
  env: Env,
  request: Request,
): Promise<string> => {
  const client = await getOAuthClient(env, request)
  const url = await client.authorize(handle, {
    scope: 'atproto transition:generic',
    state,
  })
  return url.toString()
}

/** Finish the OAuth flow from the callback query; returns the user's DID. */
export const finishCallback = async (
  params: URLSearchParams,
  env: Env,
  request: Request,
): Promise<string> => {
  const client = await getOAuthClient(env, request)
  const { session } = await client.callback(params)
  return session.did
}

/** Restore a session by DID and return the account handle (for /api/auth/me). */
export const getHandleForDid = async (
  did: string,
  env: Env,
  request?: Request,
): Promise<string> => {
  const client = await getOAuthClient(env, request)
  const oauthSession = await client.restore(did)
  const agent = new Agent(oauthSession)
  const profile = await agent.getProfile({ actor: agent.assertDid })
  return profile.data.handle
}

/** Restore a session by DID and unfollow the given subject DIDs. */
export const unfollowForDid = async (
  did: string,
  subjectDids: string[],
  env: Env,
  request?: Request,
): Promise<{ removed: string[]; failed: string[] }> => {
  const client = await getOAuthClient(env, request)
  const oauthSession = await client.restore(did)
  const agent = new Agent(oauthSession)
  return repoUnfollow(agent, did, subjectDids)
}
