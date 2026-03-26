import { useAccount, usePublicClient, useWriteContract } from 'wagmi'
import { BAZAAR_ABI } from '../config/contracts'
import { bazaarAddress } from '../config/network'

/**
 * Hook for cancelling orders on the Bazaar.
 */
export function useCancelOrder() {
  const { address: account } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  async function cancelOrder(orderId: bigint) {
    if (!publicClient || !bazaarAddress || !account) throw new Error('Not connected')

    // Simulate first
    await publicClient.simulateContract({
      account,
      address: bazaarAddress,
      abi: BAZAAR_ABI,
      functionName: 'cancelOrders',
      args: [[orderId]],
    })

    const hash = await writeContractAsync({
      address: bazaarAddress,
      abi: BAZAAR_ABI,
      functionName: 'cancelOrders',
      args: [[orderId]],
    })

    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    return { hash, receipt }
  }

  return { cancelOrder }
}
