import { useState } from 'react'
import { Globe, ShieldCheck, Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PrivacyDialog } from './PrivacyDialog'

const REPO_URL = 'https://github.com/Wiazeph/GitHub-Unfollowers-Checker'
const SITE_URL = 'https://emreerden.dev'
const SPONSOR_URL = 'https://github.com/sponsors/Wiazeph'

/** Lucide 1.x dropped the GitHub brand mark, so the logo stays as inline SVG. */
const GithubIcon = () => (
  <svg
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 496 512"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z" />
  </svg>
)

export const Footer = () => {
  const { t } = useTranslation()
  const [privacyOpen, setPrivacyOpen] = useState(false)

  return (
    <footer className="mx-auto flex w-full max-w-3xl flex-col items-center gap-2 px-4 py-8 text-sm text-fg-muted sm:px-6">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md px-2 py-1 outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <GithubIcon />
          <span>{t('footer.viewSource')}</span>
        </a>

        <span aria-hidden="true" className="text-border">
          •
        </span>

        <button
          onClick={() => setPrivacyOpen(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span>{t('footer.privacy')}</span>
        </button>

        <span aria-hidden="true" className="text-border">
          •
        </span>

        {/* Sponsor is the one link we want to stand out — a brand-colored badge,
            while the others stay muted so the emphasis lands in a single place. */}
        <a
          href={SPONSOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 font-medium text-brand-400 outline-none transition-colors hover:bg-brand-500/20 hover:text-brand-300 focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
          <span>{t('footer.sponsor')}</span>
        </a>

        <span aria-hidden="true" className="text-border">
          •
        </span>

        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md px-2 py-1 outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          <span>emreerden.dev</span>
        </a>
      </div>

      <p className="max-w-md text-center text-xs text-fg-muted/80">
        {t('footer.disclaimer')}
      </p>

      <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </footer>
  )
}
