import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { unfollowAccounts } from '../api/client'
import type { ApiError, PlatformId, UnfollowResult } from '../types/platform'

interface UnfollowInput {
  platform: PlatformId
  targets: string[]
}

/**
 * Unfollow one or more accounts. The caller handles updating the list and
 * clearing the selection in onSuccess; this hook owns the toast feedback.
 */
export const useUnfollow = (onSuccess: (result: UnfollowResult) => void) => {
  const { t } = useTranslation()
  return useMutation<UnfollowResult, ApiError, UnfollowInput>({
    mutationFn: ({ platform, targets }) => unfollowAccounts(platform, targets),
    onSuccess: (result) => {
      if (result.removed.length > 0) {
        toast.success(t('unfollow.success', { count: result.removed.length }))
      }
      if (result.failed.length > 0) {
        toast.error(t('unfollow.failed', { count: result.failed.length }))
      }
      onSuccess(result)
    },
    onError: (error) => toast.error(error.message),
  })
}
