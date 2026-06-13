import { useSyncExternalStore } from 'react'

/**
 * Tiny shared "an OAuth redirect is in flight" flag. When the user clicks any
 * sign-in button (header or the in-page gate), every sign-in control for that
 * flow should show its loading state — not just the one that was clicked. A
 * module-level store keeps that in sync across the separate components without
 * threading a context through everything.
 *
 * `window.location.href` navigates away immediately after, so this only needs
 * to survive the brief moment before the page unloads.
 */
let signingIn = false
const listeners = new Set<() => void>()

const subscribe = (cb: () => void): (() => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export const beginSignIn = (): void => {
  if (signingIn) return
  signingIn = true
  listeners.forEach((cb) => cb())
}

/** True while an OAuth sign-in redirect is being started. */
export const useSigningIn = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => signingIn,
    () => false,
  )
