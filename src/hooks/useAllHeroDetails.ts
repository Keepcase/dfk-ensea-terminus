import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'
import { HERO_ABI } from '../config/contracts'
import { heroAddress } from '../config/network'
import { parseHeroV3 } from '../lib/hero'
import type { HeroDetails } from '../types/hero'

const BATCH_SIZE = 100

/**
 * Fetch hero details for ALL hero IDs by batching multicalls.
 *
 * Used for global sorting (Gen, Rarity, Level, etc.) which requires
 * details for all heroes, not just the current page.
 *
 * For 678 heroes: ~7 batches × ~700ms = ~5 seconds.
 * Results are cached and reused across page navigation.
 */
export function useAllHeroDetails(heroIds: bigint[], enabled: boolean) {
  const publicClient = usePublicClient()

  return useQuery<HeroDetails[]>({
    queryKey: ['allHeroDetails', heroIds.map(String).join(',')],
    enabled: enabled && heroIds.length > 0 && !!publicClient && !!heroAddress,
    staleTime: 120_000,
    queryFn: async () => {
      if (!publicClient || !heroAddress || heroIds.length === 0) return []

      const allHeroes: HeroDetails[] = []

      for (let i = 0; i < heroIds.length; i += BATCH_SIZE) {
        const batchIds = heroIds.slice(i, i + BATCH_SIZE)
        const contracts = batchIds.map((id) => ({
          address: heroAddress,
          abi: HERO_ABI,
          functionName: 'getHeroV3' as const,
          args: [id] as const,
        }))

        const results = await publicClient.multicall({ contracts })

        for (const r of results) {
          if (r.status === 'success') {
            allHeroes.push(parseHeroV3(r.result as readonly bigint[]))
          }
        }
      }

      return allHeroes
    },
  })
}
