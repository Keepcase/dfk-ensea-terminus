import { formatDate, formatJewelLocale, truncateAddress } from '../lib/format'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDonationLeaderboard } from '../hooks/useDonationLeaderboard'

const RANK_STYLES: Record<number, string> = {
  1: 'text-amber-700 dark:text-yellow-400',
  2: 'text-zinc-500 dark:text-zinc-300',
  3: 'text-amber-700 dark:text-amber-600',
}

const RANK_LABELS: Record<number, string> = {
  1: '\u{1F451}', // crown emoji
  2: '\u{1F948}', // silver medal
  3: '\u{1F949}', // bronze medal
}

const TH = 'text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-normal'

function StatusCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="border-border/20 bg-card/30 glass">
      <CardContent className="p-16 text-center">{children}</CardContent>
    </Card>
  )
}

function timestampTitle(unix: number): string | undefined {
  return unix ? new Date(unix * 1000).toLocaleString() : undefined
}

export function HallOfHeroesPage() {
  const { data: donors, isLoading, error } = useDonationLeaderboard()

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-[0.06em]">Hall of Heroes</h1>
        <p className="text-muted-foreground/40 text-sm mt-1.5 tracking-wide">
          Brave souls who keep Ensea Terminus running
        </p>
        <p className="text-muted-foreground/30 text-xs mt-1 tracking-wide inline-flex items-center gap-1">
          <img src="/images/jewel.png" alt="" className="w-3 h-3" />
          JEWEL sent to the donation address appears here automatically
        </p>
      </div>

      {isLoading ? (
        <StatusCard>
          <div className="space-y-2">
            <div className="inline-block h-6 w-48 animate-shimmer rounded" />
            <p className="text-muted-foreground/40 text-xs mt-2">Loading donations...</p>
          </div>
        </StatusCard>
      ) : error ? (
        <StatusCard>
          <p className="text-destructive/80 text-sm">Failed to load leaderboard: {error.message}</p>
        </StatusCard>
      ) : !donors || donors.length === 0 ? (
        <StatusCard>
          <p className="text-muted-foreground/40 text-sm">No donations yet — be the first hero!</p>
        </StatusCard>
      ) : (
        <Card className="border-border/20 bg-card/30 glass">
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow className="border-border/20 hover:bg-transparent">
                  <TableHead className={`${TH} w-16`}>Rank</TableHead>
                  <TableHead className={TH}>Hero</TableHead>
                  <TableHead className={`text-right ${TH}`}>
                    <span className="inline-flex items-center justify-end gap-1">
                      <img src="/images/jewel.png" alt="" className="w-3 h-3" />
                      Total JEWEL
                    </span>
                  </TableHead>
                  <TableHead className={`text-right ${TH} hidden sm:table-cell`}>
                    Donations
                  </TableHead>
                  <TableHead className={`text-right ${TH} hidden sm:table-cell`}>First</TableHead>
                  <TableHead className={`text-right ${TH} hidden sm:table-cell`}>Last</TableHead>
                  <TableHead className={`text-right ${TH} sm:hidden`}>Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donors.map((donor, i) => {
                  const rank = i + 1
                  return (
                    <TableRow
                      key={donor.address}
                      className={`border-border/10 transition-colors ${
                        rank <= 3 ? 'hover:bg-primary/5' : 'hover:bg-secondary/5'
                      }`}
                    >
                      <TableCell className="font-mono text-sm">
                        <span className={RANK_STYLES[rank] ?? 'text-foreground/40'}>
                          {RANK_LABELS[rank] ? (
                            <span className="text-base">{RANK_LABELS[rank]}</span>
                          ) : (
                            <span className="pl-0.5">#{rank}</span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`https://subnets.avax.network/defi-kingdoms/address/${donor.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm transition-colors text-foreground/70 hover:text-foreground"
                        >
                          {truncateAddress(donor.address)}
                        </a>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-foreground/70">
                        {formatJewelLocale(donor.totalWei)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-foreground/40 hidden sm:table-cell">
                        {donor.txCount}
                      </TableCell>
                      <TableCell
                        className="text-right text-xs text-foreground/40 font-mono hidden sm:table-cell"
                        title={timestampTitle(donor.firstTimestamp)}
                      >
                        {formatDate(donor.firstTimestamp)}
                      </TableCell>
                      <TableCell
                        className="text-right text-xs text-foreground/40 font-mono hidden sm:table-cell"
                        title={timestampTitle(donor.lastTimestamp)}
                      >
                        {formatDate(donor.lastTimestamp)}
                      </TableCell>
                      <TableCell className="text-right sm:hidden">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[9px] text-foreground/30 font-mono">
                            {donor.txCount} {donor.txCount === 1 ? 'donation' : 'donations'}
                          </span>
                          <span className="text-[9px] text-foreground/30 font-mono">
                            First: {formatDate(donor.firstTimestamp)}
                          </span>
                          <span className="text-[9px] text-foreground/30 font-mono">
                            Last: {formatDate(donor.lastTimestamp)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
