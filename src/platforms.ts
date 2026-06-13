import {
  GithubIcon,
  BlueskyIcon,
  GitlabIcon,
  InstagramIcon,
  TwitterIcon,
  type BrandIcon,
} from './components/ui/BrandIcons'
import type { PlatformId } from './types/platform'

/** How a platform's sign-in works, drives which CTA the UI shows. */
type AuthKind = 'oauth' | 'none'

export interface PlatformConfig {
  id: PlatformId
  /** Proper noun — the same in every language. */
  label: string
  icon: BrandIcon
  /** Validates a handle before we bother hitting the API. */
  handlePattern: RegExp
  /** i18n keys for the input placeholder (resolved in the component). */
  placeholderKey: string
  placeholderAuthedKey: string
  /** i18n key for the invalid-handle toast. */
  validationKey: string
  /** 'oauth' → show a sign-in button; 'none' → read-only (no unfollow yet). */
  authKind: AuthKind
  /** Noun used in "Open on {noun}" links — a proper noun, not translated. */
  profileNoun: string
}

/** GitHub usernames: 1–39 chars, alphanumeric or single hyphens (not leading/trailing). */
const GITHUB_HANDLE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/
/** Bluesky handles are domain-style: at least one dot, e.g. name.bsky.social. */
const BLUESKY_HANDLE = /^(?!-)[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/
/** GitLab usernames: alphanumeric plus _ . - (we only ever show our own, so this is lenient). */
const GITLAB_HANDLE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,254}$/

export const PLATFORMS: Record<PlatformId, PlatformConfig> = {
  github: {
    id: 'github',
    label: 'GitHub',
    icon: GithubIcon,
    handlePattern: GITHUB_HANDLE,
    placeholderKey: 'search.placeholderGithub',
    placeholderAuthedKey: 'search.placeholderGithubAuthed',
    validationKey: 'search.invalidGithub',
    authKind: 'oauth',
    profileNoun: 'GitHub',
  },
  bluesky: {
    id: 'bluesky',
    label: 'Bluesky',
    icon: BlueskyIcon,
    handlePattern: BLUESKY_HANDLE,
    placeholderKey: 'search.placeholderBluesky',
    placeholderAuthedKey: 'search.placeholderBlueskyAuthed',
    validationKey: 'search.invalidBluesky',
    authKind: 'oauth',
    profileNoun: 'Bluesky',
  },
  gitlab: {
    id: 'gitlab',
    label: 'GitLab',
    icon: GitlabIcon,
    handlePattern: GITLAB_HANDLE,
    // GitLab is sign-in-only (its follow lists aren't public), so the search
    // box is never shown for guests — these placeholders are only the authed one.
    placeholderKey: 'search.placeholderGitlabAuthed',
    placeholderAuthedKey: 'search.placeholderGitlabAuthed',
    validationKey: 'search.invalidGitlab',
    authKind: 'oauth',
    profileNoun: 'GitLab',
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
  PLATFORMS.gitlab,
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
