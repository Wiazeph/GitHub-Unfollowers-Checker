import { type FormEvent } from 'react'
import { Search, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '../../ui/Button'
import { PLATFORMS, normalizeHandle } from '../../../platforms'
import type { PlatformId } from '../../../types/platform'

interface UnfollowersSearchProps {
  platform: PlatformId
  value: string
  onChange: (value: string) => void
  onSearch: (handle: string) => void
  isPending: boolean
  isAuthed: boolean
}

export const UnfollowersSearch = ({
  platform,
  value,
  onChange,
  onSearch,
  isPending,
  isAuthed,
}: UnfollowersSearchProps) => {
  const { t } = useTranslation()
  const config = PLATFORMS[platform]

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (isPending) return

    const normalized = normalizeHandle(platform, value)
    if (!config.handlePattern.test(normalized)) {
      toast.error(t(config.validationKey))
      return
    }
    onSearch(normalized)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-fg-muted"
          aria-hidden="true"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t(
            isAuthed ? config.placeholderAuthedKey : config.placeholderKey,
          )}
          aria-label={t('search.handleAriaLabel', { platform: config.label })}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={isPending}
          className="w-full rounded-lg border border-border bg-surface py-2.5 pr-3 pl-10 text-fg placeholder:text-fg-muted outline-none transition-colors focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-400/40 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      <Button type="submit" disabled={isPending} className="sm:w-auto">
        {isPending ? (
          <>
            <LoaderCircle
              className="h-5 w-5 motion-safe:animate-spin"
              aria-hidden="true"
            />
            <span>{t('search.checking')}</span>
          </>
        ) : (
          t('search.check')
        )}
      </Button>
    </form>
  )
}
