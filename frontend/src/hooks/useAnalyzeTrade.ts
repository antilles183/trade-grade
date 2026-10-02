import { useMutation } from '@tanstack/react-query'
import { analyzeTrade } from '../api/client'

export function useAnalyzeTrade() {
  return useMutation({ mutationFn: analyzeTrade })
}
