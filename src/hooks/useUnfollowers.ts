import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchUnfollowers } from '../api/client'
import type { ApiError, UnfollowersResponse } from '../types/github'

/**
 * Triggers an unfollowers lookup. Search is user-initiated (button / Enter),
 * so a mutation fits better than a query: `mutate(username)` maps 1:1 to the
 * submit handler, and `isPending` / `data` / `error` drive the UI states.
 */
export const useUnfollowers = () =>
  useMutation<UnfollowersResponse, ApiError, string>({
    mutationFn: fetchUnfollowers,
    onError: (error) => {
      toast.error(error.message)
    },
  })
