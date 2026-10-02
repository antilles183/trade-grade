import { useQuery } from '@tanstack/react-query'
import { fetchPlayers } from '../api/client'

export function usePlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: fetchPlayers,
    staleTime: 60 * 60 * 1000,
  })
}
