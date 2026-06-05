import { type FormEvent } from 'react'
import { Search, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../ui/Button'

const USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/

interface UnfollowersSearchProps {
  value: string
  onChange: (value: string) => void
  onSearch: (username: string) => void
  isPending: boolean
  isAuthed: boolean
}

export const UnfollowersSearch = ({
  value,
  onChange,
  onSearch,
  isPending,
  isAuthed,
}: UnfollowersSearchProps) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (isPending) return

    const trimmed = value.trim()
    if (!USERNAME_PATTERN.test(trimmed)) {
      toast.error('Please enter a valid GitHub username')
      return
    }
    onSearch(trimmed)
  }

  return (
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
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={
            isAuthed ? 'Look up another user…' : 'Enter a GitHub username'
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
  )
}
