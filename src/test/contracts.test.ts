import { describe, expect, it } from 'vitest'
import { BAZAAR_ADDRESSES, BAZAAR_ABI, ERC20_ABI } from '../config/contracts'

const ethAddressRegex = /^0x[0-9a-fA-F]{40}$/

describe('BAZAAR_ADDRESSES', () => {
  it('has entry for DFK Chain mainnet (chain 53935)', () => {
    expect(BAZAAR_ADDRESSES[53935]).toBeDefined()
  })

  it('mainnet address is valid Ethereum address format', () => {
    expect(ethAddressRegex.test(BAZAAR_ADDRESSES[53935]!)).toBe(true)
  })

  it('all addresses are valid Ethereum address format', () => {
    for (const [chainId, address] of Object.entries(BAZAAR_ADDRESSES)) {
      expect(
        ethAddressRegex.test(address),
        `Chain ${chainId} has invalid address: ${address}`,
      ).toBe(true)
    }
  })

  it('has at least one chain configured', () => {
    expect(Object.keys(BAZAAR_ADDRESSES).length).toBeGreaterThan(0)
  })
})

describe('BAZAAR_ABI', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(BAZAAR_ABI)).toBe(true)
    expect(BAZAAR_ABI.length).toBeGreaterThan(0)
  })

  it('contains expected read functions', () => {
    const functionNames = BAZAAR_ABI.filter((entry) => entry.type === 'function').map(
      (entry) => entry.name,
    )

    expect(functionNames).toContain('getBestOrders')
    expect(functionNames).toContain('getPrices')
    expect(functionNames).toContain('getOrders')
    expect(functionNames).toContain('getUserOpenOrderIds')
  })

  it('contains expected write functions', () => {
    const functionNames = BAZAAR_ABI.filter((entry) => entry.type === 'function').map(
      (entry) => entry.name,
    )

    expect(functionNames).toContain('makeOrders')
    expect(functionNames).toContain('cancelOrders')
    expect(functionNames).toContain('editOrders')
  })

  it('contains expected events', () => {
    const eventNames = BAZAAR_ABI.filter((entry) => entry.type === 'event').map(
      (entry) => entry.name,
    )

    expect(eventNames).toContain('OrderAdded')
    expect(eventNames).toContain('OrderExecuted')
    expect(eventNames).toContain('OrderCancelled')
  })

  it('every entry has a name and type', () => {
    for (const entry of BAZAAR_ABI) {
      expect(entry.name).toBeTruthy()
      expect(entry.type).toBeTruthy()
    }
  })
})

describe('ERC20_ABI', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(ERC20_ABI)).toBe(true)
    expect(ERC20_ABI.length).toBeGreaterThan(0)
  })

  it('contains balanceOf, allowance, and approve', () => {
    const names = ERC20_ABI.map((entry) => entry.name)
    expect(names).toContain('balanceOf')
    expect(names).toContain('allowance')
    expect(names).toContain('approve')
  })
})
