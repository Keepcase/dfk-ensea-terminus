import { useState, useMemo, useEffect } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { usePlaceOrder } from '../hooks/usePlaceOrder'
import { useApproval } from '../hooks/useApproval'
import { useFeePercent } from '../hooks/useFeePercent'
import {
  formatJewel,
  parseJewel,
  decodePrice,
  validateOrder,
  validatePricePrecision,
} from '../lib/pricing'
import type { TokenInfo } from '../config/tokens'
import { formatBalance } from '../hooks/useInventory'
import { BUY, SELL, type OrderSide } from '../types'
import { useQuery } from '@tanstack/react-query'
import { erc20Abi, type Address } from 'viem'
import { activeChainId, dfkClient, ERC1155_BALANCE_ABI } from '../config/network'

interface TradeFormProps {
  token: TokenInfo
  /** Best ask (lowest sell) price in wei */
  bestAsk?: bigint
  /** Best bid (highest buy) price in wei */
  bestBid?: bigint
}

export function TradeForm({ token, bestAsk, bestBid }: TradeFormProps) {
  const { isConnected, address, chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const queryClient = useQueryClient()
  const { placeOrder } = usePlaceOrder()
  const { needsApproval, approve } = useApproval(token.address)
  const DFK_CHAIN_ID = activeChainId

  const [side, setSide] = useState<OrderSide>(BUY)
  const [price, setPrice] = useState('')
  const [hasUserEditedPrice, setHasUserEditedPrice] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [addToBook, setAddToBook] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { data: feePercent } = useFeePercent(token.address, side)
  const isMarketOrder = !addToBook

  // Fetch balance for just this one token (much faster than multicalling all 134)
  const { data: userBalance } = useQuery<bigint>({
    queryKey: ['tokenBalance', address, token.address, token.tokenId?.toString()],
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
    queryFn: async () => {
      if (!address) return 0n
      if (token.isERC20 === false) {
        return dfkClient.readContract({
          address: token.address as Address,
          abi: ERC1155_BALANCE_ABI,
          functionName: 'balanceOf',
          args: [address, token.tokenId ?? 0n],
        })
      }
      return dfkClient.readContract({
        address: token.address as Address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      })
    },
  })
  const userBalanceDisplay =
    userBalance && userBalance > 0n ? formatBalance(userBalance, token.decimals) : null

  // Pre-fill price from orderbook when side changes
  useEffect(() => {
    if (hasUserEditedPrice) return
    const suggestedPrice = side === BUY ? bestAsk : bestBid
    if (suggestedPrice) {
      setPrice(decodePrice(suggestedPrice))
    }
  }, [side, bestAsk, bestBid, hasUserEditedPrice])

  // Live validation
  const validationError = useMemo(() => {
    if (isMarketOrder) {
      if (!quantity) return null
      const q = Number(quantity)
      if (isNaN(q) || q <= 0) return 'Quantity must be greater than 0'
      return null
    }
    if (!price && !quantity) return null
    if (price && !quantity) return validatePricePrecision(price)
    if (!price || !quantity) return null
    return validateOrder({ price, quantity, tokenDecimals: token.decimals })
  }, [price, quantity, token.decimals, isMarketOrder])

  // Calculate raw values once for display
  const { totalWei, feeWei } = useMemo(() => {
    if (!price || !quantity) return { totalWei: null, feeWei: null }
    try {
      const unitWei = parseJewel(price)
      const qty = BigInt(quantity)
      const total = (unitWei * qty) / (10n ** BigInt(token.decimals) || 1n)
      const fee = feePercent ? (total * BigInt(Math.round(feePercent * 100))) / 10000n : null
      return { totalWei: total, feeWei: fee }
    } catch {
      return { totalWei: null, feeWei: null }
    }
  }, [price, quantity, token.decimals, feePercent])

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground/50 text-sm">Connect wallet to trade</p>
      </div>
    )
  }

  const estimatedTotal = totalWei ? formatJewel(totalWei) : null
  const estimatedFee = feeWei ? formatJewel(feeWei) : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate before submitting
    if (!isMarketOrder) {
      const orderError = validateOrder({ price, quantity, tokenDecimals: token.decimals })
      if (orderError) {
        setError(orderError)
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Ensure we're on DFK Chain
      if (chainId !== DFK_CHAIN_ID) {
        await switchChainAsync({ chainId: DFK_CHAIN_ID })
      }

      if (side === SELL) {
        const qty =
          token.decimals === 0
            ? BigInt(quantity)
            : BigInt(Math.round(parseFloat(quantity) * 10 ** token.decimals))

        if (needsApproval(qty)) {
          await approve(2n ** 256n - 1n)
        }
      }

      // For market orders: use the best available price
      // Buy: best ask price. Sell: best bid price.
      // addToBook is false, so unfilled portion is returned — no overpay risk.
      let orderPrice = price
      if (isMarketOrder) {
        if (side === BUY && bestAsk) {
          orderPrice = decodePrice(bestAsk)
        } else if (side === SELL && bestBid) {
          orderPrice = decodePrice(bestBid)
        } else {
          throw new Error('No orders available for market trade')
        }
      }

      const result = await placeOrder({
        tokenAddress: token.address,
        side,
        price: orderPrice,
        quantity,
        tokenDecimals: token.decimals,
        addToBook: isMarketOrder ? false : addToBook,
        tokenId: token.tokenId ?? 0n,
        isERC20: token.isERC20 ?? true,
      })

      setSuccess(`Order placed! Tx: ${result.hash.slice(0, 10)}...`)
      setPrice('')
      setQuantity('')
      // Refresh orderbook and user orders immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orderbook', token.address] }),
        queryClient.invalidateQueries({ queryKey: ['userOrders', address] }),
        queryClient.invalidateQueries({ queryKey: ['inventory', address] }),
      ])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed'
      // Show user-friendly messages for common errors
      if (msg.includes('insufficient funds')) {
        setError('Insufficient JEWEL balance for this order (price + gas fees)')
      } else if (msg.includes('User rejected') || msg.includes('user rejected')) {
        setError('Transaction cancelled')
      } else {
        const details = msg.includes('Details:')
          ? msg.split('Details:')[1]?.trim().split('\n')[0]
          : undefined
        const shortMsg = details ?? msg
        setError(shortMsg.length > 200 ? shortMsg.slice(0, 200) + '...' : shortMsg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Order type tabs — underline style */}
      <div className="relative flex border-b border-border/30">
        <button
          type="button"
          onClick={() => setAddToBook(true)}
          className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
            !isMarketOrder
              ? 'text-foreground'
              : 'text-muted-foreground/50 hover:text-muted-foreground'
          }`}
        >
          Limit
          {!isMarketOrder && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style={{ backgroundColor: 'var(--foreground)' }}
            />
          )}
        </button>
        <button
          type="button"
          onClick={() => setAddToBook(false)}
          className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
            isMarketOrder
              ? 'text-foreground'
              : 'text-muted-foreground/50 hover:text-muted-foreground'
          }`}
        >
          Market
          {isMarketOrder && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style={{ backgroundColor: 'var(--foreground)' }}
            />
          )}
        </button>
      </div>

      {/* Buy/Sell toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          className={`flex-1 h-11 rounded-lg text-sm font-semibold transition-all duration-200 ${
            side === BUY
              ? 'buy-btn-active'
              : 'border border-border/30 text-muted-foreground hover:text-foreground hover:border-border/50'
          }`}
          onClick={() => {
            setSide(BUY)
            setHasUserEditedPrice(false)
          }}
        >
          Buy
        </button>
        <button
          type="button"
          className={`flex-1 h-11 rounded-lg text-sm font-semibold transition-all duration-200 ${
            side === SELL
              ? 'sell-btn-active'
              : 'border border-border/30 text-muted-foreground hover:text-foreground hover:border-border/50'
          }`}
          onClick={() => {
            setSide(SELL)
            setHasUserEditedPrice(false)
          }}
        >
          Sell
        </button>
      </div>

      {/* Quantity input — always visible */}
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/40">
            Quantity
          </label>
          {side === SELL && userBalanceDisplay && (
            <button
              type="button"
              onClick={() => setQuantity(userBalanceDisplay.replace(/,/g, ''))}
              className="text-[10px] text-primary/60 hover:text-primary transition-colors"
            >
              {userBalanceDisplay} available
            </button>
          )}
          {side === BUY && userBalanceDisplay && (
            <span className="text-[10px] text-muted-foreground/30">
              You own: {userBalanceDisplay}
            </span>
          )}
        </div>
        <Input
          type="text"
          inputMode={token.decimals === 0 ? 'numeric' : 'decimal'}
          placeholder={token.decimals === 0 ? '10' : '1.0'}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="font-mono bg-secondary/20 border-border/30 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 h-10"
          required
        />
      </div>

      {/* Price input — only for Limit Orders */}
      {!isMarketOrder && (
        <div>
          <label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/40 mb-1.5 block">
            Price per unit (JEWEL)
          </label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder={
              (side === BUY && bestAsk
                ? decodePrice(bestAsk)
                : side === SELL && bestBid
                  ? decodePrice(bestBid)
                  : '0.005') + ' (best price)'
            }
            value={price}
            onChange={(e) => {
              setPrice(e.target.value)
              setHasUserEditedPrice(true)
            }}
            className={`font-mono bg-secondary/20 border-border/30 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 h-10 ${
              price && validatePricePrecision(price) ? 'border-destructive/50' : ''
            }`}
            required
          />
          {price && validatePricePrecision(price) && (
            <p className="text-[10px] text-destructive/70 mt-1">{validatePricePrecision(price)}</p>
          )}
        </div>
      )}

      {/* Market order info */}
      {isMarketOrder && (
        <p className="text-xs text-muted-foreground/60 bg-secondary/15 border border-border/15 rounded-lg px-3 py-2.5 leading-relaxed">
          {side === BUY
            ? 'Fills at the lowest available sell prices. Unfilled portion is returned to you.'
            : 'Fills at the highest available buy prices. Unfilled portion is returned to you.'}
        </p>
      )}

      {/* Cost breakdown */}
      {estimatedTotal && (
        <div className="space-y-1.5 py-2.5 px-3 rounded-lg bg-secondary/15 border border-border/15">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground/50">Subtotal</span>
            <span className="font-mono text-foreground/70">{estimatedTotal} JEWEL</span>
          </div>
          {feePercent !== null && feePercent !== undefined && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground/50">Fee ({feePercent}%)</span>
              <span className="font-mono text-foreground/70">{estimatedFee ?? '...'} JEWEL</span>
            </div>
          )}
          {totalWei && (
            <div className="border-t border-border/15 pt-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground/70 font-medium">Total</span>
                <Badge
                  variant="secondary"
                  className="font-mono text-xs border-border/20 bg-transparent text-foreground/80"
                >
                  {formatJewel(totalWei + (feeWei ?? 0n))} JEWEL
                </Badge>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation warning */}
      {validationError && price && quantity && (
        <p className="text-xs text-destructive/70 bg-destructive/5 border border-destructive/10 rounded-lg px-3 py-2">
          {validationError}
        </p>
      )}

      {/* Error/Success */}
      {error && (
        <p className="text-destructive/80 text-xs bg-destructive/5 border border-destructive/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-buy text-xs bg-buy/5 border border-buy/10 rounded-lg px-3 py-2">
          {success}
        </p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={(e) => {
          handleSubmit(e as unknown as React.FormEvent)
        }}
        className={`w-full h-12 font-semibold text-base rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          side === BUY ? 'buy-btn-active' : 'sell-btn-active'
        }`}
        disabled={isSubmitting || (!isMarketOrder && !price) || !quantity || !!validationError}
        style={{ color: 'white' }}
      >
        {isSubmitting
          ? 'Processing...'
          : chainId !== DFK_CHAIN_ID
            ? 'Switch to DFK Chain'
            : isMarketOrder
              ? `Market ${side === BUY ? 'Buy' : 'Sell'}: ${token.name}`
              : `Confirm ${side === BUY ? 'Buy' : 'Sell'}: ${token.name}`}
      </button>
    </form>
  )
}
