import { createContext, useContext } from 'react'
import type { SelectorTab } from '../platforms'

interface ActiveTabValue {
  tab: SelectorTab
  setTab: (tab: SelectorTab) => void
}

/** Shares the active platform tab between the header (AuthStatus) and the
 *  main Unfollowers view, so the header can reflect the active platform. */
export const ActiveTabContext = createContext<ActiveTabValue | null>(null)

export const useActiveTab = (): ActiveTabValue => {
  const ctx = useContext(ActiveTabContext)
  if (!ctx) throw new Error('useActiveTab must be used within ActiveTabProvider')
  return ctx
}
