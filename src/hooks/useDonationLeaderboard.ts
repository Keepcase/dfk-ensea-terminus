import { useQuery } from '@tanstack/react-query'

const DONATION_ADDRESS = (
  import.meta.env.VITE_DONATION_ADDRESS ?? '0x0000000000000000000000000000000000000000'
).toLowerCase()

import { GLACIER_BASE } from '../config/network'

interface GlacierAddressField {
  address: string
}

interface GlacierTransaction {
  nativeTransaction: {
    txHash: string
    from: string | GlacierAddressField
    to: string | GlacierAddressField | null
    value: string
    blockTimestamp: number
  }
}

interface GlacierResponse {
  transactions: GlacierTransaction[]
  nextPageToken?: string
}

export interface Donor {
  address: string
  totalWei: bigint
  txCount: number
  lastTimestamp: number
  firstTimestamp: number
}

/**
 * Fetch all incoming native JEWEL transfers to the donation address
 * from the Glacier API, then aggregate by sender.
 */
export function useDonationLeaderboard() {
  return useQuery<Donor[]>({
    queryKey: ['donationLeaderboard', DONATION_ADDRESS],
    enabled: DONATION_ADDRESS !== '0x0000000000000000000000000000000000000000',
    staleTime: 30 * 60_000, // 30 minutes — leaderboard doesn't need to be real-time
    queryFn: async () => {
      const donors = new Map<string, { totalWei: bigint; txCount: number; lastTimestamp: number; firstTimestamp: number }>()

      let pageToken: string | undefined
      let pages = 0

      do {
        const url = new URL(`${GLACIER_BASE}/${DONATION_ADDRESS}/transactions`)
        url.searchParams.set('pageSize', '100')
        if (pageToken) url.searchParams.set('pageToken', pageToken)

        const res = await fetch(url.toString(), {
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) break

        const data: GlacierResponse = await res.json()
        if (!data.transactions?.length) break

        for (const tx of data.transactions) {
          const native = tx.nativeTransaction
          if (!native || !native.value || native.value === '0') continue

          // Glacier returns "to" and "from" as either a string or {address: string}
          const toAddr = typeof native.to === 'string' ? native.to : native.to?.address
          const fromAddr = typeof native.from === 'string' ? native.from : native.from?.address

          // Only count incoming transfers TO the donation address
          if (!toAddr || toAddr.toLowerCase() !== DONATION_ADDRESS) continue
          if (!fromAddr) continue

          const sender = fromAddr.toLowerCase()
          const existing = donors.get(sender)
          const value = BigInt(native.value)

          if (existing) {
            existing.totalWei += value
            existing.txCount += 1
            existing.lastTimestamp = Math.max(existing.lastTimestamp, native.blockTimestamp)
            existing.firstTimestamp = Math.min(existing.firstTimestamp, native.blockTimestamp)
          } else {
            donors.set(sender, {
              totalWei: value,
              txCount: 1,
              lastTimestamp: native.blockTimestamp,
              firstTimestamp: native.blockTimestamp,
            })
          }
        }

        pageToken = data.nextPageToken

        pages++

        // Throttle: 200ms between pages to avoid hammering the API
        if (pageToken) await new Promise((r) => setTimeout(r, 200))
      } while (pageToken && pages < 50) // Safety limit — 50 pages × 100 = 5,000 txns max

      // Sort by total donated (descending)
      return Array.from(donors.entries())
        .map(([address, data]) => ({ address, ...data }))
        .sort((a, b) => (b.totalWei > a.totalWei ? 1 : b.totalWei < a.totalWei ? -1 : 0))
    },
  })
}
