import { useTranslation } from 'react-i18next'
import { HeaderActions } from './HeaderActions'

export const Header = () => {
  const { t } = useTranslation()
  return (
    <header className="mx-auto w-full max-w-3xl px-4 sm:px-6">
      <div className="flex justify-end pt-4">
        <HeaderActions />
      </div>
      <div className="pt-8 pb-10 text-center sm:pt-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t('header.title')}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-fg-muted sm:text-lg">
          {t('header.subtitle')}
        </p>
      </div>
    </header>
  )
}
