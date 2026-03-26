/**
 * Format a unix timestamp as a short absolute date.
 * Includes year if not the current year.
 * Returns "—" for falsy values (sentinel for missing timestamps).
 */
export function formatDate(unix: number): string {
  if (!unix) return '—'
  const date = new Date(unix * 1000)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
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
