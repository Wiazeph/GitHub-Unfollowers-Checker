import { useEffect, useRef, useState } from 'react'
import {
  Check,
  Copy,
  Hand,
  ShieldAlert,
  Bookmark,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'

/**
 * Instagram has no server-side follower API, so this can't run on our backend.
 * The only viable free + unblocked path is a bookmarklet the user runs in their
 * own browser, on their own Instagram session. We host the script statically and
 * hand the user a loader bookmarklet that injects it.
 */

const SCRIPT_PATH = '/instagram-unfollower.js'

/** Loader bookmarklet: injects the hosted script. Kept short so the href fits. */
const buildBookmarklet = (origin: string): string =>
  `javascript:(function(){var s=document.createElement('script');s.src='${origin}${SCRIPT_PATH}';document.body.appendChild(s);})();`

export const InstagramGuide = () => {
  // Client-only SPA, so window is available at first render.
  const [origin] = useState(() => window.location.origin)
  const [copied, setCopied] = useState(false)
  // React refuses to render `javascript:` hrefs (it replaces them with a
  // security-error throw), which would make the bookmark unusable. Set the
  // attribute directly on the DOM node after mount to keep it draggable.
  const dragRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  const bookmarklet = origin ? buildBookmarklet(origin) : ''

  useEffect(() => {
    if (dragRef.current && bookmarklet) {
      dragRef.current.setAttribute('href', bookmarklet)
    }
  }, [bookmarklet])

  const copyBookmarklet = async () => {
    try {
      await navigator.clipboard.writeText(bookmarklet)
      setCopied(true)
      toast.success('Bookmarklet copied to clipboard')
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Intro */}
      <div className="rounded-lg border border-border bg-surface px-4 py-3">
        <p className="text-sm text-fg">
          Instagram doesn&apos;t offer a public API for follower lists, so this
          one works differently: it&apos;s a small{' '}
          <span className="font-medium">bookmarklet</span> that runs in your own
          browser, on your own Instagram session.
        </p>
        <p className="mt-2 text-sm text-fg-muted">
          Nothing is sent to any server — the script talks only to Instagram,
          directly from your browser. We can&apos;t see your account or your
          data.
        </p>
      </div>

      {/* The bookmarklet */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-fg">
          <Bookmark className="h-4 w-4 text-brand-400" aria-hidden="true" />
          Get the bookmarklet
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Draggable link — browsers block clicking javascript: links but allow
              dragging them to the bookmarks bar. */}
          <a
            ref={dragRef}
            href="#"
            title="Instagram Unfollower"
            onClick={(event) => event.preventDefault()}
            draggable
            className="inline-flex cursor-grab items-center gap-1.5 rounded-lg border border-brand-500/40 bg-brand-500/10 px-3 py-1.5 text-sm font-medium text-brand-400 select-none active:cursor-grabbing"
          >
            <Hand className="h-4 w-4" aria-hidden="true" />
            Instagram Unfollower
          </a>
          <span className="text-xs text-fg-muted">
            ← Drag this to your bookmarks bar (don&apos;t click it)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-fg-muted">No bookmarks bar?</span>
          <button
            onClick={copyBookmarklet}
            disabled={!bookmarklet}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-50 ${
              copied ? 'text-brand-400' : 'text-fg-muted hover:text-fg'
            }`}
          >
            {copied ? (
              <Check className="h-4 w-4 motion-safe:animate-pop" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? 'Copied!' : 'Copy the code instead'}
          </button>
        </div>
      </div>

      {/* Steps */}
      <ol className="flex flex-col gap-3">
        {[
          <>
            Drag the <span className="font-medium text-fg">Instagram Unfollower</span>{' '}
            button above onto your browser&apos;s bookmarks bar (or copy the code
            and create a new bookmark with it as the URL).
          </>,
          <>
            Open{' '}
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 font-medium text-brand-400 underline-offset-2 hover:underline"
            >
              instagram.com <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>{' '}
            and make sure you&apos;re signed in.
          </>,
          <>
            Click the bookmark. A panel appears in the corner — press{' '}
            <span className="font-medium text-fg">Scan</span> to see who
            doesn&apos;t follow you back, then select and unfollow.
          </>,
        ].map((content, index) => (
          <li key={index} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-sm font-semibold text-brand-400">
              {index + 1}
            </span>
            <p className="pt-0.5 text-sm text-fg-muted">{content}</p>
          </li>
        ))}
      </ol>

      {/* Risk / ToS callout */}
      <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <ShieldAlert
          className="h-5 w-5 shrink-0 text-amber-400"
          aria-hidden="true"
        />
        <div className="space-y-1 text-sm">
          <p className="font-medium text-fg">Use at your own discretion</p>
          <p className="text-fg-muted">
            Bulk unfollowing can run against Instagram&apos;s automated-behavior
            policies and may trigger a temporary action block. The tool spaces
            requests out with randomized delays and cooldowns to stay
            human-like, but use is at your own risk. Again: nothing leaves your
            browser.
          </p>
        </div>
      </div>
    </div>
  )
}
