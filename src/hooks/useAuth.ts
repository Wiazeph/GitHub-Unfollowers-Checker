import { useQuery } from '@tanstack/react-query'
import { fetchMe } from '../api/client'

/** Current sign-in state. Fetched once on mount (login redirects back here). */
export const useAuth = () =>
  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
