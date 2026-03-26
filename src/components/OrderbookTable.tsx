import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { Orderbook } from '../types'
import { formatQuantity } from '../lib/pricing'

interface OrderbookTableProps {
  orderbook: Orderbook
  tokenDecimals: number
  maxLevels?: number
}

export function OrderbookTable({ orderbook, tokenDecimals, maxLevels = 10 }: OrderbookTableProps) {
  const { bids, asks, spreadPercent } = orderbook

  const visibleAsks = asks.slice(0, maxLevels).reverse()
  const visibleBids = bids.slice(0, maxLevels)

  const maxQuantity = Math.max(
    ...visibleAsks.map((a) => Number(a.totalQuantity)),
    ...visibleBids.map((b) => Number(b.totalQuantity)),
    1,
  )

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="border-border/20 hover:bg-transparent">
            <TableHead className="w-[120px] text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-normal">
              Price (JEWEL)
            </TableHead>
            <TableHead className="text-right text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-normal">
              Quantity
            </TableHead>
            <TableHead className="text-right w-[70px] text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-normal">
              Orders
            </TableHead>
            <TableHead className="w-[130px] text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-normal">
              Depth
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Asks */}
          {visibleAsks.length === 0 && (
            <TableRow className="border-border/10 hover:bg-transparent">
              <TableCell colSpan={4} className="text-center text-muted-foreground/30 text-sm py-6">
                No sell orders
              </TableCell>
            </TableRow>
          )}
          {visibleAsks.map((level) => {
            const depthPercent = (Number(level.totalQuantity) / maxQuantity) * 100
            return (
              <TableRow
                key={`ask-${level.price}`}
                className="border-border/10 hover:bg-sell/[0.03] transition-colors"
              >
                <TableCell className="font-mono text-sm text-sell font-medium">
                  {level.priceDisplay}
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-foreground/70">
                  {formatQuantity(level.totalQuantity, tokenDecimals)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground/40 text-xs font-mono">
                  {level.orderCount}
                </TableCell>
                <TableCell>
                  <div className="w-full h-5 rounded overflow-hidden bg-secondary/20">
                    <div
                      className="h-full rounded depth-sell transition-all duration-300"
                      style={{ width: `${depthPercent}%` }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}

          {/* Spread */}
          <TableRow className="border-border/15 hover:bg-transparent">
            <TableCell colSpan={4} className="text-center py-2.5">
              <Badge
                variant="secondary"
                className="font-mono text-[11px] border-border/20 bg-secondary/30 text-muted-foreground/50"
              >
                {spreadPercent !== null ? `Spread: ${spreadPercent.toFixed(2)}%` : 'No spread data'}
              </Badge>
            </TableCell>
          </TableRow>

          {/* Bids */}
          {visibleBids.length === 0 && (
            <TableRow className="border-border/10 hover:bg-transparent">
              <TableCell colSpan={4} className="text-center text-muted-foreground/30 text-sm py-6">
                No buy orders
              </TableCell>
            </TableRow>
          )}
          {visibleBids.map((level) => {
            const depthPercent = (Number(level.totalQuantity) / maxQuantity) * 100
            return (
              <TableRow
                key={`bid-${level.price}`}
                className="border-border/10 hover:bg-buy/[0.03] transition-colors"
              >
                <TableCell className="font-mono text-sm text-buy font-medium">
                  {level.priceDisplay}
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-foreground/70">
                  {formatQuantity(level.totalQuantity, tokenDecimals)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground/40 text-xs font-mono">
                  {level.orderCount}
                </TableCell>
                <TableCell>
                  <div className="w-full h-5 rounded overflow-hidden bg-secondary/20">
                    <div
                      className="h-full rounded depth-buy transition-all duration-300"
                      style={{ width: `${depthPercent}%` }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
