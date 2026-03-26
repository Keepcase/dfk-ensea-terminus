import { describe, expect, it } from 'vitest'
import {
  encodePrice,
  decodePrice,
  calculateTotalPrice,
  parseJewel,
  formatJewel,
  formatJewelDisplay,
  quantityToWei,
  formatQuantity,
} from '../lib/pricing'

describe('parseJewel', () => {
  it('parses whole numbers', () => {
    expect(parseJewel('1')).toBe(1000000000000000000n)
    expect(parseJewel('250')).toBe(250000000000000000000n)
  })

  it('parses decimal numbers', () => {
    expect(parseJewel('0.005')).toBe(5000000000000000n)
    expect(parseJewel('0.16')).toBe(160000000000000000n)
    expect(parseJewel('1.5')).toBe(1500000000000000000n)
  })

  it('parses zero', () => {
    expect(parseJewel('0')).toBe(0n)
    expect(parseJewel('0.0')).toBe(0n)
  })

  it('parses very small values', () => {
    expect(parseJewel('0.0001')).toBe(100000000000000n)
    expect(parseJewel('0.000000000000000001')).toBe(1n)
  })

  it('throws on too many decimals', () => {
    expect(() => parseJewel('0.0000000000000000001')).toThrow()
  })
})

describe('formatJewel', () => {
  it('formats whole numbers', () => {
    expect(formatJewel(1000000000000000000n)).toBe('1')
    expect(formatJewel(250000000000000000000n)).toBe('250')
  })

  it('formats decimal numbers', () => {
    expect(formatJewel(5000000000000000n)).toBe('0.005')
    expect(formatJewel(160000000000000000n)).toBe('0.16')
    expect(formatJewel(1500000000000000000n)).toBe('1.5')
  })

  it('formats zero', () => {
    expect(formatJewel(0n)).toBe('0')
  })

  it('roundtrips with parseJewel', () => {
    const values = ['0.005', '250', '0.0001', '1.5', '0.16', '50000000']
    for (const v of values) {
      expect(formatJewel(parseJewel(v))).toBe(v)
    }
  })
})

describe('formatJewelDisplay', () => {
  it('limits decimal places', () => {
    expect(formatJewelDisplay(5000000000000000n, 4)).toBe('0.005')
    expect(formatJewelDisplay(123456789000000000n, 4)).toBe('0.1234')
    expect(formatJewelDisplay(1000000000000000000n, 4)).toBe('1')
  })
})

describe('encodePrice / decodePrice', () => {
  it('encodes 250 JEWEL correctly', () => {
    // 250 JEWEL = 250 * 10^18 wei, stored as 250 * 10^18 * 10^12 = 250 * 10^30
    const encoded = encodePrice('250')
    expect(encoded).toBe(250000000000000000000000000000000n)
  })

  it('encodes 0.16 JEWEL correctly', () => {
    // 0.16 JEWEL = 160000000000000000 wei, * 10^12 = 160000000000000000000000000000
    const encoded = encodePrice('0.16')
    expect(encoded).toBe(160000000000000000000000000000n)
  })

  it('decodes back to human-readable', () => {
    expect(decodePrice(250000000000000000000000000000000n)).toBe('250')
    expect(decodePrice(160000000000000000000000000000n)).toBe('0.16')
  })

  it('roundtrips encode/decode', () => {
    const prices = ['0.0001', '0.005', '0.16', '1', '250', '50000000']
    for (const p of prices) {
      expect(decodePrice(encodePrice(p))).toBe(p)
    }
  })
})

describe('calculateTotalPrice', () => {
  it('calculates for 0-decimal tokens (most items)', () => {
    // 10 items at 0.005 JEWEL each = 0.05 JEWEL total
    const total = calculateTotalPrice('0.005', 10n, 0)
    expect(total).toBe(parseJewel('0.05'))
  })

  it('calculates for 3-decimal tokens (DFKGOLD)', () => {
    // 1000 DFKGOLD (in wei = 1000000) at 0.001 JEWEL each
    // totalPrice = 0.001 * 10^18 * 1000000 / 10^3 = 1000000000000000000
    const total = calculateTotalPrice('0.001', 1000000n, 3)
    expect(total).toBe(parseJewel('1'))
  })

  it('handles single item purchase', () => {
    // 1 item at 250 JEWEL
    const total = calculateTotalPrice('250', 1n, 0)
    expect(total).toBe(parseJewel('250'))
  })
})

describe('quantityToWei', () => {
  it('handles 0-decimal tokens', () => {
    expect(quantityToWei('5', 0)).toBe(5n)
    expect(quantityToWei('100', 0)).toBe(100n)
  })

  it('handles 3-decimal tokens', () => {
    expect(quantityToWei('5.123', 3)).toBe(5123n)
    expect(quantityToWei('5', 3)).toBe(5000n)
  })

  it('throws on too many decimal places', () => {
    expect(() => quantityToWei('5.1234', 3)).toThrow()
  })

  it('throws on zero or negative', () => {
    expect(() => quantityToWei('0', 0)).toThrow()
  })
})

describe('formatQuantity', () => {
  it('formats 0-decimal tokens', () => {
    expect(formatQuantity(5n, 0)).toBe('5')
  })

  it('formats 3-decimal tokens', () => {
    expect(formatQuantity(5123n, 3)).toBe('5.123')
    expect(formatQuantity(5000n, 3)).toBe('5')
  })
})
