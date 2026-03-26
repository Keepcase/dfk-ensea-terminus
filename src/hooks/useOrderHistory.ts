import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'
import { type Address, type PublicClient, parseAbiItem, type Log } from 'viem'

import { bazaarAddress, activeChainId } from '../config/network'
import { BAZAAR_ABI } from '../config/contracts'
import { decodePrice } from '../lib/pricing'
import { findTokenByAddress, type TokenInfo } from '../config/tokens'

/** Log with decoded args from event */
type DecodedLog = Log & { args: Record<string, unknown> }

export interface HistoryEvent {
  type: 'placed' | 'filled' | 'cancelled'
  orderId: bigint
  token: Address
  tokenInfo: TokenInfo | undefined
  side: number
  price: string
  quantity: bigint
  blockNumber: bigint
  transactionHash: string
  timestamp: number
  filledQuantity?: bigint
  remainingQuantity?: bigint
}

// DFK Chain RPC max is 2048 blocks per getLogs call
const MAX_BLOCKS_PER_QUERY = 2048n
// ~7 days of blocks at ~2s block time
const BLOCK_RANGE = 302_400n

/**
 * Paginated getLogs that respects the 2048-block RPC limit.
 */
async function paginatedGetLogs<T extends Log>(
  client: PublicClient,
  params: {
    address: Address
    event: ReturnType<typeof parseAbiItem>
    args?: Record<string, unknown>
    fromBlock: bigint
    toBlock: bigint
  },
): Promise<T[]> {
  const allLogs: T[] = []
  let from = params.fromBlock

  while (from <= params.toBlock) {
    const chunkEnd = from + MAX_BLOCKS_PER_QUERY - 1n
    const to = chunkEnd > params.toBlock ? params.toBlock : chunkEnd

    const logs = await client.getLogs({
      address: params.address,
      event: params.event,
      args: params.args,
      fromBlock: from,
      toBlock: to,
    } as Parameters<typeof client.getLogs>[0])

    allLogs.push(...(logs as T[]))
    from = to + 1n
  }

  return allLogs
}

/**
 * Fetch order history for a user from blockchain event logs.
 * Paginates in 2048-block chunks to respect DFK Chain RPC limits.
 */
export function useOrderHistory(userAddress: Address | undefined) {
  const chainId = activeChainId
  const publicClient = usePublicClient()

  return useQuery<HistoryEvent[]>({
    queryKey: ['orderHistory', userAddress, chainId],
    enabled: !!userAddress && !!publicClient && !!bazaarAddress,
    staleTime: 60_000,
    queryFn: async () => {
      if (!userAddress || !publicClient || !bazaarAddress) return []

      const currentBlock = await publicClient.getBlockNumber()
      const fromBlock = currentBlock > BLOCK_RANGE ? currentBlock - BLOCK_RANGE : 0n

      // Fetch OrderAdded events where sender = userAddress
      const addedLogs = await paginatedGetLogs(publicClient, {
        address: bazaarAddress,
        event: parseAbiItem(
          'event OrderAdded(uint256 indexed orderId, address indexed token, address baseToken, uint256 tokenId, bool isERC20, uint8 side, address indexed sender, uint256 price, uint256 quantity)',
        ),
        args: { sender: userAddress },
        fromBlock,
        toBlock: currentBlock,
      })

      // Collect all order IDs from the user's placed orders
      const userOrderIds = new Set(
        addedLogs
          .map((log) => (log as DecodedLog).args.orderId as bigint | undefined)
          .filter((id): id is bigint => id !== undefined),
      )

      // Fetch OrderExecuted and OrderCancelled events in parallel
      const [executedLogs, cancelledLogs] = await Promise.all([
        paginatedGetLogs(publicClient, {
          address: bazaarAddress,
          event: parseAbiItem(
            'event OrderExecuted(uint256 indexed orderId, address indexed initiator, uint256 quantity, uint256 remainingQuantity, uint256 price)',
          ),
          fromBlock,
          toBlock: currentBlock,
        }).then((logs) =>
          logs.filter((log) => {
            const args = (log as DecodedLog).args
            return userOrderIds.has(args.orderId as bigint) || args.initiator === userAddress
          }),
        ),
        paginatedGetLogs(publicClient, {
          address: bazaarAddress,
          event: parseAbiItem(
            'event OrderCancelled(uint256 orderId, (uint256 orderId, address token, uint256 tokenId, bool isERC20, uint8 side, address owner, uint256 price, uint256 quantity, uint256 feePercent) order)',
          ),
          fromBlock,
          toBlock: currentBlock,
        }).then((logs) =>
          logs.filter((log) => {
            const args = (log as DecodedLog).args as { order?: { owner?: Address } }
            return args.order?.owner === userAddress
          }),
        ),
      ])

      const events: HistoryEvent[] = []

      // Process placed orders
      for (const log of addedLogs) {
        const args = (log as DecodedLog).args
        const orderId = args.orderId as bigint | undefined
        const token = args.token as Address | undefined
        const side = args.side as number | undefined
        const price = args.price as bigint | undefined
        const quantity = args.quantity as bigint | undefined
        if (orderId === undefined || !token || side === undefined || !price || !quantity) continue
        if (log.blockNumber === null || log.transactionHash === null) continue
        events.push({
          type: 'placed',
          orderId,
          token,
          tokenInfo: findTokenByAddress(token),
          side,
          price: decodePrice(price),
          quantity,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          timestamp: 0,
        })
      }

      // Process filled orders — collect order IDs missing token info
      const filledParsed = executedLogs
        .map((log) => {
          const args = (log as DecodedLog).args
          const orderId = args.orderId as bigint | undefined
          const quantity = args.quantity as bigint | undefined
          const remainingQuantity = args.remainingQuantity as bigint | undefined
          const price = args.price as bigint | undefined
          if (orderId === undefined || !quantity || !price) return null
          if (log.blockNumber === null || log.transactionHash === null) return null

          const originalAdd = addedLogs.find((a) => (a as DecodedLog).args.orderId === orderId)
          const originalArgs = originalAdd ? (originalAdd as DecodedLog).args : undefined

          return {
            orderId,
            token: (originalArgs?.token as Address) ?? null,
            side: (originalArgs?.side as number) ?? 0,
            price,
            quantity,
            remainingQuantity: remainingQuantity ?? 0n,
            blockNumber: log.blockNumber!,
            transactionHash: log.transactionHash!,
          }
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)

      // Batch-fetch order details for fills missing token info
      const missingTokenIds = filledParsed.filter((f) => !f.token).map((f) => f.orderId)

      const orderLookup = new Map<bigint, Address>()
      if (missingTokenIds.length > 0 && bazaarAddress) {
        try {
          const orders = await publicClient.readContract({
            address: bazaarAddress,
            abi: BAZAAR_ABI,
            functionName: 'getOrders',
            args: [missingTokenIds],
          })
          for (const order of orders) {
            orderLookup.set(order.orderId, order.token)
          }
        } catch {
          // Orders may have been deleted after cancel — ignore
        }
      }

      for (const fill of filledParsed) {
        const token = fill.token ?? orderLookup.get(fill.orderId)
        if (!token) continue
        events.push({
          type: 'filled',
          orderId: fill.orderId,
          token,
          tokenInfo: findTokenByAddress(token),
          side: fill.side,
          price: decodePrice(fill.price),
          quantity: fill.quantity,
          filledQuantity: fill.quantity,
          remainingQuantity: fill.remainingQuantity,
          blockNumber: fill.blockNumber,
          transactionHash: fill.transactionHash,
          timestamp: 0,
        })
      }

      // Process cancelled orders
      for (const log of cancelledLogs) {
        const args = (log as DecodedLog).args as {
          order?: {
            orderId: bigint
            token: Address
            side: number
            price: bigint
            quantity: bigint
            owner: Address
          }
        }
        const order = args.order
        if (!order) continue
        if (log.blockNumber === null || log.transactionHash === null) continue
        events.push({
          type: 'cancelled',
          orderId: order.orderId,
          token: order.token,
          tokenInfo: findTokenByAddress(order.token),
          side: order.side,
          price: decodePrice(order.price),
          quantity: order.quantity,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          timestamp: 0,
        })
      }

      // Sort by block number, newest first
      events.sort((a, b) => Number(b.blockNumber - a.blockNumber))

      // Fetch block timestamps in batches to avoid overwhelming RPC
      const uniqueBlocks = [...new Set(events.map((e) => e.blockNumber))]
      const TIMESTAMP_BATCH_SIZE = 20
      const blockTimestampMap = new Map<bigint, number>()

      for (let i = 0; i < uniqueBlocks.length; i += TIMESTAMP_BATCH_SIZE) {
        const batch = uniqueBlocks.slice(i, i + TIMESTAMP_BATCH_SIZE)
        const results = await Promise.allSettled(
          batch.map((blockNumber) => publicClient.getBlock({ blockNumber })),
        )
        for (const result of results) {
          if (result.status === 'fulfilled' && result.value.number !== null) {
            blockTimestampMap.set(result.value.number, Number(result.value.timestamp))
          }
        }
      }

      for (const evt of events) {
        evt.timestamp = blockTimestampMap.get(evt.blockNumber) ?? 0
      }

      return events
    },
  })
}
