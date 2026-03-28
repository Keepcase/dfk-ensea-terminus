import { useQuery } from '@tanstack/react-query'
import { useAccount, usePublicClient } from 'wagmi'
import { HERO_AUCTION_ABI } from '../config/contracts'
import { activeChainId, heroAuctionAddress } from '../config/network'
import type { HeroAuction } from '../types/hero'

export function useUserHeroAuctions() {
  const { address } = useAccount()
  const publicClient = usePublicClient()

  return useQuery<{ listedIds: Set<string>; auctions: Map<string, HeroAuction> }>({
    queryKey: ['userHeroAuctions', address, activeChainId],
    enabled: !!address && !!publicClient && !!heroAuctionAddress,
    refetchInterval: 30_000,
    queryFn: async () => {
      const empty = { listedIds: new Set<string>(), auctions: new Map<string, HeroAuction>() }
      if (!address || !publicClient || !heroAuctionAddress) return empty

      // Get IDs of heroes listed by this user
      const listedHeroIds = (await publicClient.readContract({
        address: heroAuctionAddress,
        abi: HERO_AUCTION_ABI,
        functionName: 'getUserAuctions',
        args: [address],
      })) as bigint[]

      if (listedHeroIds.length === 0) return empty

      // Batch fetch auction details
      const auctionData = (await publicClient.readContract({
        address: heroAuctionAddress,
        abi: HERO_AUCTION_ABI,
        functionName: 'getAuctions',
        args: [listedHeroIds],
      })) as HeroAuction[]

      const listedIds = new Set(listedHeroIds.map(String))
      const auctions = new Map<string, HeroAuction>()
      for (const auction of auctionData) {
        if (auction.open) {
          auctions.set(auction.tokenId.toString(), auction)
        }
      }

      return { listedIds, auctions }
    },
  })
}
