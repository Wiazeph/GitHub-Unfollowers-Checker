import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const CONTACT_EMAIL = 'emreerden@pm.me'

interface PrivacyDialogProps {
  open: boolean
  onClose: () => void
}

/** Privacy & disclaimer modal. No data is stored; this just documents that. */
export const PrivacyDialog = ({ open, onClose }: PrivacyDialogProps) => {
  const { t } = useTranslation()

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
            {t('privacy.title')}
          </h2>
          <button
            onClick={onClose}
            aria-label={t('privacy.close')}
            className="cursor-pointer rounded-md p-1 text-fg-muted outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 py-5 text-sm text-fg-muted">
          <section className="space-y-2">
            <h3 className="font-medium text-fg">{t('privacy.whatTitle')}</h3>
            <p>{t('privacy.whatBody')}</p>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium text-fg">{t('privacy.storeTitle')}</h3>
            <p>{t('privacy.storeBody')}</p>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium text-fg">{t('privacy.howTitle')}</h3>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <span className="font-medium text-fg">
                  {t('privacy.howGithubLabel')}
                </span>{' '}
                {t('privacy.howGithubBody')}
              </li>
              <li>
                <span className="font-medium text-fg">
                  {t('privacy.howXLabel')}
                </span>{' '}
                {t('privacy.howXBody')}
              </li>
              <li>
                <span className="font-medium text-fg">
                  {t('privacy.howInstagramLabel')}
                </span>{' '}
                {t('privacy.howInstagramBody')}
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium text-fg">{t('privacy.riskTitle')}</h3>
            <p>{t('privacy.riskBody')}</p>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium text-fg">{t('privacy.contactTitle')}</h3>
            <p>
              {t('privacy.contactBody')}{' '}
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
