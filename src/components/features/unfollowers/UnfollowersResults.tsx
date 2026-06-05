import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  UserSearch,
  PartyPopper,
  AlertCircle,
  ArrowUpRight,
  Copy,
  Check,
  LoaderCircle,
  UserMinus,
} from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { useUnfollow } from '../../../hooks/useUnfollow'
import { login } from '../../../api/client'
import { PLATFORMS } from '../../../platforms'
import type { Account, PlatformId, UnfollowersResponse } from '../../../types/platform'

interface UnfollowersResultsProps {
  platform: PlatformId
  handle: string
  isPending: boolean
  isError: boolean
  data: UnfollowersResponse | undefined
  isAuthed: boolean
  isOwnList: boolean
  onBackToMyList: () => void
}

const SKELETON_COUNT = 9
const ISSUES_URL =
  'https://github.com/Wiazeph/GitHub-Unfollowers-Checker/issues'

const LOADING_MESSAGES = [
  'Fetching the following list…',
  'Gathering followers…',
  'This can take a moment for popular accounts…',
  'Comparing who follows back…',
  'Almost there…',
]

export const UnfollowersResults = ({
  platform,
  handle,
  isPending,
  isError,
  data,
  isAuthed,
  isOwnList,
  onBackToMyList,
}: UnfollowersResultsProps) => {
  return (
    <section aria-live="polite" aria-busy={isPending}>
      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : !data ? (
        <IdleState platform={platform} isAuthed={isAuthed} />
      ) : data.unfollowers.length === 0 ? (
        <ZeroState />
      ) : (
        <ResultsState
          key={`${platform}:${handle}`}
          platform={platform}
          handle={handle}
          initialUnfollowers={data.unfollowers}
          isAuthed={isAuthed}
          isOwnList={isOwnList}
          onBackToMyList={onBackToMyList}
        />
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
  platform,
  handle,
  initialUnfollowers,
  isAuthed,
  isOwnList,
  onBackToMyList,
}: {
  platform: PlatformId
  handle: string
  initialUnfollowers: Account[]
  isAuthed: boolean
  isOwnList: boolean
  onBackToMyList: () => void
}) => {
  // Local copy so we can drop users as they get unfollowed.
  const [users, setUsers] = useState(initialUnfollowers)
  // Selection is keyed by Account.id (stable across platforms; a DID on Bluesky).
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingTargets, setPendingTargets] = useState<string[]>([])

  // Map id → handle, since the unfollow API takes handles (GitHub) today.
  const handleById = useMemo(() => {
    const map = new Map<string, string>()
    for (const u of users) map.set(u.id, u.handle)
    return map
  }, [users])

  const unfollow = useUnfollow((result) => {
    if (result.removed.length > 0) {
      const removedHandles = new Set(result.removed)
      setUsers((prev) => prev.filter((u) => !removedHandles.has(u.handle)))
      setSelected((prev) => {
        const next = new Set(prev)
        for (const u of users) {
          if (removedHandles.has(u.handle)) next.delete(u.id)
        }
        return next
      })
    }
    setConfirmOpen(false)
    setPendingTargets([])
  })

  const count = users.length
  const label = count === 1 ? '1 user' : `${count} users`
  const allSelected = count > 0 && selected.size === count

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(users.map((u) => u.id)))
  }

  const requestUnfollow = (ids: string[]) => {
    const targets = ids
      .map((id) => handleById.get(id))
      .filter((h): h is string => Boolean(h))
    setPendingTargets(targets)
    setConfirmOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <OnboardingHint show={isOwnList} />

      {/* Context line */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">
          {isOwnList ? (
            <>
              <span className="font-medium text-fg">{label}</span> don&apos;t
              follow you back — select to remove.
            </>
          ) : (
            <>
              <span className="font-medium text-fg">@{handle}</span> is not
              followed back by{' '}
              <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 font-medium text-brand-400">
                {label}
              </span>
            </>
          )}
        </p>
        <CopyButton handles={users.map((u) => u.handle)} />
      </div>

      {/* Viewing someone else while signed in → unfollow tools don't apply */}
      {isAuthed && !isOwnList && (
        <p className="text-sm text-fg-muted">
          You can only remove people from your own account.{' '}
          <button
            onClick={onBackToMyList}
            className="cursor-pointer font-medium text-brand-400 underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            Back to my list
          </button>
        </p>
      )}

      {/* Guest CTA (platform-aware) */}
      {!isAuthed && <GuestCta platform={platform} />}

      {/* Bulk action bar (own list only) */}
      {isOwnList && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-fg-muted">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="h-4 w-4 cursor-pointer accent-brand-500"
            />
            {selected.size > 0 ? `${selected.size} selected` : 'Select all'}
          </label>
          <button
            onClick={() => requestUnfollow([...selected])}
            disabled={selected.size === 0 || unfollow.isPending}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white outline-none transition-colors hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserMinus className="h-4 w-4" aria-hidden="true" />
            Unfollow selected
          </button>
        </div>
      )}

      <Grid>
        {users.map((user) => (
          <UnfollowerCard
            key={user.id}
            user={user}
            platform={platform}
            selectable={isOwnList}
            selected={selected.has(user.id)}
            onToggle={() => toggle(user.id)}
          />
        ))}
      </Grid>

      <ConfirmDialog
        open={confirmOpen}
        title="Unfollow users?"
        description={`You're about to unfollow ${pendingTargets.length} ${
          pendingTargets.length === 1 ? 'user' : 'users'
        }. This can't be undone here.`}
        confirmLabel="Unfollow"
        isPending={unfollow.isPending}
        onConfirm={() => unfollow.mutate({ platform, targets: pendingTargets })}
        onCancel={() => {
          if (unfollow.isPending) return
          setConfirmOpen(false)
          setPendingTargets([])
        }}
      />
    </div>
  )
}

const GuestCta = ({ platform }: { platform: PlatformId }) => {
  const config = PLATFORMS[platform]

  // Read-only platform: no sign-in yet, so just explain it.
  if (config.authKind !== 'oauth') {
    return (
      <div className="rounded-lg border border-border bg-surface px-4 py-3">
        <p className="text-sm text-fg-muted">
          Removing people on {config.profileNoun} isn&apos;t available yet —
          this is a read-only view for now.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-500/30 bg-brand-500/10 px-4 py-3">
      <p className="text-sm text-fg">
        Sign in to remove the people who don&apos;t follow you back.
      </p>
      <button
        onClick={login}
        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-bg outline-none transition-colors hover:bg-brand-600 focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        Sign in with {config.profileNoun}
      </button>
    </div>
  )
}

const ONBOARDING_KEY = 'guc.onboarding.dismissed'

const OnboardingHint = ({ show }: { show: boolean }) => {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === '1',
  )

  if (!show || dismissed) return null

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-fg-muted">
      <p>
        You&apos;re signed in. Select the cards you want, then use
        &ldquo;Unfollow selected&rdquo;. Unfollowing only affects your own
        account.
      </p>
      <button
        onClick={dismiss}
        className="shrink-0 cursor-pointer rounded-md px-2 py-0.5 text-fg-muted outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-brand-400"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}

const CopyButton = ({ handles }: { handles: string[] }) => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(handles.join('\n'))
      setCopied(true)
      toast.success('Usernames copied to clipboard')
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-400 ${
        copied ? 'text-brand-400' : 'text-fg-muted hover:text-fg'
      }`}
    >
      {copied ? (
        <Check className="h-4 w-4 motion-safe:animate-pop" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
      {copied ? 'Copied!' : 'Copy usernames'}
    </button>
  )
}

/** Truncated handle with a CSS tooltip showing the full handle on hover. */
const Handle = ({ handle }: { handle: string }) => (
  <span className="group/name relative min-w-0 flex-1">
    <span className="block truncate text-sm font-medium">{handle}</span>
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-0 z-10 mb-1 hidden w-max max-w-[16rem] rounded-md border border-border bg-bg px-2 py-1 text-xs font-medium text-fg shadow-lg group-hover/name:block"
    >
      {handle}
    </span>
  </span>
)

const UnfollowerCard = ({
  user,
  platform,
  selectable,
  selected,
  onToggle,
}: {
  user: Account
  platform: PlatformId
  selectable: boolean
  selected: boolean
  onToggle: () => void
}) => {
  const profileNoun = PLATFORMS[platform].profileNoun

  // Guest / viewing someone else: the whole card is a profile link (unchanged).
  if (!selectable) {
    return (
      <li>
        <a
          href={user.profileUrl}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-3 rounded-card border border-border bg-surface px-3 py-2.5 outline-none transition-colors hover:border-brand-500/40 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <img
            src={user.avatarUrl}
            alt={`${user.handle} avatar`}
            loading="lazy"
            className="h-10 w-10 rounded-full ring-1 ring-border"
          />
          <Handle handle={user.handle} />
          <ArrowUpRight
            className="ml-auto h-4 w-4 shrink-0 text-fg-muted opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </a>
      </li>
    )
  }

  // Signed in on own list: card body toggles selection; profile + unfollow are separate.
  return (
    <li>
      <div
        role="checkbox"
        aria-checked={selected}
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onToggle()
          }
        }}
        className={`flex cursor-pointer items-center gap-3 rounded-card border px-3 py-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-400 ${
          selected
            ? 'border-brand-500 bg-surface-hover'
            : 'border-border bg-surface hover:bg-surface-hover'
        }`}
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
            selected
              ? 'border-brand-500 bg-brand-500 text-bg'
              : 'border-border bg-bg'
          }`}
          aria-hidden="true"
        >
          {selected && <Check className="h-3.5 w-3.5" />}
        </span>
        <img
          src={user.avatarUrl}
          alt={`${user.handle} avatar`}
          loading="lazy"
          className="h-10 w-10 rounded-full ring-1 ring-border"
        />
        <Handle handle={user.handle} />

        <a
          href={user.profileUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          aria-label={`Open ${user.handle} on ${profileNoun}`}
          className="ml-auto shrink-0 rounded-md p-1 text-fg-muted outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </li>
  )
}

const LoadingState = () => {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setMessageIndex((index) =>
        Math.min(index + 1, LOADING_MESSAGES.length - 1),
      )
    }, 2500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-2 text-sm text-fg-muted">
        <LoaderCircle
          className="h-4 w-4 motion-safe:animate-spin"
          aria-hidden="true"
        />
        <span>{LOADING_MESSAGES[messageIndex]}</span>
      </div>
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
    </div>
  )
}

const CenteredState = ({
  icon,
  title,
  description,
  tone = 'muted',
  footer,
}: {
  icon: ReactNode
  title: string
  description: string
  tone?: 'muted' | 'brand'
  footer?: ReactNode
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
    {footer}
  </div>
)

const IdleState = ({
  platform,
  isAuthed,
}: {
  platform: PlatformId
  isAuthed: boolean
}) => (
  <CenteredState
    icon={<UserSearch className="h-6 w-6" aria-hidden="true" />}
    title="Ready when you are"
    description={
      isAuthed
        ? 'Loading your list… or search for another user above.'
        : `Enter a ${PLATFORMS[platform].profileNoun} handle above to see who doesn't follow them back.`
    }
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
    footer={
      <a
        href={`${ISSUES_URL}/new`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-brand-400 underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        Keeps happening? Report an issue
      </a>
    }
  />
)
