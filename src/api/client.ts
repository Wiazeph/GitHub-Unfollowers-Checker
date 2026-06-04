import {
  ApiError,
  type ApiErrorBody,
  type UnfollowersResponse,
} from '../types/github'

/** Call the serverless proxy to compute the unfollowers for a username. */
export const fetchUnfollowers = async (
  username: string,
): Promise<UnfollowersResponse> => {
  let response: Response
  try {
    response = await fetch(
      `/api/unfollowers?username=${encodeURIComponent(username)}`,
    )
  } catch {
    throw new ApiError(
      { error: 'Network error. Check your connection and try again.', code: 'UPSTREAM' },
      0,
    )
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null
    throw new ApiError(
      body ?? { error: 'Something went wrong. Please try again.', code: 'UPSTREAM' },
      response.status,
    )
  }

  return (await response.json()) as UnfollowersResponse
}
