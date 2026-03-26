import { useQuery } from '@tanstack/react-query'
import { usePublicClient, useAccount } from 'wagmi'
import { type Address } from 'viem'
import { BAZAAR_ABI } from '../config/contracts'
import { bazaarAddress } from '../config/network'

/**
 * Fetch the user's fee percentage for a given token and side.
 * Accounts for Master Merchant Power-Up discounts.
 * Returns the fee as a percentage (e.g., 1.5 for 1.5%).
 */
export function useFeePercent(tokenAddress: Address | undefined, side: 0 | 1) {
  const { address: userAddress } = useAccount()
  const publicClient = usePublicClient()

  return useQuery<number | null>({
    queryKey: ['feePercent', tokenAddress, userAddress, side],
    enabled: !!tokenAddress && !!userAddress && !!publicClient && !!bazaarAddress,
    staleTime: 60_000,
    queryFn: async () => {
      if (!tokenAddress || !userAddress || !publicClient || !bazaarAddress) return null

      const feeBps = await publicClient.readContract({
        address: bazaarAddress,
        abi: BAZAAR_ABI,
        functionName: 'calcFeePercent',
        args: [userAddress, tokenAddress, side],
      })

      // Contract returns fee scaled by 1000 (e.g., 1500 = 1.5%)
      return Number(feeBps) / 1000
    },
  })
}
