import { formatEther } from 'viem'

/**
 * Truncate an Ethereum address to 0x1234...5678 form.
 */
export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format a JEWEL wei value with locale-aware thousands separators
 * and adaptive decimal places based on magnitude.
 */
export function formatJewelLocale(wei: bigint): string {
  const num = parseFloat(formatEther(wei))
  if (num >= 1000) return num.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (num >= 1) return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
  return num.toLocaleString('en-US', { maximumFractionDigits: 4 })
}

/**
 * Format a unix timestamp as a short absolute date.
 * Returns "—" for falsy values (sentinel for missing timestamps).
 */
export function formatDate(unix: number): string {
  if (!unix) return '—'
  const date = new Date(unix * 1000)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a unix timestamp as a relative time string.
 * Falls back to an absolute date for older timestamps.
 * Returns "—" for falsy values (sentinel for missing timestamps).
 */
export function formatTimestamp(unix: number): string {
  if (!unix) return '—'
  const diffMs = Date.now() - unix * 1000
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(unix)
}
