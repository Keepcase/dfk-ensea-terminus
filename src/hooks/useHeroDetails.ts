import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'
import { HERO_ABI } from '../config/contracts'
import { heroAddress } from '../config/network'
import { parseHeroV3 } from '../lib/hero'
import type { HeroDetails } from '../types/hero'

/**
 * Fetch hero metadata for a page of token IDs.
 *
 * Uses multicall to batch individual getHeroV3 calls (returns uint256[84] per hero).
 */
export function useHeroDetails(heroIds: bigint[]) {
  const publicClient = usePublicClient()

  return useQuery<HeroDetails[]>({
    queryKey: ['heroDetails', heroIds.map(String).join(',')],
    enabled: heroIds.length > 0 && !!publicClient && !!heroAddress,
    staleTime: 60_000,
    queryFn: async () => {
      if (!publicClient || !heroAddress || heroIds.length === 0) return []

      const contracts = heroIds.map((id) => ({
        address: heroAddress,
        abi: HERO_ABI,
        functionName: 'getHeroV3' as const,
        args: [id] as const,
      }))

      const results = await publicClient.multicall({ contracts })

      return results
        .filter((r) => r.status === 'success')
        .map((r) => parseHeroV3(r.result as readonly bigint[]))
    },
  })
}
