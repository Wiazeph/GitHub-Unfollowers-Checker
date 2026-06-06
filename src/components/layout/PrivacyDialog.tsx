import { useEffect } from 'react'
import { X } from 'lucide-react'

const CONTACT_EMAIL = 'emreerden@pm.me'

interface PrivacyDialogProps {
  open: boolean
  onClose: () => void
}

/** Privacy & disclaimer modal. No data is stored; this just documents that. */
export const PrivacyDialog = ({ open, onClose }: PrivacyDialogProps) => {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-card border border-border bg-surface shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="privacy-title" className="text-lg font-semibold text-fg">
            Privacy &amp; disclaimer
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-md p-1 text-fg-muted outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 py-5 text-sm text-fg-muted">
          <section className="space-y-2">
            <h3 className="font-medium text-fg">What this tool does</h3>
            <p>
              Unfollowers Checker helps you find accounts you follow that
              don&apos;t follow you back, across GitHub, Bluesky, X (Twitter),
              and Instagram. It&apos;s a free, personal utility and is not
              affiliated with, endorsed by, or connected to any of those
              platforms.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium text-fg">What we store</h3>
            <p>
              Nothing. We don&apos;t run a database and we don&apos;t keep your
              data. Follower and following lists are fetched, compared, and
              returned for that one request — never logged or saved.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium text-fg">How each platform works</h3>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <span className="font-medium text-fg">GitHub &amp; Bluesky:</span>{' '}
                public follower data is read through their official APIs by our
                serverless functions, so platform credentials never reach your
                browser. If you sign in to unfollow, that happens over the
                platform&apos;s official OAuth and the session is used only to
                carry out the actions you choose — tokens aren&apos;t persisted.
              </li>
              <li>
                <span className="font-medium text-fg">X (Twitter):</span> runs
                entirely in your browser. The files from your data archive are
                read and compared locally and never uploaded anywhere.
              </li>
              <li>
                <span className="font-medium text-fg">Instagram:</span> runs
                entirely in your own browser session via a script you paste
                yourself. Nothing is sent to our servers.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium text-fg">Use at your own risk</h3>
            <p>
              Automated or bulk actions can run against a platform&apos;s terms
              of service and may lead to temporary limits or other account
              actions. The Instagram script in particular is an unofficial,
              third-party tool. You are responsible for how you use these
              features on your own accounts.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium text-fg">Contact</h3>
            <p>
              Questions or reports:{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium text-brand-400 underline-offset-2 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
