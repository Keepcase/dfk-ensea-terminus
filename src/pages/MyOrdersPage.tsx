import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUserOrders } from '../hooks/useUserOrders'
import { useCancelOrder } from '../hooks/useCancelOrder'
import { useOrderHistory } from '../hooks/useOrderHistory'
import { getItemImageUrl } from '../config/tokens'
import { formatTimestamp } from '../lib/format'

const EVENT_STYLE: Record<string, string> = {
  filled: 'text-buy bg-buy/10',
  cancelled: 'text-sell bg-sell/10',
  placed: 'text-primary bg-primary/10',
}

const EVENT_LABEL: Record<string, string> = {
  placed: 'PLACED',
  filled: 'FILLED',
  cancelled: 'CANCELLED',
}

type Tab = 'open' | 'history'

export function MyOrdersPage() {
  const { address, isConnected } = useAccount()
  const { data: orders, isLoading, error } = useUserOrders()
  const {
    data: history,
    isLoading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
    isFetching: historyFetching,
  } = useOrderHistory(address)
  const { cancelOrder } = useCancelOrder()
  const queryClient = useQueryClient()
  const [cancellingId, setCancellingId] = useState<bigint | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('open')

  async function handleCancel(orderId: bigint) {
    setCancelError(null)
    setCancellingId(orderId)
    try {
      await cancelOrder(orderId)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['userOrders', address] }),
        queryClient.invalidateQueries({ queryKey: ['orderHistory', address] }),
      ])
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Cancel failed')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-[0.06em]">My Orders</h1>
        <p className="text-muted-foreground/40 text-sm mt-1.5 tracking-wide">
          View and manage your Bazaar orders
        </p>
      </div>

      {!isConnected ? (
        <Card className="border-border/20 bg-card/30 glass">
          <CardContent className="p-16 text-center">
            <p className="text-muted-foreground/40 text-sm">Connect your wallet to view orders</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tab bar */}
          <div className="flex gap-1 mb-6">
            <button
              onClick={() => setActiveTab('open')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'open'
                  ? 'text-primary bg-primary/8 inner-glow-gold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              Open Orders
              {orders && orders.length > 0 && (
                <span className="ml-1.5 text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  {orders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'history'
                  ? 'text-primary bg-primary/8 inner-glow-gold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              History
            </button>
          </div>

          {/* Open Orders tab */}
          {activeTab === 'open' && (
            <>
              {isLoading ? (
                <Card className="border-border/20 bg-card/30 glass">
                  <CardContent className="p-16 text-center">
                    <div className="inline-block h-6 w-48 animate-shimmer rounded" />
                  </CardContent>
                </Card>
              ) : error ? (
                <Card className="border-border/20 bg-card/30 glass">
                  <CardContent className="p-16 text-center">
                    <p className="text-destructive/80 text-sm">
                      Failed to load orders: {error.message}
                    </p>
                  </CardContent>
                </Card>
              ) : !orders || orders.length === 0 ? (
                <Card className="border-border/20 bg-card/30 glass">
                  <CardContent className="p-16 text-center">
                    <p className="text-muted-foreground/40 text-sm">No open orders</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/20 bg-card/30 glass">
                  <CardContent className="pt-4 overflow-x-auto">
                    {cancelError && (
                      <p className="text-destructive/80 text-sm mb-4 bg-destructive/5 border border-destructive/10 rounded-lg px-3 py-2">
                        {cancelError}
                      </p>
                    )}
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/20 hover:bg-transparent">
                          <TableHead className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-normal">
                            Item
                          </TableHead>
                          <TableHead className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-normal">
                            Side
                          </TableHead>
                          <TableHead className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-normal">
                            Price (JEWEL)
                          </TableHead>
                          <TableHead className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-normal">
                            Quantity
                          </TableHead>
                          <TableHead className="text-right text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-normal">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow
                            key={order.orderId.toString()}
                            className="border-border/10 hover:bg-secondary/5 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                {order.tokenInfo && (
                                  <img
                                    src={getItemImageUrl(order.tokenInfo.imageFile)}
                                    alt={order.tokenInfo.name}
                                    className="w-7 h-7 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                                  />
                                )}
                                <span className="text-sm text-foreground/80">
                                  {order.tokenInfo?.name ?? order.token.slice(0, 10) + '...'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={`text-[10px] font-mono border-0 ${
                                  order.side === 0 ? 'text-buy bg-buy/10' : 'text-sell bg-sell/10'
                                }`}
                              >
                                {order.side === 0 ? 'BUY' : 'SELL'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm text-foreground/70">
                              {order.priceDisplay}
                            </TableCell>
                            <TableCell className="font-mono text-sm text-foreground/70">
                              {order.quantityDisplay}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 text-xs bg-destructive/15 text-destructive hover:bg-destructive/25 border border-destructive/20"
                                onClick={() => handleCancel(order.orderId)}
                                disabled={cancellingId === order.orderId}
                              >
                                {cancellingId === order.orderId ? 'Cancelling...' : 'Cancel'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* History tab */}
          {activeTab === 'history' && (
            <>
              <div className="flex justify-end mb-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs gap-1.5 border-border/30"
                  onClick={() => refetchHistory()}
                  disabled={historyFetching}
                >
                  <svg
                    className={`w-3.5 h-3.5 ${historyFetching ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {historyFetching ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
              {historyLoading ? (
                <Card className="border-border/20 bg-card/30 glass">
                  <CardContent className="p-16 text-center">
                    <div className="space-y-2">
                      <div className="inline-block h-6 w-48 animate-shimmer rounded" />
                      <p className="text-muted-foreground/40 text-xs mt-2">
                        Scanning blockchain events (last ~7 days)...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : historyError ? (
                <Card className="border-border/20 bg-card/30 glass">
                  <CardContent className="p-16 text-center">
                    <p className="text-destructive/80 text-sm">
                      Failed to load history: {historyError.message}
                    </p>
                  </CardContent>
                </Card>
              ) : !history || history.length === 0 ? (
                <Card className="border-border/20 bg-card/30 glass">
                  <CardContent className="p-16 text-center">
                    <p className="text-muted-foreground/40 text-sm">
                      No order history found in the last 7 days
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/20 bg-card/30 glass">
                  <CardHeader>
                    <CardTitle className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/40 font-normal">
                      Order History ({history.length} events)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/20 hover:bg-transparent">
                          <TableHead className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-normal">
                            Event
                          </TableHead>
                          <TableHead className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-normal">
                            Time
                          </TableHead>
                          <TableHead className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-normal">
                            Item
                          </TableHead>
                          <TableHead className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-normal">
                            Side
                          </TableHead>
                          <TableHead className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-normal">
                            Price
                          </TableHead>
                          <TableHead className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-normal">
                            Qty
                          </TableHead>
                          <TableHead className="text-right text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-normal">
                            Tx
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.map((evt, i) => (
                          <TableRow
                            key={`${evt.transactionHash}-${evt.orderId}-${i}`}
                            className="border-border/10 hover:bg-secondary/5 transition-colors"
                          >
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={`text-[10px] font-mono border-0 ${EVENT_STYLE[evt.type] ?? ''}`}
                              >
                                {EVENT_LABEL[evt.type] ?? evt.type.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className="text-xs text-foreground/50 font-mono whitespace-nowrap"
                              title={evt.timestamp ? new Date(evt.timestamp * 1000).toLocaleString() : undefined}
                            >
                              {formatTimestamp(evt.timestamp)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {evt.tokenInfo && (
                                  <img
                                    src={getItemImageUrl(evt.tokenInfo.imageFile)}
                                    alt={evt.tokenInfo.name}
                                    className="w-5 h-5 object-contain"
                                  />
                                )}
                                <span className="text-xs text-foreground/70">
                                  {evt.tokenInfo?.name ?? evt.token.slice(0, 8) + '...'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`text-xs font-mono ${evt.side === 0 ? 'text-buy' : 'text-sell'}`}
                              >
                                {evt.side === 0 ? 'BUY' : 'SELL'}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-foreground/60">
                              {evt.price}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-foreground/60">
                              {evt.quantity.toString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <a
                                href={`https://subnets.avax.network/defi-kingdoms/tx/${evt.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-primary/60 hover:text-primary font-mono transition-colors"
                              >
                                {evt.transactionHash.slice(0, 8)}...
                              </a>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
