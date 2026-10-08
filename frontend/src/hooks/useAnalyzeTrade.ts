import { useMutation } from '@tanstack/react-query'
import { analyzeTrade, ApiError } from '../api/client'

// Gemini answers 503 when it is overloaded; wait a few seconds and try again.
// TanStack passes a 0-based failureCount to retry/retryDelay (0 = first failure).
export const MAX_RETRIES = 3
const RETRY_DELAYS_MS = [3000, 5000, 8000]

export function useAnalyzeTrade() {
  return useMutation({
    mutationFn: analyzeTrade,
    retry: (failureCount, error) =>
      error instanceof ApiError && error.status === 503 && failureCount < MAX_RETRIES,
    retryDelay: (failureCount) => RETRY_DELAYS_MS[failureCount] ?? RETRY_DELAYS_MS.at(-1)!,
  })
}
