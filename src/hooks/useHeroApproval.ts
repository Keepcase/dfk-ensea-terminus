import { useAccount, usePublicClient, useWriteContract } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { HERO_ABI } from '../config/contracts'
import { heroAddress, heroAuctionAddress } from '../config/network'

export function useHeroApproval() {
  const { address: userAddress } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  const { data: isApproved, refetch: refetchApproval } = useQuery({
    queryKey: ['heroApproval', userAddress],
    enabled: !!userAddress && !!publicClient && !!heroAddress && !!heroAuctionAddress,
    queryFn: async () => {
      if (!userAddress || !publicClient || !heroAddress || !heroAuctionAddress) return false
      return publicClient.readContract({
        address: heroAddress,
        abi: HERO_ABI,
        functionName: 'isApprovedForAll',
        args: [userAddress, heroAuctionAddress],
      }) as Promise<boolean>
    },
  })

  async function approveAll() {
    if (!userAddress || !publicClient || !heroAddress || !heroAuctionAddress)
      throw new Error('Not connected')

    await publicClient.simulateContract({
      account: userAddress,
      address: heroAddress,
      abi: HERO_ABI,
      functionName: 'setApprovalForAll',
      args: [heroAuctionAddress, true],
    })

    const hash = await writeContractAsync({
      address: heroAddress,
      abi: HERO_ABI,
      functionName: 'setApprovalForAll',
      args: [heroAuctionAddress, true],
    })

    await publicClient.waitForTransactionReceipt({ hash })
    await refetchApproval()
    return hash
  }

  return {
    isApproved: isApproved ?? false,
    needsApproval: !isApproved,
    approveAll,
    refetchApproval,
  }
}
