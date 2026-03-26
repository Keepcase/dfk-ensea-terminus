import { describe, expect, it } from 'vitest'
import { TOKENS, type ItemCategory } from '../config/tokens'

const VALID_CATEGORIES: ItemCategory[] = [
  'plant',
  'fish',
  'crystal',
  'stone',
  'rune',
  'pet-egg',
  'pet-treat',
  'consumable',
  'misc',
]

const tokenEntries = Object.entries(TOKENS)

describe('TOKENS config integrity', () => {
  it('has at least one token defined', () => {
    expect(tokenEntries.length).toBeGreaterThan(0)
  })

  it('every token has required fields', () => {
    for (const [key, token] of tokenEntries) {
      expect(token.symbol, `${key} missing symbol`).toBeTruthy()
      expect(token.name, `${key} missing name`).toBeTruthy()
      expect(token.address, `${key} missing address`).toBeTruthy()
      expect(typeof token.decimals, `${key} decimals not a number`).toBe('number')
      expect(token.category, `${key} missing category`).toBeTruthy()
      expect(token.imageFile, `${key} missing imageFile`).toBeTruthy()
    }
  })

  it('all addresses are valid Ethereum addresses (0x prefix, 42 chars)', () => {
    const ethAddressRegex = /^0x[0-9a-fA-F]{40}$/
    for (const [key, token] of tokenEntries) {
      expect(
        ethAddressRegex.test(token.address),
        `${key} has invalid address: ${token.address}`,
      ).toBe(true)
    }
  })

  it('no duplicate keys', () => {
    const keys = tokenEntries.map(([k]) => k)
    const uniqueKeys = new Set(keys)
    expect(uniqueKeys.size, 'Duplicate keys found').toBe(keys.length)
  })

  it('all categories are valid ItemCategory values', () => {
    for (const [key, token] of tokenEntries) {
      expect(
        VALID_CATEGORIES.includes(token.category),
        `${key} has invalid category: ${token.category}`,
      ).toBe(true)
    }
  })

  it('decimals are non-negative integers', () => {
    for (const [key, token] of tokenEntries) {
      expect(token.decimals, `${key} has negative decimals`).toBeGreaterThanOrEqual(0)
      expect(Number.isInteger(token.decimals), `${key} decimals is not an integer`).toBe(true)
    }
  })

  it('keys start with lowercase symbol', () => {
    for (const [key, token] of tokenEntries) {
      expect(
        key.startsWith(token.symbol.toLowerCase()),
        `Key ${key} does not start with lowercase symbol ${token.symbol}`,
      ).toBe(true)
    }
  })
})
