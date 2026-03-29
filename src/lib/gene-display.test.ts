import { describe, it, expect } from 'vitest'
import { resolveVisualTrait, resolveStatTrait, getGeneTier } from './gene-display'
import type { GeneSlot } from './genes'

function slot(d: number, r1 = 0, r2 = 0, r3 = 0): GeneSlot {
  return { d, r1, r2, r3 }
}

// ---------------------------------------------------------------------------
// resolveVisualTrait — unknown traits
// ---------------------------------------------------------------------------

describe('resolveVisualTrait — visualUnknown1', () => {
  it('returns raw numeric strings for each slot position', () => {
    const result = resolveVisualTrait('visualUnknown1', slot(5, 10, 15, 20))
    expect(result).toEqual({ d: '5', r1: '10', r2: '15', r3: '20' })
  })

  it('returns "0" string for zero values', () => {
    const result = resolveVisualTrait('visualUnknown1', slot(0))
    expect(result).toEqual({ d: '0', r1: '0', r2: '0', r3: '0' })
  })
})

describe('resolveVisualTrait — visualUnknown2', () => {
  it('returns raw numeric strings for each slot position', () => {
    const result = resolveVisualTrait('visualUnknown2', slot(3, 7, 12, 31))
    expect(result).toEqual({ d: '3', r1: '7', r2: '12', r3: '31' })
  })
})

// ---------------------------------------------------------------------------
// resolveVisualTrait — background
// ---------------------------------------------------------------------------

describe('resolveVisualTrait — background', () => {
  it('resolves Desert (gene value 0)', () => {
    expect(resolveVisualTrait('background', slot(0)).d).toBe('Desert')
  })

  it('resolves Forest (gene value 2)', () => {
    expect(resolveVisualTrait('background', slot(2)).d).toBe('Forest')
  })

  it('resolves Plains (gene value 4)', () => {
    expect(resolveVisualTrait('background', slot(4)).d).toBe('Plains')
  })

  it('resolves Island (gene value 6)', () => {
    expect(resolveVisualTrait('background', slot(6)).d).toBe('Island')
  })

  it('resolves Swamp (gene value 8)', () => {
    expect(resolveVisualTrait('background', slot(8)).d).toBe('Swamp')
  })

  it('resolves Mountains (gene value 10)', () => {
    expect(resolveVisualTrait('background', slot(10)).d).toBe('Mountains')
  })

  it('resolves City (gene value 12)', () => {
    expect(resolveVisualTrait('background', slot(12)).d).toBe('City')
  })

  it('resolves Arctic (gene value 14)', () => {
    expect(resolveVisualTrait('background', slot(14)).d).toBe('Arctic')
  })

  it('resolves odd background values via even-fallback (1 → Desert)', () => {
    // Background uses even keys only; odd 1 falls back to value & ~1 = 0 → Desert
    expect(resolveVisualTrait('background', slot(1)).d).toBe('Desert')
  })

  it('falls back to "ID N" for completely unknown background values', () => {
    expect(resolveVisualTrait('background', slot(99)).d).toBe('ID 99')
  })

  it('resolves all four slot positions independently', () => {
    const result = resolveVisualTrait('background', slot(0, 2, 4, 6))
    expect(result).toEqual({ d: 'Desert', r1: 'Forest', r2: 'Plains', r3: 'Island' })
  })
})

// ---------------------------------------------------------------------------
// resolveVisualTrait — gender
// ---------------------------------------------------------------------------

describe('resolveVisualTrait — gender', () => {
  it('resolves Male (gene value 1)', () => {
    expect(resolveVisualTrait('gender', slot(1)).d).toBe('Male')
  })

  it('resolves Female (gene value 3)', () => {
    expect(resolveVisualTrait('gender', slot(3)).d).toBe('Female')
  })

  it('falls back to "ID N" for unknown gender values', () => {
    expect(resolveVisualTrait('gender', slot(99)).d).toBe('ID 99')
  })
})

// ---------------------------------------------------------------------------
// resolveStatTrait — class (even/odd fallback)
// ---------------------------------------------------------------------------

describe('resolveStatTrait — class', () => {
  it('resolves Warrior (gene value 0)', () => {
    expect(resolveStatTrait('class', slot(0)).d).toBe('Warrior')
  })

  it('resolves Knight for odd gene value 1 (class map has explicit odd entries)', () => {
    // The CLASSES map has an explicit entry for 1 → 'Knight'
    expect(resolveStatTrait('class', slot(1)).d).toBe('Knight')
  })

  it('resolves Paladin (gene value 16)', () => {
    expect(resolveStatTrait('class', slot(16)).d).toBe('Paladin')
  })

  it('falls back to "ID N" for completely unknown class values', () => {
    expect(resolveStatTrait('class', slot(99)).d).toBe('ID 99')
  })
})

// ---------------------------------------------------------------------------
// getGeneTier
// ---------------------------------------------------------------------------

describe('getGeneTier', () => {
  it('returns basic for values 0–15', () => {
    expect(getGeneTier(0)).toBe('basic')
    expect(getGeneTier(15)).toBe('basic')
  })

  it('returns advanced for values 16–23', () => {
    expect(getGeneTier(16)).toBe('advanced')
    expect(getGeneTier(23)).toBe('advanced')
  })

  it('returns elite for values 24–27', () => {
    expect(getGeneTier(24)).toBe('elite')
    expect(getGeneTier(27)).toBe('elite')
  })

  it('returns exalted for values 28–29', () => {
    expect(getGeneTier(28)).toBe('exalted')
    expect(getGeneTier(29)).toBe('exalted')
  })

  it('returns transcendent for value 30+', () => {
    expect(getGeneTier(30)).toBe('transcendent')
    expect(getGeneTier(31)).toBe('transcendent')
  })
})
