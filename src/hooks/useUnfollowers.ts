import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchUnfollowers } from '../api/client'
import type {
  ApiError,
  PlatformId,
  UnfollowersResponse,
} from '../types/platform'

interface SearchInput {
  platform: PlatformId
  handle: string
}

/**
 * Triggers an unfollowers lookup. Search is user-initiated (button / Enter),
 * so a mutation fits better than a query: `mutate({platform, handle})` maps 1:1
 * to the submit handler, and `isPending` / `data` / `error` drive the UI states.
 */
export const useUnfollowers = () =>
  useMutation<UnfollowersResponse, ApiError, SearchInput>({
    mutationFn: ({ platform, handle }) => fetchUnfollowers(platform, handle),
    onError: (error) => {
      toast.error(error.message)
    },
  })
