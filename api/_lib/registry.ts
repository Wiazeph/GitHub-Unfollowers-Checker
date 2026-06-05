/** Provider registry — maps a platform id to its implementation. */

import { githubProvider } from './github.js'
import { blueskyProvider } from './bluesky.js'
import type { PlatformId, Provider } from './provider.js'

const providers: Partial<Record<PlatformId, Provider>> = {
  github: githubProvider,
  bluesky: blueskyProvider,
}

export const getProvider = (id: string): Provider | null =>
  providers[id as PlatformId] ?? null
