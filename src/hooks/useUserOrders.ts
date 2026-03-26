import { useQuery } from '@tanstack/react-query'
import { useAccount, usePublicClient } from 'wagmi'
import { BAZAAR_ABI } from '../config/contracts'
import { bazaarAddress } from '../config/network'
import { decodePrice, formatQuantity } from '../lib/pricing'
import { findTokenByAddress, type TokenInfo } from '../config/tokens'
import type { BazaarOrder } from '../types'

export interface UserOrderWithToken extends BazaarOrder {
  token: `0x${string}`
  tokenInfo: TokenInfo | undefined
  priceDisplay: string
  quantityDisplay: string
}

/**
 * Fetch all open orders for the connected user across all tokens.
 */
export function useUserOrders() {
  const { address: userAddress } = useAccount()
  const publicClient = usePublicClient()

  return useQuery<UserOrderWithToken[]>({
    queryKey: ['userOrders', userAddress],
    enabled: !!userAddress && !!publicClient && !!bazaarAddress,
    refetchInterval: 30_000, // Poll every 30s
    queryFn: async () => {
      if (!userAddress || !publicClient || !bazaarAddress) return []

      // New contract returns all user orders in one call (no per-token iteration)
      const allOrderIds = await publicClient.readContract({
        address: bazaarAddress,
        abi: BAZAAR_ABI,
        functionName: 'getUserOpenOrderIds',
        args: [userAddress],
      })

      if (allOrderIds.length === 0) return []

      // Batch fetch all orders
      const orders = await publicClient.readContract({
        address: bazaarAddress,
        abi: BAZAAR_ABI,
        functionName: 'getOrders',
        args: [allOrderIds],
      })

      // Map to enriched order objects
      return orders.map((order) => {
        const tokenInfo = findTokenByAddress(order.token)
        const decimals = tokenInfo?.decimals ?? 0
        return {
          ...order,
          side: order.side as 0 | 1,
          tokenInfo,
          priceDisplay: decodePrice(order.price),
          quantityDisplay: formatQuantity(order.quantity, decimals),
        }
      })
    },
  })
}
