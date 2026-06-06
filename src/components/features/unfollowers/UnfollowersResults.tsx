import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  UserSearch,
  PartyPopper,
  AlertCircle,
  ArrowUpRight,
  Copy,
  Check,
  LoaderCircle,
  UserMinus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation, Trans } from 'react-i18next'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { useUnfollow } from '../../../hooks/useUnfollow'
import { usePageSize } from '../../../hooks/usePageSize'
import { login, loginBluesky } from '../../../api/client'
import { PLATFORMS, normalizeHandle } from '../../../platforms'
import type { Account, PlatformId, UnfollowersResponse } from '../../../types/platform'

interface UnfollowersResultsProps {
  platform: PlatformId
  handle: string
  isPending: boolean
  isError: boolean
  /** The localized error message to show in the error state, if any. */
  errorMessage?: string
  data: UnfollowersResponse | undefined
  isAuthed: boolean
  isOwnList: boolean
  onBackToMyList: () => void
}

const SKELETON_COUNT = 9
const ISSUES_URL =
  'https://github.com/Wiazeph/GitHub-Unfollowers-Checker/issues'

const LOADING_KEYS = [
  'results.loading.following',
  'results.loading.followers',
  'results.loading.popular',
  'results.loading.comparing',
  'results.loading.almost',
]

export const UnfollowersResults = ({
  platform,
  handle,
  isPending,
  isError,
  errorMessage,
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
        <ErrorState message={errorMessage} />
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
  const { t } = useTranslation()

  // Local copy so we can drop users as they get unfollowed.
  const [users, setUsers] = useState(initialUnfollowers)
  // Selection is keyed by Account.id (stable across platforms; a DID on Bluesky).
  // The Set spans the whole list, so selections persist across pages.
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingTargets, setPendingTargets] = useState<string[]>([])

  // Pagination — show a bounded number of cards per page (responsive).
  const pageSize = usePageSize()
  const [page, setPage] = useState(0)
  const topRef = useRef<HTMLDivElement>(null)
  // Set when the user clicks prev/next, so we only auto-scroll on real page
  // changes — not on the initial render or a clamp after unfollowing.
  const pageChangedRef = useRef(false)

  // The unfollow API identifies targets differently per platform: GitHub uses
  // the handle (login), Bluesky uses the account id (DID). Map selected ids to
  // the right identifier, and map results back to ids to update the list.
  const targetOf = (account: Account): string =>
    platform === 'bluesky' ? account.id : account.handle

  const idByTarget = useMemo(() => {
    const map = new Map<string, string>()
    for (const u of users) map.set(targetOf(u), u.id)
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, platform])

  const unfollow = useUnfollow((result) => {
    if (result.removed.length > 0) {
      const removedIds = new Set(
        result.removed
          .map((target) => idByTarget.get(target))
          .filter((id): id is string => Boolean(id)),
      )
      setUsers((prev) => prev.filter((u) => !removedIds.has(u.id)))
      setSelected((prev) => {
        const next = new Set(prev)
        for (const id of removedIds) next.delete(id)
        return next
      })
    }
    setConfirmOpen(false)
    setPendingTargets([])
  })

  const count = users.length
  const allSelected = count > 0 && selected.size === count

  const pageCount = Math.max(1, Math.ceil(count / pageSize))
  // Clamp on read so a shrinking list (after unfollows) or a pageSize change
  // never strands us on an out-of-range page — no effect/extra render needed.
  const safePage = Math.min(page, pageCount - 1)
  const pageStart = safePage * pageSize
  const visibleUsers = users.slice(pageStart, pageStart + pageSize)

  // Scroll the list back to the top after the new page has rendered. Doing it
  // in an effect (not inline in the click handler) means it fires on every page
  // change, even when the previous scroll already left us near the top.
  useEffect(() => {
    if (!pageChangedRef.current) return
    pageChangedRef.current = false
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [safePage])

  const goToPage = (next: number) => {
    pageChangedRef.current = true
    setPage(next)
  }

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
    const byId = new Map(users.map((u) => [u.id, u]))
    const targets = ids
      .map((id) => byId.get(id))
      .filter((u): u is Account => Boolean(u))
      .map(targetOf)
    setPendingTargets(targets)
    setConfirmOpen(true)
  }

  const highlight = <span className="font-medium text-fg" />
  const badge = (
    <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 font-medium text-brand-400" />
  )

  return (
    <div ref={topRef} className="flex flex-col gap-4 scroll-mt-4">
      <OnboardingHint show={isOwnList} />

      {/* Context line — stacks on mobile so the copy button never crowds the
          summary text as it reflows; side-by-side from sm up. */}
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="text-sm text-fg-muted">
          {isOwnList ? (
            <Trans
              i18nKey="results.ownSummary"
              count={count}
              components={[highlight]}
            />
          ) : (
            <Trans
              i18nKey="results.otherSummary"
              values={{ handle, label: t('results.countLabel', { count }) }}
              components={[highlight, badge]}
            />
          )}
        </p>
        <CopyButton handles={users.map((u) => u.handle)} />
      </div>

      {/* For genuinely large lists, hint that results may be capped/partial. */}
      {count >= 1000 && (
        <p className="text-xs text-fg-muted">{t('results.largeAccountNote')}</p>
      )}

      {/* Viewing someone else while signed in → unfollow tools don't apply */}
      {isAuthed && !isOwnList && (
        <p className="text-sm text-fg-muted">
          {t('results.onlyOwnAccount')}{' '}
          <button
            onClick={onBackToMyList}
            className="cursor-pointer font-medium text-brand-400 underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            {t('results.backToMyList')}
          </button>
        </p>
      )}

      {/* Guest CTA (platform-aware) */}
      {!isAuthed && <GuestCta platform={platform} handle={handle} />}

      {/* Bulk action bar (own list only). A sticky wrapper pinned to the bottom
          keeps "Unfollow selected" reachable while scrolling. The wrapper has a
          solid page-background so cards scrolling underneath are cleanly masked
          rather than bleeding through. It returns to normal flow — never covering
          the footer — once you reach the end. */}
      {isOwnList && (
        <div className="sticky bottom-0 z-10 order-last -mx-4 bg-bg px-4 py-3 sm:-mx-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2 shadow-lg shadow-black/30">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-fg-muted">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 cursor-pointer accent-brand-500"
              />
              {selected.size > 0
                ? t('results.selectedCount', { count: selected.size })
                : t('results.selectAll')}
            </label>
            <button
              onClick={() => requestUnfollow([...selected])}
              disabled={selected.size === 0 || unfollow.isPending}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white outline-none transition-colors hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserMinus className="h-4 w-4" aria-hidden="true" />
              {t('results.unfollowSelected')}
            </button>
          </div>
        </div>
      )}

      <Grid>
        {visibleUsers.map((user) => (
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

      {pageCount > 1 && (
        <Pagination
          page={safePage}
          pageCount={pageCount}
          onChange={goToPage}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={t('results.confirmTitle')}
        description={t('results.confirmBody', { count: pendingTargets.length })}
        confirmLabel={t('results.confirmLabel')}
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

const Pagination = ({
  page,
  pageCount,
  onChange,
}: {
  page: number
  pageCount: number
  onChange: (page: number) => void
}) => {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        {t('results.prevPage')}
      </button>
      <span className="text-sm text-fg-muted" aria-live="polite">
        {t('results.pageOf', { page: page + 1, total: pageCount })}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount - 1}
        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t('results.nextPage')}
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

const GuestCta = ({
  platform,
  handle,
}: {
  platform: PlatformId
  handle: string
}) => {
  const { t } = useTranslation()
  const config = PLATFORMS[platform]

  // Read-only platform: no sign-in, so just explain it.
  if (config.authKind !== 'oauth') {
    return (
      <div className="rounded-lg border border-border bg-surface px-4 py-3">
        <p className="text-sm text-fg-muted">
          {t('results.readOnly', { platform: config.profileNoun })}
        </p>
      </div>
    )
  }

  // Bluesky's OAuth flow needs the handle up front, so prompt for it.
  if (platform === 'bluesky') {
    return <BlueskySignIn defaultHandle={handle} />
  }

  // GitHub: one-click redirect.
  return <GithubSignIn />
}

const GithubSignIn = () => {
  const { t } = useTranslation()
  const [redirecting, setRedirecting] = useState(false)

  const start = () => {
    setRedirecting(true)
    login()
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-brand-500/30 bg-brand-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="space-y-0.5">
        <p className="text-sm text-fg">{t('results.signInCta')}</p>
        <p className="text-xs text-fg-muted">{t('results.signInNote')}</p>
      </div>
      <button
        onClick={start}
        disabled={redirecting}
        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-bg outline-none transition-colors hover:bg-brand-600 focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {redirecting && (
          <LoaderCircle
            className="h-4 w-4 motion-safe:animate-spin"
            aria-hidden="true"
          />
        )}
        {redirecting
          ? t('results.signingIn')
          : t('results.signInWith', { platform: 'GitHub' })}
      </button>
    </div>
  )
}

const BlueskySignIn = ({ defaultHandle }: { defaultHandle: string }) => {
  const { t } = useTranslation()
  const [handle, setHandle] = useState(defaultHandle)
  const [redirecting, setRedirecting] = useState(false)
  const normalized = normalizeHandle('bluesky', handle)
  const valid = PLATFORMS.bluesky.handlePattern.test(normalized)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (!valid || redirecting) return
        setRedirecting(true)
        loginBluesky(normalized)
      }}
      className="flex flex-col gap-2 rounded-lg border border-brand-500/30 bg-brand-500/10 px-4 py-3"
    >
      <div className="space-y-0.5">
        <p className="text-sm text-fg">{t('results.blueskySignInCta')}</p>
        <p className="text-xs text-fg-muted">{t('results.signInNote')}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          placeholder={t('results.blueskyHandlePlaceholder')}
          aria-label={t('results.blueskyHandleAriaLabel')}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={redirecting}
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-fg placeholder:text-fg-muted outline-none focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-400/40 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!valid || redirecting}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-bg outline-none transition-colors hover:bg-brand-600 focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {redirecting && (
            <LoaderCircle
              className="h-4 w-4 motion-safe:animate-spin"
              aria-hidden="true"
            />
          )}
          {redirecting
            ? t('results.signingIn')
            : t('results.signInWith', { platform: 'Bluesky' })}
        </button>
      </div>
    </form>
  )
}

const ONBOARDING_KEY = 'guc.onboarding.dismissed'

const OnboardingHint = ({ show }: { show: boolean }) => {
  const { t } = useTranslation()
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
      <p>{t('results.onboarding')}</p>
      <button
        onClick={dismiss}
        className="shrink-0 cursor-pointer rounded-md px-2 py-0.5 text-fg-muted outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-brand-400"
        aria-label={t('results.dismiss')}
      >
        ✕
      </button>
    </div>
  )
}

const CopyButton = ({ handles }: { handles: string[] }) => {
  const { t } = useTranslation()
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
      toast.success(t('results.copiedToast'))
    } catch {
      toast.error(t('results.copyFailed'))
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
      {copied ? t('results.copied') : t('results.copyUsernames')}
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
  const { t } = useTranslation()
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
            alt={t('results.avatarAlt', { handle: user.handle })}
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
          alt={t('results.avatarAlt', { handle: user.handle })}
          loading="lazy"
          className="h-10 w-10 rounded-full ring-1 ring-border"
        />
        <Handle handle={user.handle} />

        <a
          href={user.profileUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          aria-label={t('results.openOn', {
            handle: user.handle,
            platform: profileNoun,
          })}
          className="ml-auto shrink-0 rounded-md p-1 text-fg-muted outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </li>
  )
}

const LoadingState = () => {
  const { t } = useTranslation()
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setMessageIndex((index) => Math.min(index + 1, LOADING_KEYS.length - 1))
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
        <span>{t(LOADING_KEYS[messageIndex])}</span>
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
}) => {
  const { t } = useTranslation()
  return (
    <CenteredState
      icon={<UserSearch className="h-6 w-6" aria-hidden="true" />}
      title={t('results.idleTitle')}
      description={
        isAuthed
          ? t('results.idleAuthed')
          : t('results.idleGuest', {
              context: platform,
              platform: PLATFORMS[platform].profileNoun,
            })
      }
    />
  )
}

const ZeroState = () => {
  const { t } = useTranslation()
  return (
    <CenteredState
      tone="brand"
      icon={<PartyPopper className="h-6 w-6" aria-hidden="true" />}
      title={t('results.zeroTitle')}
      description={t('results.zeroBody')}
    />
  )
}

const ErrorState = ({ message }: { message?: string }) => {
  const { t } = useTranslation()
  return (
    <CenteredState
      icon={<AlertCircle className="h-6 w-6" aria-hidden="true" />}
      title={t('results.errorTitle')}
      // Show the specific (localized) reason — rate limit, not found, etc. — so
      // it persists in the page rather than only flashing in a toast.
      description={message || t('results.errorBody')}
      footer={
        <a
          href={`${ISSUES_URL}/new`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-brand-400 underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          {t('results.reportIssue')}
        </a>
      }
    />
  )
}
