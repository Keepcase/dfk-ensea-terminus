import { useParams, Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TOKENS, getItemImageUrl } from '../config/tokens'
import { useOrderbook } from '../hooks/useOrderbook'
import { OrderbookTable } from '../components/OrderbookTable'
import { TradeForm } from '../components/TradeForm'

export function OrderbookPage() {
  const navigate = useNavigate()
  const { symbol } = useParams<{ symbol: string }>()
  const token = symbol ? TOKENS[symbol] : undefined
  const {
    data: orderbook,
    error,
    refetch,
    isFetching,
  } = useOrderbook(
    token ? { tokenAddress: token.address, tokenId: token.tokenId ?? 0n } : undefined,
  )

  if (!token) {
    return (
      <div className="text-center py-20 animate-fade-up">
        <p className="text-muted-foreground/60 mb-4 text-sm">Item not found</p>
        <Link to="/" className="text-primary/70 hover:text-primary text-sm transition-colors">
          &larr; Back to Bazaar
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      {/* Item header */}
      <div className="flex items-center gap-5 mb-10">
        <button
          onClick={() => {
            const state = window.history.state as { idx?: number } | null
            if (state?.idx && state.idx > 0) {
              navigate(-1)
            } else {
              navigate('/')
            }
          }}
          className="text-sm text-muted-foreground/40 hover:text-primary transition-colors duration-200 cursor-pointer"
        >
          &larr; Back
        </button>
        <div className="w-16 h-16 rounded-xl bg-secondary/30 border border-border/30 flex items-center justify-center group">
          <img
            src={getItemImageUrl(token.imageFile)}
            alt={token.name}
            className="w-11 h-11 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
          />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-xl font-semibold tracking-[0.06em]">{token.name}</h1>
            <Badge
              variant="secondary"
              className="text-[10px] font-mono font-normal tracking-wide border-border/30"
            >
              {token.symbol}
            </Badge>
          </div>
          {orderbook && (
            <div className="flex gap-5 text-xs mt-1.5 font-mono">
              {orderbook.bids[0] && (
                <span className="text-buy">Bid: {orderbook.bids[0].priceDisplay}</span>
              )}
              {orderbook.asks[0] && (
                <span className="text-sell">Ask: {orderbook.asks[0].priceDisplay}</span>
              )}
              {orderbook.spreadPercent !== null && (
                <span className="text-muted-foreground/40">
                  Spread: {orderbook.spreadPercent.toFixed(2)}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orderbook */}
        <div className="lg:col-span-2">
          <Card className="border-border/20 bg-card/30 glass">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/40 font-normal">
                  Order Book
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="h-6 px-2 text-[10px] text-muted-foreground/40 hover:text-foreground gap-1"
                  title="Refresh orderbook"
                >
                  <svg
                    className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {isFetching ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {error ? (
                <p className="text-destructive/80 text-sm">
                  Failed to load orderbook: {error.message}
                </p>
              ) : !orderbook ? (
                <div className="space-y-2 py-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 animate-shimmer rounded" />
                  ))}
                </div>
              ) : (
                <OrderbookTable orderbook={orderbook} tokenDecimals={token.decimals} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trade form */}
        <div>
          <Card className="border-border/20 bg-card/30 glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/40 font-normal">
                Place Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TradeForm
                token={token}
                bestAsk={orderbook?.asks[0]?.price}
                bestBid={orderbook?.bids[0]?.price}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
