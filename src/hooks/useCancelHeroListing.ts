import { useAccount, usePublicClient, useWriteContract } from 'wagmi'
import { HERO_AUCTION_ABI } from '../config/contracts'
import { heroAuctionAddress } from '../config/network'

export function useCancelHeroListing() {
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const { address: account } = useAccount()

  async function cancelListing(heroId: bigint) {
    if (!publicClient || !heroAuctionAddress || !account) throw new Error('Not connected')

    await publicClient.simulateContract({
      account,
      address: heroAuctionAddress,
      abi: HERO_AUCTION_ABI,
      functionName: 'cancelAuction',
      args: [heroId],
    })

    const hash = await writeContractAsync({
      address: heroAuctionAddress,
      abi: HERO_AUCTION_ABI,
      functionName: 'cancelAuction',
      args: [heroId],
    })

    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    return { hash, receipt }
  }

  return { cancelListing }
}
