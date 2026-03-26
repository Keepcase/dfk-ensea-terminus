import { useAccount, usePublicClient, useWriteContract } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'
import { ERC20_ABI } from '../config/contracts'
import { bazaarAddress } from '../config/network'

/**
 * Check and manage ERC-20 allowance for selling items on the Bazaar.
 */
export function useApproval(tokenAddress: Address | undefined) {
  const { address: userAddress } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  const { data: allowance, refetch: refetchAllowance } = useQuery({
    queryKey: ['allowance', tokenAddress, userAddress],
    enabled: !!tokenAddress && !!userAddress && !!publicClient && !!bazaarAddress,
    queryFn: async () => {
      if (!tokenAddress || !userAddress || !publicClient || !bazaarAddress) return 0n
      return publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [userAddress, bazaarAddress],
      })
    },
  })

  async function approve(amount: bigint) {
    if (!tokenAddress || !bazaarAddress || !publicClient || !userAddress)
      throw new Error('Missing addresses')

    await publicClient.simulateContract({
      account: userAddress,
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [bazaarAddress, amount],
    })

    const hash = await writeContractAsync({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [bazaarAddress, amount],
    })

    // Wait for confirmation then refresh allowance
    if (publicClient) {
      await publicClient.waitForTransactionReceipt({ hash })
    }
    await refetchAllowance()
    return hash
  }

  return {
    allowance: allowance ?? 0n,
    needsApproval: (amount: bigint) => (allowance ?? 0n) < amount,
    approve,
    refetchAllowance,
  }
}
