import { describe, expect, it } from 'vitest'
import {
  validateOrder,
  validatePricePrecision,
  MIN_ORDER_JEWEL,
  MAX_ORDER_JEWEL,
  parseJewel,
} from '../lib/pricing'

describe('validatePricePrecision', () => {
  it('accepts 1–4 significant digit prices', () => {
    expect(validatePricePrecision('1')).toBeNull()
    expect(validatePricePrecision('12')).toBeNull()
    expect(validatePricePrecision('123')).toBeNull()
    expect(validatePricePrecision('1234')).toBeNull()
    expect(validatePricePrecision('0.005')).toBeNull()
    expect(validatePricePrecision('250')).toBeNull()
    expect(validatePricePrecision('0.001234')).toBeNull()
    expect(validatePricePrecision('123.4')).toBeNull()
    expect(validatePricePrecision('1234000')).toBeNull()
  })

  it('rejects 5+ significant digit prices', () => {
    expect(validatePricePrecision('12345')).not.toBeNull()
    expect(validatePricePrecision('123.04')).not.toBeNull()
    expect(validatePricePrecision('123402')).not.toBeNull()
    expect(validatePricePrecision('1.000000001')).not.toBeNull()
  })

  it('rejects empty price', () => {
    expect(validatePricePrecision('')).toBe('Price is required')
    expect(validatePricePrecision('  ')).toBe('Price is required')
  })

  it('rejects non-positive prices', () => {
    expect(validatePricePrecision('0')).toBe('Price must be a positive number')
    expect(validatePricePrecision('-1')).toBe('Price must be a positive number')
    expect(validatePricePrecision('abc')).toBe('Price must be a positive number')
  })
})

describe('validateOrder', () => {
  it('accepts valid order at MIN_ORDER_JEWEL boundary', () => {
    // 1 item at 0.0001 JEWEL = 0.0001 JEWEL total (exactly MIN_ORDER_JEWEL)
    const result = validateOrder({ price: '0.0001', quantity: '1', tokenDecimals: 0 })
    expect(result).toBeNull()
  })

  it('accepts valid order at MAX_ORDER_JEWEL boundary', () => {
    // 1 item at 50000000 JEWEL = 50,000,000 JEWEL total (exactly MAX_ORDER_JEWEL)
    const result = validateOrder({ price: '50000000', quantity: '1', tokenDecimals: 0 })
    expect(result).toBeNull()
  })

  it('rejects order below MIN_ORDER_JEWEL', () => {
    // 1 item at a very tiny price
    const result = validateOrder({ price: '0.00001', quantity: '1', tokenDecimals: 0 })
    expect(result).toContain('at least 0.0001 JEWEL')
  })

  it('rejects order above MAX_ORDER_JEWEL', () => {
    // 2 items at 50000000 JEWEL each = 100,000,000 JEWEL total
    const result = validateOrder({ price: '50000000', quantity: '2', tokenDecimals: 0 })
    expect(result).toContain('cannot exceed 50,000,000 JEWEL')
  })

  it('rejects fractional quantities for 0-decimal tokens', () => {
    const result = validateOrder({ price: '1', quantity: '1.5', tokenDecimals: 0 })
    expect(result).toBe('This item does not support fractional quantities')
  })

  it('accepts fractional quantities for 3-decimal tokens', () => {
    // 1.5 units of a 3-decimal token at 1 JEWEL each
    const result = validateOrder({ price: '1', quantity: '1.5', tokenDecimals: 3 })
    expect(result).toBeNull()
  })

  it('rejects empty price', () => {
    const result = validateOrder({ price: '', quantity: '1', tokenDecimals: 0 })
    expect(result).toBe('Price is required')
  })

  it('rejects empty quantity', () => {
    const result = validateOrder({ price: '1', quantity: '', tokenDecimals: 0 })
    expect(result).toBe('Quantity is required')
  })

  it('rejects non-positive quantity', () => {
    const result = validateOrder({ price: '1', quantity: '0', tokenDecimals: 0 })
    expect(result).toBe('Quantity must be a positive number')
  })

  it('rejects negative quantity', () => {
    const result = validateOrder({ price: '1', quantity: '-5', tokenDecimals: 0 })
    expect(result).toBe('Quantity must be a positive number')
  })

  it('rejects non-numeric quantity', () => {
    const result = validateOrder({ price: '1', quantity: 'abc', tokenDecimals: 0 })
    expect(result).toBe('Quantity must be a positive number')
  })

  it('validates price precision within order validation', () => {
    const result = validateOrder({ price: '12345', quantity: '1', tokenDecimals: 0 })
    expect(result).toContain('4 significant digits')
  })

  it('accepts a typical valid order', () => {
    const result = validateOrder({ price: '0.005', quantity: '100', tokenDecimals: 0 })
    expect(result).toBeNull()
  })
})

describe('MIN_ORDER_JEWEL / MAX_ORDER_JEWEL constants', () => {
  it('MIN_ORDER_JEWEL equals 0.0001 JEWEL in wei', () => {
    expect(MIN_ORDER_JEWEL).toBe(parseJewel('0.0001'))
  })

  it('MAX_ORDER_JEWEL equals 50,000,000 JEWEL in wei', () => {
    expect(MAX_ORDER_JEWEL).toBe(parseJewel('50000000'))
  })
})
