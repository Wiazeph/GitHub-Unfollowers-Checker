import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Upload,
  ArrowUpRight,
  Copy,
  Check,
  PartyPopper,
  ShieldCheck,
  FileDown,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation, Trans } from 'react-i18next'
import {
  classifyArchiveFile,
  computeArchiveUnfollowers,
} from '../../../lib/twitterArchive'
import { usePageSize } from '../../../hooks/usePageSize'
import type { Account } from '../../../types/platform'

/**
 * X (Twitter) has no free follower API, so this works offline: the user uploads
 * the follower.js / following.js files from their official X data archive and we
 * diff them entirely in the browser. Nothing is uploaded to any server.
 */

const ARCHIVE_HELP =
  'https://help.x.com/en/managing-your-account/how-to-download-your-x-archive'

const bold = <span className="font-medium text-fg" />

export const TwitterArchiveGuide = () => {
  const { t } = useTranslation()
  const [result, setResult] = useState<Account[] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    setBusy(true)
    setError('')

    const followingTexts: string[] = []
    const followerTexts: string[] = []
    const skipped: string[] = []

    try {
      for (const file of Array.from(fileList)) {
        const kind = classifyArchiveFile(file.name)
        if (!kind) {
          skipped.push(file.name)
          continue
        }
        const text = await file.text()
        if (kind === 'following') followingTexts.push(text)
        else followerTexts.push(text)
      }

      if (followingTexts.length === 0 || followerTexts.length === 0) {
        setBusy(false)
        setError(t('twitter.bothFilesError'))
        return
      }

      const unfollowers = computeArchiveUnfollowers(followingTexts, followerTexts)
      setResult(unfollowers)
      if (skipped.length > 0) {
        toast.message(t('twitter.ignoredFiles', { count: skipped.length }))
      }
    } catch {
      setError(t('twitter.readError'))
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError('')
  }

  return (
    <div className="flex flex-col gap-6">
      {result === null ? (
        <UploadView busy={busy} error={error} onFiles={handleFiles} />
      ) : (
        <ResultsView accounts={result} onReset={reset} />
      )}
    </div>
  )
}

const UploadView = ({
  busy,
  error,
  onFiles,
}: {
  busy: boolean
  error: string
  onFiles: (files: FileList | null) => void
}) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const steps = [
    <>
      {t('twitter.step1_pre')}{' '}
      <span className="font-medium text-fg">{t('twitter.step1_path')}</span>
      {t('twitter.step1_post')}{' '}
      <a
        href={ARCHIVE_HELP}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-0.5 font-medium text-brand-400 underline-offset-2 hover:underline"
      >
        {t('twitter.step1_guide')}{' '}
        <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
      </a>
    </>,
    <>{t('twitter.step2')}</>,
    <>
      {t('twitter.step3_pre')}{' '}
      <span className="font-medium text-fg">{t('twitter.step3_dataWord')}</span>{' '}
      {t('twitter.step3_mid')}{' '}
      <span className="font-medium text-fg">following.js</span>{' '}
      {t('twitter.step3_and')}{' '}
      <span className="font-medium text-fg">follower.js</span>{' '}
      {t('twitter.step3_ifSplit')}{' '}
      <span className="font-medium text-fg">{t('twitter.step3_part')}</span>{' '}
      {t('twitter.step3_post')}
    </>,
  ]

  return (
    <>
      {/* Intro */}
      <div className="rounded-lg border border-border bg-surface px-4 py-3">
        <p className="text-sm text-fg">{t('twitter.introBody')}</p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-fg-muted">
          <ShieldCheck className="h-4 w-4 text-brand-400" aria-hidden="true" />
          {t('twitter.introPrivacy')}
        </p>
      </div>

      {/* Steps */}
      <ol className="flex flex-col gap-3">
        {steps.map((content, index) => (
          <li key={index} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-sm font-semibold text-brand-400">
              {index + 1}
            </span>
            <p className="pt-0.5 text-sm text-fg-muted">{content}</p>
          </li>
        ))}
      </ol>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          onFiles(e.dataTransfer.files)
        }}
        className={`flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-8 text-center transition-colors ${
          dragOver
            ? 'border-brand-500 bg-brand-500/10'
            : 'border-border bg-surface'
        }`}
      >
        <FileDown className="h-7 w-7 text-fg-muted" aria-hidden="true" />
        <p className="text-sm text-fg-muted">
          {t('twitter.dropzone_pre')}{' '}
          <span className="font-medium text-fg">following.js</span>{' '}
          {t('twitter.dropzone_and')}{' '}
          <span className="font-medium text-fg">follower.js</span>{' '}
          {t('twitter.dropzone_post')}
        </p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-bg outline-none transition-colors hover:bg-brand-600 focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {busy ? t('twitter.reading') : t('twitter.chooseFiles')}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".js,application/javascript,text/javascript"
          multiple
          onChange={(e) => onFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </>
  )
}

const ResultsView = ({
  accounts,
  onReset,
}: {
  accounts: Account[]
  onReset: () => void
}) => {
  const { t } = useTranslation()
  const count = accounts.length

  // Pagination — show a bounded number of cards per page (responsive), matching
  // the GitHub/Bluesky results. Keeps very large lists (1000s of ids) light.
  const pageSize = usePageSize()
  const [page, setPage] = useState(0)
  const topRef = useRef<HTMLDivElement>(null)
  const pageChangedRef = useRef(false)

  const pageCount = Math.max(1, Math.ceil(count / pageSize))
  const safePage = Math.min(page, pageCount - 1)
  const pageStart = safePage * pageSize
  const visible = accounts.slice(pageStart, pageStart + pageSize)

  // Scroll back to the top after a page change has rendered (only on real
  // prev/next clicks, not the initial render).
  useEffect(() => {
    if (!pageChangedRef.current) return
    pageChangedRef.current = false
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [safePage])

  const goToPage = (next: number) => {
    pageChangedRef.current = true
    setPage(next)
  }

  if (count === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/15 text-brand-400">
          <PartyPopper className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-fg">{t('twitter.zeroTitle')}</p>
          <p className="max-w-sm text-sm text-fg-muted">{t('twitter.zeroBody')}</p>
        </div>
        <BackButton onReset={onReset} />
      </div>
    )
  }

  return (
    <div ref={topRef} className="flex flex-col gap-4 scroll-mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">
          <Trans i18nKey="twitter.resultSummary" count={count} components={[bold]} />
        </p>
        <div className="flex items-center gap-2">
          <CopyButton accounts={accounts} />
          <BackButton onReset={onReset} />
        </div>
      </div>

      <div className="space-y-1.5 rounded-lg border border-border bg-surface px-4 py-2.5 text-xs text-fg-muted">
        <p>{t('twitter.viewOnlyNote')}</p>
        <p>{t('twitter.idLimitNote')}</p>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((account) => (
          <li key={account.id}>
            <a
              href={account.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-card border border-border bg-surface px-3 py-2.5 outline-none transition-colors hover:border-brand-500/40 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-hover text-fg-muted ring-1 ring-border"
                aria-hidden="true"
              >
                <User className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {t('twitter.idLabel', { id: account.id })}
                </span>
                <span className="block text-xs text-fg-muted">
                  {t('twitter.openProfile')}
                </span>
              </span>
              <ArrowUpRight
                className="ml-auto h-4 w-4 shrink-0 text-fg-muted opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </a>
          </li>
        ))}
      </ul>

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 0}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {t('results.prevPage')}
          </button>
          <span className="text-sm text-fg-muted" aria-live="polite">
            {t('results.pageOf', { page: safePage + 1, total: pageCount })}
          </span>
          <button
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage >= pageCount - 1}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('results.nextPage')}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}

const BackButton = ({ onReset }: { onReset: () => void }) => {
  const { t } = useTranslation()
  return (
    <button
      onClick={onReset}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      {t('twitter.startOver')}
    </button>
  )
}

const CopyButton = ({ accounts }: { accounts: Account[] }) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const links = useMemo(
    () => accounts.map((a) => a.profileUrl).join('\n'),
    [accounts],
  )

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(links)
      setCopied(true)
      toast.success(t('twitter.copiedToast'))
    } catch {
      toast.error(t('twitter.copyFailed'))
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
      {copied ? t('twitter.copied') : t('twitter.copyLinks')}
    </button>
  )
}
