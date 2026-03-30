import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatTimestamp, formatDate } from '../lib/format'

// Fixed "now" for all tests: 2025-03-26T12:00:00.000Z
const NOW_MS = new Date('2025-03-26T12:00:00.000Z').getTime()
const NOW_UNIX = Math.floor(NOW_MS / 1000)

describe('formatTimestamp', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW_MS)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('falsy input', () => {
    it('returns em dash for 0', () => {
      expect(formatTimestamp(0)).toBe('—')
    })
  })

  describe('just now — within the last minute', () => {
    it('returns "just now" for 0 seconds ago', () => {
      expect(formatTimestamp(NOW_UNIX)).toBe('just now')
    })

    it('returns "just now" for 30 seconds ago', () => {
      expect(formatTimestamp(NOW_UNIX - 30)).toBe('just now')
    })

    it('returns "just now" for 59 seconds ago', () => {
      expect(formatTimestamp(NOW_UNIX - 59)).toBe('just now')
    })
  })

  describe('minutes ago — within the last hour', () => {
    it('returns "1m ago" for exactly 1 minute ago', () => {
      expect(formatTimestamp(NOW_UNIX - 60)).toBe('1m ago')
    })

    it('returns "5m ago" for 5 minutes ago', () => {
      expect(formatTimestamp(NOW_UNIX - 5 * 60)).toBe('5m ago')
    })

    it('returns "59m ago" for 59 minutes ago', () => {
      expect(formatTimestamp(NOW_UNIX - 59 * 60)).toBe('59m ago')
    })
  })

  describe('hours ago — within the last 24 hours', () => {
    it('returns "1h ago" for exactly 1 hour ago', () => {
      expect(formatTimestamp(NOW_UNIX - 3600)).toBe('1h ago')
    })

    it('returns "3h ago" for 3 hours ago', () => {
      expect(formatTimestamp(NOW_UNIX - 3 * 3600)).toBe('3h ago')
    })

    it('returns "23h ago" for 23 hours ago', () => {
      expect(formatTimestamp(NOW_UNIX - 23 * 3600)).toBe('23h ago')
    })
  })

  describe('days ago — within the last 7 days', () => {
    it('returns "1d ago" for exactly 1 day ago', () => {
      expect(formatTimestamp(NOW_UNIX - 86400)).toBe('1d ago')
    })

    it('returns "2d ago" for 2 days ago', () => {
      expect(formatTimestamp(NOW_UNIX - 2 * 86400)).toBe('2d ago')
    })

    it('returns "6d ago" for 6 days ago', () => {
      expect(formatTimestamp(NOW_UNIX - 6 * 86400)).toBe('6d ago')
    })
  })

  describe('older than 7 days — falls back to formatDate', () => {
    it('returns date with year for same year', () => {
      const result = formatTimestamp(NOW_UNIX - 7 * 86400)
      expect(result).toBe('Mar 19, 2025')
    })

    it('returns date with year for 30 days ago (same year)', () => {
      const result = formatTimestamp(NOW_UNIX - 30 * 86400)
      expect(result).toBe('Feb 24, 2025')
    })

    it('returns date with year for a different year', () => {
      const past = Math.floor(new Date('2020-06-15T12:00:00Z').getTime() / 1000)
      expect(formatTimestamp(past)).toBe('Jun 15, 2020')
    })
  })
})

describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW_MS)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns em dash for 0', () => {
    expect(formatDate(0)).toBe('—')
  })

  it('returns date with year for current year', () => {
    const jan1 = Math.floor(new Date('2025-01-15T12:00:00Z').getTime() / 1000)
    expect(formatDate(jan1)).toBe('Jan 15, 2025')
  })

  it('returns date with year for a previous year', () => {
    const past = Math.floor(new Date('2024-09-18T12:00:00Z').getTime() / 1000)
    expect(formatDate(past)).toBe('Sep 18, 2024')
  })

  it('returns date with year for a much older date', () => {
    const past = Math.floor(new Date('2020-06-15T12:00:00Z').getTime() / 1000)
    expect(formatDate(past)).toBe('Jun 15, 2020')
  })
})
