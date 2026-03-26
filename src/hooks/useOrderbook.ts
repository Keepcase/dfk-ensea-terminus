import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'
import { type Address } from 'viem'
import { BAZAAR_ABI } from '../config/contracts'
import { activeChainId, bazaarAddress } from '../config/network'
import { decodePrice } from '../lib/pricing'
import { BUY, SELL, type Orderbook, type PriceLevel, type OrderSide } from '../types'

interface UseOrderbookOptions {
  tokenAddress: Address | undefined
  /** ERC-1155 token ID (default 0n for ERC-20) */
  tokenId?: bigint
}

/**
 * Fetch the full orderbook for a token from the Bazaar contract.
 * Supports both ERC-20 (tokenId=0) and ERC-1155 tokens.
 */
export function useOrderbook(tokenAddressOrOpts: Address | undefined | UseOrderbookOptions) {
  // Support both old signature (just address) and new options object
  const opts =
    typeof tokenAddressOrOpts === 'object' &&
    tokenAddressOrOpts !== null &&
    'tokenAddress' in tokenAddressOrOpts
      ? tokenAddressOrOpts
      : { tokenAddress: tokenAddressOrOpts as Address | undefined }

  const { tokenAddress, tokenId = 0n } = opts
  const chainId = activeChainId
  const publicClient = usePublicClient()

  return useQuery<Orderbook | null>({
    queryKey: ['orderbook', tokenAddress, tokenId.toString(), chainId],
    enabled: !!tokenAddress && !!publicClient && !!bazaarAddress,
    refetchInterval: 20_000,
    queryFn: async () => {
      if (!tokenAddress || !publicClient || !bazaarAddress) return null

      const [buyPrices, sellPrices] = await Promise.all([
        publicClient.readContract({
          address: bazaarAddress,
          abi: BAZAAR_ABI,
          functionName: 'getPrices',
          args: [tokenAddress, tokenId, BUY],
        }),
        publicClient.readContract({
          address: bazaarAddress,
          abi: BAZAAR_ABI,
          functionName: 'getPrices',
          args: [tokenAddress, tokenId, SELL],
        }),
      ])

      const fetchPriceLevels = async (
        prices: readonly bigint[],
        side: OrderSide,
      ): Promise<PriceLevel[]> => {
        if (prices.length === 0) return []

        const results = await Promise.all(
          prices.map((price) =>
            publicClient.readContract({
              address: bazaarAddress,
              abi: BAZAAR_ABI,
              functionName: 'getOrderIdsAtPrice',
              args: [tokenAddress, tokenId, side, price],
            }),
          ),
        )

        return prices.map((price, i) => {
          const [orderIds, quantities] = results[i] ?? [[], []]
          const totalQuantity = quantities.reduce((sum, q) => sum + q, 0n)
          return {
            price,
            priceDisplay: decodePrice(price),
            totalQuantity,
            orderCount: orderIds.length,
          }
        })
      }

      const [bids, asks] = await Promise.all([
        fetchPriceLevels(buyPrices, BUY),
        fetchPriceLevels(sellPrices, SELL),
      ])

      bids.sort((a, b) => (b.price > a.price ? 1 : b.price < a.price ? -1 : 0))
      asks.sort((a, b) => (a.price > b.price ? 1 : a.price < b.price ? -1 : 0))

      const bestBid = bids[0]
      const bestAsk = asks[0]
      let spread: bigint | null = null
      let spreadPercent: number | null = null

      if (bestBid && bestAsk) {
        spread = bestAsk.price - bestBid.price
        const midPrice = (bestBid.price + bestAsk.price) / 2n
        if (midPrice > 0n) {
          spreadPercent = Number((spread * 10000n) / midPrice) / 100
        }
      }

      return { bids, asks, spread, spreadPercent }
    },
  })
}
