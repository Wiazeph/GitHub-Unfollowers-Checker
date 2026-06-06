import {
  GithubIcon,
  BlueskyIcon,
  InstagramIcon,
  TwitterIcon,
  type BrandIcon,
} from './components/ui/BrandIcons'
import type { PlatformId } from './types/platform'

/** How a platform's sign-in works, drives which CTA the UI shows. */
type AuthKind = 'oauth' | 'none'

export interface PlatformConfig {
  id: PlatformId
  label: string
  icon: BrandIcon
  /** Validates a handle before we bother hitting the API. */
  handlePattern: RegExp
  placeholder: (authed: boolean) => string
  validationMessage: string
  /** 'oauth' → show a sign-in button; 'none' → read-only (no unfollow yet). */
  authKind: AuthKind
  /** Noun used in "Open on {noun}" links. */
  profileNoun: string
}

/** GitHub usernames: 1–39 chars, alphanumeric or single hyphens (not leading/trailing). */
const GITHUB_HANDLE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/
/** Bluesky handles are domain-style: at least one dot, e.g. name.bsky.social. */
const BLUESKY_HANDLE = /^(?!-)[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/

export const PLATFORMS: Record<PlatformId, PlatformConfig> = {
  github: {
    id: 'github',
    label: 'GitHub',
    icon: GithubIcon,
    handlePattern: GITHUB_HANDLE,
    placeholder: (authed) =>
      authed ? 'Look up another user…' : 'Enter a GitHub username',
    validationMessage: 'Please enter a valid GitHub username',
    authKind: 'oauth',
    profileNoun: 'GitHub',
  },
  bluesky: {
    id: 'bluesky',
    label: 'Bluesky',
    icon: BlueskyIcon,
    handlePattern: BLUESKY_HANDLE,
    placeholder: (authed) =>
      authed ? 'Look up another handle…' : 'Enter a Bluesky handle (name.bsky.social)',
    validationMessage: 'Please enter a valid Bluesky handle (e.g. name.bsky.social)',
    authKind: 'oauth',
    profileNoun: 'Bluesky',
  },
}

/**
 * Turn whatever a user pasted into a bare handle. People paste profile links
 * (https://github.com/Wiazeph/, https://bsky.app/profile/name.bsky.social) or
 * prefix an @, so we strip all of that down to the identifier.
 */
export const normalizeHandle = (platform: PlatformId, raw: string): string => {
  let value = raw.trim()

  // If it looks like a URL, pull out the relevant path segment.
  if (/^https?:\/\//i.test(value) || /^[\w.-]+\.[a-z]{2,}\//i.test(value)) {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
    try {
      const url = new URL(withProtocol)
      const segments = url.pathname.split('/').filter(Boolean)
      if (platform === 'bluesky') {
        // bsky.app/profile/<handle-or-did>
        const idx = segments.indexOf('profile')
        value = idx >= 0 && segments[idx + 1] ? segments[idx + 1] : (segments[0] ?? '')
      } else {
        // github.com/<user>[/...]
        value = segments[0] ?? ''
      }
    } catch {
      // fall through with the raw value
    }
  }

  // Strip a leading @ and any surrounding slashes/whitespace.
  return value.replace(/^@+/, '').replace(/^\/+|\/+$/g, '').trim()
}

/** Ordered list for rendering the platform selector. */
export const PLATFORM_LIST: PlatformConfig[] = [
  PLATFORMS.github,
  PLATFORMS.bluesky,
]

/** Instagram is a separate, browser-only tool (no server API), shown as its own tab. */
export const INSTAGRAM_TAB = {
  id: 'instagram' as const,
  label: 'Instagram',
  icon: InstagramIcon,
}

/** X (Twitter) is offline-only: the user uploads their data archive, we diff it. */
export const TWITTER_TAB = {
  id: 'twitter' as const,
  label: 'X',
  icon: TwitterIcon,
}

export type SelectorTab = PlatformId | 'instagram' | 'twitter'
