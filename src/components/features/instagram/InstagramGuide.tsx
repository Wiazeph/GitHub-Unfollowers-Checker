import { useEffect, useState } from 'react'
import {
  Check,
  Copy,
  ShieldAlert,
  ExternalLink,
  LoaderCircle,
  Terminal,
} from 'lucide-react'
import { toast } from 'sonner'

/**
 * Instagram has no server-side follower API, so this can't run on our backend.
 * The reliable path is a small script the user copies and pastes into their own
 * browser console while on instagram.com — it runs in their own session and
 * never sends data anywhere. (A loader bookmarklet won't work: Instagram's
 * Content-Security-Policy blocks loading an external script onto its pages, so
 * the whole script must be pasted directly.)
 */

const SCRIPT_PATH = '/instagram-unfollower.js'

export const InstagramGuide = () => {
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Fetch our own script text (same-origin) so the Copy button hands over the
  // full code to paste — no external load, so Instagram's CSP is never involved.
  useEffect(() => {
    let active = true
    fetch(SCRIPT_PATH)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error())))
      .then((text) => active && setCode(text))
      .catch(() => active && setCode(''))
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  const copyCode = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Code copied — now paste it into the console')
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
          one works differently: you copy a small script and paste it into your
          browser&apos;s console while on Instagram. It runs in your own session.
        </p>
        <p className="mt-2 text-sm text-fg-muted">
          Nothing is sent to any server — the script talks only to Instagram,
          directly from your browser. We can&apos;t see your account or your
          data.
        </p>
      </div>

      {/* The script + copy button */}
      <div className="overflow-hidden rounded-lg border border-border bg-bg">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-3 py-2">
          <span className="inline-flex items-center gap-2 font-mono text-xs text-fg-muted">
            <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
            Paste into the DevTools console
          </span>
          <button
            onClick={copyCode}
            disabled={!code}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-brand-500 px-3 py-1.5 text-sm font-medium text-bg outline-none transition-colors hover:bg-brand-600 focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {code === null ? (
              <>
                <LoaderCircle
                  className="h-4 w-4 motion-safe:animate-spin"
                  aria-hidden="true"
                />
                Loading…
              </>
            ) : copied ? (
              <>
                <Check
                  className="h-4 w-4 motion-safe:animate-pop"
                  aria-hidden="true"
                />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                Copy the code
              </>
            )}
          </button>
        </div>
        <pre className="max-h-56 overflow-auto px-3 py-3 text-xs leading-relaxed text-fg-muted">
          <code className="font-mono break-all whitespace-pre-wrap">
            {code === null ? 'Loading the script…' : code}
          </code>
        </pre>
      </div>
      <p className="-mt-2 text-xs text-fg-muted">
        A one-time script you paste yourself — it isn&apos;t installed and
        changes nothing until you run it.
      </p>

      {/* Steps */}
      <ol className="flex flex-col gap-3">
        {[
          <>Copy the script using the button above.</>,
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
            in this browser and make sure you&apos;re signed in.
          </>,
          <>
            Open the developer console, then click the{' '}
            <span className="font-medium text-fg">Console</span> tab:
            <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
              <span>
                <span className="font-medium text-fg">Windows / Linux:</span>{' '}
                <kbd className="rounded bg-surface px-1 font-mono">F12</kbd> or{' '}
                <kbd className="rounded bg-surface px-1 font-mono">
                  Ctrl+Shift+J
                </kbd>
              </span>
              <span>
                <span className="font-medium text-fg">Mac:</span>{' '}
                <kbd className="rounded bg-surface px-1 font-mono">
                  Cmd+Option+J
                </kbd>
              </span>
            </span>
          </>,
          <>
            Paste the script and press{' '}
            <span className="font-medium text-fg">Enter</span>. A panel appears in
            the corner — press <span className="font-medium text-fg">Scan</span>{' '}
            to see who doesn&apos;t follow you back, then select and unfollow.
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

      {/* Console-paste safety note */}
      <p className="text-xs text-fg-muted">
        Tip: browsers may warn before letting you paste into the console — that
        warning exists because pasting code you don&apos;t understand can be
        dangerous. This script only reads your following list and unfollows what
        you pick. You can read it any time at{' '}
        <a
          href={SCRIPT_PATH}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-brand-400 underline-offset-2 hover:underline"
        >
          {SCRIPT_PATH}
        </a>
        .
      </p>

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
            requests out with randomized delays and cooldowns to stay human-like,
            but use is at your own risk. Again: nothing leaves your browser.
          </p>
        </div>
      </div>
    </div>
  )
}
