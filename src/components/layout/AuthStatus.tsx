import { LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { login, logout } from '../../api/client'

/** Top-right sign-in indicator: "@login · Sign out" when authenticated. */
export const AuthStatus = () => {
  const { data: auth, isLoading } = useAuth()

  if (isLoading) return null

  if (!auth?.authenticated) {
    return (
      <button
        onClick={login}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        Sign in with GitHub
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-medium text-fg">@{auth.handle}</span>
      <span aria-hidden="true" className="text-border">
        ·
      </span>
      <button
        onClick={() => void logout()}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-fg-muted outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sign out
      </button>
    </div>
  )
}
