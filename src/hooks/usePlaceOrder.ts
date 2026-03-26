import { useAccount, usePublicClient, useWriteContract } from 'wagmi'
import { BAZAAR_ABI } from '../config/contracts'
import { bazaarAddress } from '../config/network'
import { calculateTotalPrice } from '../lib/pricing'
import type { Address } from 'viem'
import type { OrderSide } from '../types'

interface PlaceOrderParams {
  tokenAddress: Address
  side: OrderSide
  /** Human-readable price in JEWEL (e.g., "0.005") */
  price: string
  /** Quantity as string (whole number for 0-decimal tokens) */
  quantity: string
  tokenDecimals: number
  /** Whether to add unfilled portion to orderbook (limit order) */
  addToBook: boolean
  /** ERC-1155 token ID (default 0n for ERC-20) */
  tokenId?: bigint
  /** Whether this is an ERC-20 token (default true) */
  isERC20?: boolean
}

/**
 * Hook for placing buy/sell orders on the Bazaar.
 *
 * Flow:
 * 1. Build OrderInput struct with proper encoding
 * 2. Simulate the transaction (free, catches reverts)
 * 3. Send the transaction for user to sign
 */
export function usePlaceOrder() {
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const { address: account } = useAccount()

  async function placeOrder(params: PlaceOrderParams) {
    if (!publicClient || !bazaarAddress || !account) throw new Error('Not connected')

    const {
      tokenAddress,
      side,
      price,
      quantity,
      tokenDecimals,
      addToBook,
      tokenId = 0n,
      isERC20 = true,
    } = params

    // Calculate totalPrice for the contract
    const quantityBigInt =
      tokenDecimals === 0
        ? BigInt(quantity)
        : BigInt(Math.round(parseFloat(quantity) * 10 ** tokenDecimals))

    const totalPrice = calculateTotalPrice(price, quantityBigInt, tokenDecimals)

    const orderInput = {
      token: tokenAddress,
      tokenId,
      side,
      totalPrice,
      quantity: quantityBigInt,
      addUnfilledOrderToOrderbook: addToBook,
      isERC20,
    } as const

    // Calculate msg.value for buy orders (totalPrice + fee)
    let value = 0n
    if (side === 0) {
      // BUY: need to send JEWEL as msg.value
      const fee = await publicClient.readContract({
        address: bazaarAddress,
        abi: BAZAAR_ABI,
        functionName: 'calcFee',
        args: [tokenAddress, side, totalPrice],
      })
      value = totalPrice + fee
    }

    // Simulate first to catch reverts before spending gas
    await publicClient.simulateContract({
      account,
      address: bazaarAddress,
      abi: BAZAAR_ABI,
      functionName: 'makeOrders',
      args: [[orderInput]],
      value,
    })

    // Send the actual transaction
    const hash = await writeContractAsync({
      address: bazaarAddress,
      abi: BAZAAR_ABI,
      functionName: 'makeOrders',
      args: [[orderInput]],
      value,
    })

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    return { hash, receipt }
  }

  return { placeOrder }
}
