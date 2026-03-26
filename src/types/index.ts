import type { Address } from 'viem'

/** Order side: 0 = BUY, 1 = SELL */
export type OrderSide = 0 | 1

export const BUY: OrderSide = 0
export const SELL: OrderSide = 1

/** On-chain order as returned by getOrders() */
export interface BazaarOrder {
  orderId: bigint
  token: Address
  tokenId: bigint
  isERC20: boolean
  side: OrderSide
  owner: Address
  /** Price in contract format: unitPrice_wei × 10^12 */
  price: bigint
  quantity: bigint
  feePercent: bigint
}

/** A price level in the orderbook (aggregated) */
export interface PriceLevel {
  /** Contract-encoded price */
  price: bigint
  /** Human-readable price in JEWEL */
  priceDisplay: string
  /** Total quantity at this price level */
  totalQuantity: bigint
  /** Number of individual orders at this level */
  orderCount: number
}

/** Full orderbook for an item */
export interface Orderbook {
  bids: PriceLevel[] // Buy orders, sorted high → low
  asks: PriceLevel[] // Sell orders, sorted low → high
  spread: bigint | null
  spreadPercent: number | null
}
