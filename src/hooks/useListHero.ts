import { useAccount, usePublicClient, useWriteContract } from 'wagmi'
import { HERO_AUCTION_ABI } from '../config/contracts'
import { heroAuctionAddress } from '../config/network'
import { parseEther, zeroAddress } from 'viem'

export function useListHero() {
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const { address: account } = useAccount()

  async function listHero(heroId: bigint, priceInCrystal: string) {
    if (!publicClient || !heroAuctionAddress || !account) throw new Error('Not connected')

    const price = parseEther(priceInCrystal)
    const duration = 60n // 60 seconds — matches existing DFK pattern for fixed-price

    // Simulate first
    await publicClient.simulateContract({
      account,
      address: heroAuctionAddress,
      abi: HERO_AUCTION_ABI,
      functionName: 'createAuction',
      args: [heroId, price, price, duration, zeroAddress],
    })

    const hash = await writeContractAsync({
      address: heroAuctionAddress,
      abi: HERO_AUCTION_ABI,
      functionName: 'createAuction',
      args: [heroId, price, price, duration, zeroAddress],
    })

    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    return { hash, receipt }
  }

  return { listHero }
}
