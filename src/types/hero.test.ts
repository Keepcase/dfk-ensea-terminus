import { describe, it, expect } from 'vitest'
import { HERO_V3_OFFSETS } from './hero'

// ---------------------------------------------------------------------------
// HERO_V3_OFFSETS — structural integrity checks
// ---------------------------------------------------------------------------

describe('HERO_V3_OFFSETS', () => {
  // -------------------------------------------------------------------------
  // Primary growth offsets: STR=36, INT=37, WIS=38, LCK=39, AGI=40, VIT=41, END=42, DEX=43
  // -------------------------------------------------------------------------

  describe('primary growth offsets start at word 36', () => {
    it('primaryGrowthStrength is at word 36', () => {
      expect(HERO_V3_OFFSETS.primaryGrowthStrength).toBe(36)
    })

    it('primaryGrowthIntelligence is at word 37', () => {
      expect(HERO_V3_OFFSETS.primaryGrowthIntelligence).toBe(37)
    })

    it('primaryGrowthWisdom is at word 38', () => {
      expect(HERO_V3_OFFSETS.primaryGrowthWisdom).toBe(38)
    })

    it('primaryGrowthLuck is at word 39', () => {
      expect(HERO_V3_OFFSETS.primaryGrowthLuck).toBe(39)
    })

    it('primaryGrowthAgility is at word 40', () => {
      expect(HERO_V3_OFFSETS.primaryGrowthAgility).toBe(40)
    })

    it('primaryGrowthVitality is at word 41', () => {
      expect(HERO_V3_OFFSETS.primaryGrowthVitality).toBe(41)
    })

    it('primaryGrowthEndurance is at word 42', () => {
      expect(HERO_V3_OFFSETS.primaryGrowthEndurance).toBe(42)
    })

    it('primaryGrowthDexterity is at word 43', () => {
      expect(HERO_V3_OFFSETS.primaryGrowthDexterity).toBe(43)
    })
  })

  // -------------------------------------------------------------------------
  // Secondary growth offsets: STR=50, INT=51, WIS=52, LCK=53, AGI=54, VIT=55, END=56, DEX=57
  // -------------------------------------------------------------------------

  describe('secondary growth offsets start at word 50', () => {
    it('secondaryGrowthStrength is at word 50', () => {
      expect(HERO_V3_OFFSETS.secondaryGrowthStrength).toBe(50)
    })

    it('secondaryGrowthIntelligence is at word 51', () => {
      expect(HERO_V3_OFFSETS.secondaryGrowthIntelligence).toBe(51)
    })

    it('secondaryGrowthWisdom is at word 52', () => {
      expect(HERO_V3_OFFSETS.secondaryGrowthWisdom).toBe(52)
    })

    it('secondaryGrowthLuck is at word 53', () => {
      expect(HERO_V3_OFFSETS.secondaryGrowthLuck).toBe(53)
    })

    it('secondaryGrowthAgility is at word 54', () => {
      expect(HERO_V3_OFFSETS.secondaryGrowthAgility).toBe(54)
    })

    it('secondaryGrowthVitality is at word 55', () => {
      expect(HERO_V3_OFFSETS.secondaryGrowthVitality).toBe(55)
    })

    it('secondaryGrowthEndurance is at word 56', () => {
      expect(HERO_V3_OFFSETS.secondaryGrowthEndurance).toBe(56)
    })

    it('secondaryGrowthDexterity is at word 57', () => {
      expect(HERO_V3_OFFSETS.secondaryGrowthDexterity).toBe(57)
    })
  })

  // -------------------------------------------------------------------------
  // Secondary growth must be exactly 14 words after primary (gap for 6 HP/MP words)
  // -------------------------------------------------------------------------

  it('secondary growth block is offset from primary by exactly 14 words', () => {
    expect(HERO_V3_OFFSETS.secondaryGrowthStrength - HERO_V3_OFFSETS.primaryGrowthStrength).toBe(14)
    expect(HERO_V3_OFFSETS.secondaryGrowthDexterity - HERO_V3_OFFSETS.primaryGrowthDexterity).toBe(14)
  })

  // -------------------------------------------------------------------------
  // Core field sanity checks
  // -------------------------------------------------------------------------

  it('id is at word 0', () => {
    expect(HERO_V3_OFFSETS.id).toBe(0)
  })

  it('statGenes is at word 7', () => {
    expect(HERO_V3_OFFSETS.statGenes).toBe(7)
  })

  it('visualGenes is at word 8', () => {
    expect(HERO_V3_OFFSETS.visualGenes).toBe(8)
  })

  it('level is at word 20', () => {
    expect(HERO_V3_OFFSETS.level).toBe(20)
  })

  it('xp is at word 21', () => {
    expect(HERO_V3_OFFSETS.xp).toBe(21)
  })

  it('stamina is at word 35', () => {
    expect(HERO_V3_OFFSETS.stamina).toBe(35)
  })

  // -------------------------------------------------------------------------
  // No duplicate offset values (each word maps to exactly one field)
  // -------------------------------------------------------------------------

  it('has no duplicate offset values', () => {
    const values = Object.values(HERO_V3_OFFSETS)
    const unique = new Set(values)
    expect(unique.size).toBe(values.length)
  })

  // -------------------------------------------------------------------------
  // All offsets are non-negative integers within the 84-word struct
  // -------------------------------------------------------------------------

  it('all offsets are non-negative integers within the 84-word struct boundary', () => {
    for (const [field, offset] of Object.entries(HERO_V3_OFFSETS)) {
      expect(offset, `${field} offset ${offset} should be >= 0`).toBeGreaterThanOrEqual(0)
      expect(offset, `${field} offset ${offset} should be < 84`).toBeLessThan(84)
      expect(Number.isInteger(offset), `${field} offset should be an integer`).toBe(true)
    }
  })
})
