/** Shared OAuth constants and helpers for the GitLab (gitlab.com) login flow. */
import type { VercelRequest } from '@vercel/node'
import { getOrigin } from './oauth.js'

export const GITLAB_API = 'https://gitlab.com/api/v4'
export const GITLAB_AUTHORIZE_URL = 'https://gitlab.com/oauth/authorize'
export const GITLAB_TOKEN_URL = 'https://gitlab.com/oauth/token'
/**
 * GitLab has no narrow "follow" scope, and read_user can't write. Reading the
 * follow lists *and* unfollowing both need full API access, so we request `api`.
 */
export const GITLAB_OAUTH_SCOPE = 'api'

export const getRedirectUri = (req: VercelRequest): string =>
  `${getOrigin(req)}/api/auth/gitlab/callback`
