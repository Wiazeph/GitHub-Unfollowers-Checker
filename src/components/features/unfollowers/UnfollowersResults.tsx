import type { ReactNode } from 'react'
import {
  UserSearch,
  PartyPopper,
  AlertCircle,
  ArrowUpRight,
  Copy,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Unfollower, UnfollowersResponse } from '../../../types/github'

interface UnfollowersResultsProps {
  username: string
  isPending: boolean
  isError: boolean
  data: UnfollowersResponse | undefined
}

const SKELETON_COUNT = 9

export const UnfollowersResults = ({
  username,
  isPending,
  isError,
  data,
}: UnfollowersResultsProps) => {
  return (
    <section aria-live="polite" aria-busy={isPending}>
      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : !data ? (
        <IdleState />
      ) : data.unfollowers.length === 0 ? (
        <ZeroState />
      ) : (
        <ResultsState username={username} unfollowers={data.unfollowers} />
      )}
    </section>
  )
}

const Grid = ({ children }: { children: ReactNode }) => (
  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {children}
  </ul>
)

const ResultsState = ({
  username,
  unfollowers,
}: {
  username: string
  unfollowers: Unfollower[]
}) => {
  const count = unfollowers.length
  const label = count === 1 ? '1 user' : `${count} users`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        unfollowers.map((user) => user.login).join('\n'),
      )
      toast.success('Usernames copied to clipboard')
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">
          <span className="font-medium text-fg">@{username}</span> is not
          followed back by{' '}
          <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 font-medium text-brand-400">
            {label}
          </span>
        </p>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-fg-muted outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
          Copy usernames
        </button>
      </div>

      <Grid>
        {unfollowers.map((user) => (
          <UnfollowerCard key={user.id} user={user} />
        ))}
      </Grid>
    </div>
  )
}

const UnfollowerCard = ({ user }: { user: Unfollower }) => (
  <li>
    <a
      href={user.html_url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-3 rounded-card border border-border bg-surface px-3 py-2.5 outline-none transition-colors hover:border-brand-500/40 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      <img
        src={user.avatar_url}
        alt={`${user.login} avatar`}
        loading="lazy"
        className="h-10 w-10 rounded-full ring-1 ring-border"
      />
      <span className="truncate text-sm font-medium">{user.login}</span>
      <ArrowUpRight
        className="ml-auto h-4 w-4 shrink-0 text-fg-muted opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
    </a>
  </li>
)

const LoadingState = () => (
  <Grid>
    {Array.from({ length: SKELETON_COUNT }, (_, index) => (
      <li
        key={index}
        className="flex items-center gap-3 rounded-card border border-border bg-surface px-3 py-2.5"
      >
        <div className="h-10 w-10 rounded-full bg-surface-hover motion-safe:animate-pulse" />
        <div className="h-3.5 w-24 rounded bg-surface-hover motion-safe:animate-pulse" />
      </li>
    ))}
  </Grid>
)

const CenteredState = ({
  icon,
  title,
  description,
  tone = 'muted',
}: {
  icon: ReactNode
  title: string
  description: string
  tone?: 'muted' | 'brand'
}) => (
  <div className="flex flex-col items-center gap-4 py-12 text-center">
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-full ${
        tone === 'brand'
          ? 'bg-brand-500/15 text-brand-400'
          : 'bg-surface text-fg-muted'
      }`}
    >
      {icon}
    </div>
    <div className="space-y-1">
      <p className="font-medium text-fg">{title}</p>
      <p className="max-w-sm text-sm text-fg-muted">{description}</p>
    </div>
  </div>
)

const IdleState = () => (
  <CenteredState
    icon={<UserSearch className="h-6 w-6" aria-hidden="true" />}
    title="Ready when you are"
    description="Enter a GitHub username above to see who doesn't follow them back."
  />
)

const ZeroState = () => (
  <CenteredState
    tone="brand"
    icon={<PartyPopper className="h-6 w-6" aria-hidden="true" />}
    title="Everyone follows back!"
    description="There's no one here that isn't following back. Nice and tidy."
  />
)

const ErrorState = () => (
  <CenteredState
    icon={<AlertCircle className="h-6 w-6" aria-hidden="true" />}
    title="Something went wrong"
    description="We couldn't complete that check. See the notification for details and try again."
  />
)
