import { useState, type FormEvent } from 'react'
import { Search, LoaderCircle, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../ui/Button'

const USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/

interface UnfollowersSearchProps {
  onSearch: (username: string) => void
  isPending: boolean
  isAuthed: boolean
  ownLogin: string
  currentUsername: string
}

export const UnfollowersSearch = ({
  onSearch,
  isPending,
  isAuthed,
  ownLogin,
  currentUsername,
}: UnfollowersSearchProps) => {
  const [username, setUsername] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (isPending) return

    const trimmed = username.trim()
    if (!USERNAME_PATTERN.test(trimmed)) {
      toast.error('Please enter a valid GitHub username')
      return
    }
    onSearch(trimmed)
  }

  const viewingOther =
    isAuthed &&
    currentUsername !== '' &&
    currentUsername.toLowerCase() !== ownLogin.toLowerCase()

  return (
    <div className="flex flex-col gap-2">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-fg-muted"
            aria-hidden="true"
          />
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder={
              isAuthed
                ? 'Look up another user…'
                : 'Enter a GitHub username'
            }
            aria-label="GitHub username"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={isPending}
            className="w-full rounded-lg border border-border bg-surface py-2.5 pr-3 pl-10 text-fg placeholder:text-fg-muted outline-none transition-colors focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-400/40 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <Button type="submit" disabled={isPending} className="sm:w-auto">
          {isPending ? (
            <>
              <LoaderCircle
                className="h-5 w-5 motion-safe:animate-spin"
                aria-hidden="true"
              />
              <span>Checking…</span>
            </>
          ) : (
            'Check'
          )}
        </Button>
      </form>

      {viewingOther && (
        <button
          onClick={() => onSearch(ownLogin)}
          disabled={isPending}
          className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-fg-muted outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-60"
        >
          <UserRound className="h-4 w-4" aria-hidden="true" />
          Back to my list
        </button>
      )}
    </div>
  )
}
