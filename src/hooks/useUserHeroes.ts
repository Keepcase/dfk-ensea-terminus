import { useQuery } from '@tanstack/react-query'
import { useAccount, usePublicClient } from 'wagmi'
import { HERO_ABI } from '../config/contracts'
import { activeChainId, heroAddress } from '../config/network'

export function useUserHeroes() {
  const { address } = useAccount()
  const publicClient = usePublicClient()

  return useQuery<bigint[]>({
    queryKey: ['userHeroes', address, activeChainId],
    enabled: !!address && !!publicClient && !!heroAddress,
    refetchInterval: 30_000,
    queryFn: async () => {
      if (!address || !publicClient || !heroAddress) return []
      return publicClient.readContract({
        address: heroAddress,
        abi: HERO_ABI,
        functionName: 'getUserHeroes',
        args: [address],
      }) as Promise<bigint[]>
    },
  })
}
