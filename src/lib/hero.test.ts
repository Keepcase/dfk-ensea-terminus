import { describe, it, expect, vi, afterEach } from 'vitest'
import { getCurrentStamina, getXpProgress, getStatScore, getHeroName } from './hero'
import type { HeroDetails } from '../types/hero'

// Minimal hero stub — only fill fields relevant to each test
function makeHero(overrides: Partial<HeroDetails>): HeroDetails {
  return {
    id: 1n,
    summonedTime: 0,
    nextSummonTime: 0,
    summonerId: 0n,
    assistantId: 0n,
    summons: 0,
    maxSummons: 0,
    statGenes: 0n,
    visualGenes: 0n,
    rarity: 0,
    shiny: false,
    generation: 0,
    firstName: 0,
    lastName: 0,
    mainClass: 0,
    subClass: 0,
    level: 1,
    xp: 0,
    staminaFullAt: 0,
    sp: 0,
    strength: 10,
    intelligence: 10,
    wisdom: 10,
    luck: 10,
    agility: 10,
    vitality: 10,
    endurance: 10,
    dexterity: 10,
    hp: 100,
    mp: 100,
    stamina: 25,
    primaryGrowth: {
      strength: 3000,
      dexterity: 3000,
      agility: 3000,
      vitality: 3000,
      intelligence: 3000,
      endurance: 3000,
      wisdom: 3000,
      luck: 3000,
    },
    secondaryGrowth: {
      strength: 1000,
      dexterity: 1000,
      agility: 1000,
      vitality: 1000,
      intelligence: 1000,
      endurance: 1000,
      wisdom: 1000,
      luck: 1000,
    },
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// getCurrentStamina
// ---------------------------------------------------------------------------

describe('getCurrentStamina', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns full stamina when staminaFullAt is 0', () => {
    const hero = makeHero({ staminaFullAt: 0 })
    expect(getCurrentStamina(hero)).toEqual({ current: 25, max: 25 })
  })

  it('returns full stamina when staminaFullAt is in the past', () => {
    vi.useFakeTimers()
    const now = 1_700_000_000 // arbitrary Unix timestamp in seconds
    vi.setSystemTime(now * 1000)

    const hero = makeHero({ staminaFullAt: now - 1 })
    expect(getCurrentStamina(hero)).toEqual({ current: 25, max: 25 })
  })

  it('returns full stamina when staminaFullAt equals now', () => {
    vi.useFakeTimers()
    const now = 1_700_000_000
    vi.setSystemTime(now * 1000)

    const hero = makeHero({ staminaFullAt: now })
    expect(getCurrentStamina(hero)).toEqual({ current: 25, max: 25 })
  })

  it('returns 24 stamina when 1 stamina point is recharging (under 1200s left)', () => {
    vi.useFakeTimers()
    const now = 1_700_000_000
    vi.setSystemTime(now * 1000)

    // 600 seconds until full → ceil(600/1200) = 1 missing stamina
    const hero = makeHero({ staminaFullAt: now + 600 })
    expect(getCurrentStamina(hero)).toEqual({ current: 24, max: 25 })
  })

  it('returns 24 stamina when exactly 1200s remain (one full tick)', () => {
    vi.useFakeTimers()
    const now = 1_700_000_000
    vi.setSystemTime(now * 1000)

    const hero = makeHero({ staminaFullAt: now + 1200 })
    expect(getCurrentStamina(hero)).toEqual({ current: 24, max: 25 })
  })

  it('returns 23 stamina when 1201s remain (two ticks needed)', () => {
    vi.useFakeTimers()
    const now = 1_700_000_000
    vi.setSystemTime(now * 1000)

    const hero = makeHero({ staminaFullAt: now + 1201 })
    expect(getCurrentStamina(hero)).toEqual({ current: 23, max: 25 })
  })

  it('returns 0 stamina when fully depleted (25 ticks remain)', () => {
    vi.useFakeTimers()
    const now = 1_700_000_000
    vi.setSystemTime(now * 1000)

    // 25 × 1200 = 30000 seconds until full
    const hero = makeHero({ staminaFullAt: now + 25 * 1200 })
    expect(getCurrentStamina(hero)).toEqual({ current: 0, max: 25 })
  })

  it('never returns negative stamina even for large future timestamps', () => {
    vi.useFakeTimers()
    const now = 1_700_000_000
    vi.setSystemTime(now * 1000)

    const hero = makeHero({ staminaFullAt: now + 999999 })
    const result = getCurrentStamina(hero)
    expect(result.current).toBeGreaterThanOrEqual(0)
    expect(result.max).toBe(25)
  })
})

// ---------------------------------------------------------------------------
// getXpProgress
// ---------------------------------------------------------------------------

describe('getXpProgress', () => {
  it('returns correct needed XP and isMaxLevel false at level 1 with some XP', () => {
    const hero = makeHero({ level: 1, xp: 500 })
    expect(getXpProgress(hero)).toEqual({ current: 500, needed: 2000, isMaxLevel: false })
  })

  it('returns correct needed XP at level 1 with zero XP', () => {
    const hero = makeHero({ level: 1, xp: 0 })
    expect(getXpProgress(hero)).toEqual({ current: 0, needed: 2000, isMaxLevel: false })
  })

  it('returns correct XP cap at mid levels', () => {
    const hero = makeHero({ level: 10, xp: 15000 })
    expect(getXpProgress(hero)).toEqual({ current: 15000, needed: 20000, isMaxLevel: false })
  })

  it('marks level 20 as max level and mirrors current xp as needed', () => {
    const hero = makeHero({ level: 20, xp: 60000 })
    const result = getXpProgress(hero)
    expect(result.isMaxLevel).toBe(true)
    expect(result.current).toBe(60000)
    expect(result.needed).toBe(60000)
  })

  it('marks levels above 20 as max level', () => {
    const hero = makeHero({ level: 21, xp: 65000 })
    expect(getXpProgress(hero).isMaxLevel).toBe(true)
  })

  it('falls back to level * 4000 for unmapped levels', () => {
    // Level 15 is in the map (40000), but an out-of-range level is not
    const hero = makeHero({ level: 15, xp: 0 })
    expect(getXpProgress(hero)).toEqual({ current: 0, needed: 40000, isMaxLevel: false })
  })
})

// ---------------------------------------------------------------------------
// getStatScore
// ---------------------------------------------------------------------------

describe('getStatScore', () => {
  it('sums all 8 primary stats', () => {
    const hero = makeHero({
      strength: 10,
      intelligence: 12,
      wisdom: 8,
      luck: 15,
      agility: 11,
      vitality: 9,
      endurance: 13,
      dexterity: 14,
    })
    // 10+12+8+15+11+9+13+14 = 92
    expect(getStatScore(hero)).toBe(92)
  })

  it('returns 0 when all stats are 0', () => {
    const hero = makeHero({
      strength: 0,
      intelligence: 0,
      wisdom: 0,
      luck: 0,
      agility: 0,
      vitality: 0,
      endurance: 0,
      dexterity: 0,
    })
    expect(getStatScore(hero)).toBe(0)
  })

  it('handles large stat values without overflow', () => {
    const hero = makeHero({
      strength: 999,
      intelligence: 999,
      wisdom: 999,
      luck: 999,
      agility: 999,
      vitality: 999,
      endurance: 999,
      dexterity: 999,
    })
    expect(getStatScore(hero)).toBe(999 * 8)
  })
})

// ---------------------------------------------------------------------------
// getHeroName
// ---------------------------------------------------------------------------

describe('getHeroName', () => {
  it('returns a non-empty string for a male hero (gender d=1)', () => {
    // visualGenes = 0 → gender slot dominant = 0 (not 3), treated as male
    const hero = makeHero({ visualGenes: 0n, firstName: 0, lastName: 0 })
    const name = getHeroName(hero)
    expect(typeof name).toBe('string')
    expect(name.length).toBeGreaterThan(0)
  })

  it('returns a non-empty string for a female hero when gender d=3', () => {
    // Build a minimal VisualGenes stub where gender.d = 3 (female)
    const femaleVisualGenes = {
      gender: { d: 3, r1: 1, r2: 1, r3: 1 },
      headAppendage: { d: 0, r1: 0, r2: 0, r3: 0 },
      backAppendage: { d: 0, r1: 0, r2: 0, r3: 0 },
      background: { d: 0, r1: 0, r2: 0, r3: 0 },
      hairStyle: { d: 0, r1: 0, r2: 0, r3: 0 },
      hairColor: { d: 0, r1: 0, r2: 0, r3: 0 },
      visualUnknown1: { d: 0, r1: 0, r2: 0, r3: 0 },
      eyeColor: { d: 0, r1: 0, r2: 0, r3: 0 },
      skinColor: { d: 0, r1: 0, r2: 0, r3: 0 },
      appendageColor: { d: 0, r1: 0, r2: 0, r3: 0 },
      backAppendageColor: { d: 0, r1: 0, r2: 0, r3: 0 },
      visualUnknown2: { d: 0, r1: 0, r2: 0, r3: 0 },
    }
    const hero = makeHero({ firstName: 0, lastName: 0 })
    const name = getHeroName(hero, femaleVisualGenes)
    expect(typeof name).toBe('string')
    expect(name.length).toBeGreaterThan(0)
  })

  it('falls back to "Hero" for an out-of-range firstName index', () => {
    const hero = makeHero({ visualGenes: 0n, firstName: 99999, lastName: 0 })
    const name = getHeroName(hero)
    // firstName index 99999 is beyond any name array — should start with "Hero"
    expect(name.startsWith('Hero')).toBe(true)
  })

  it('omits last name when lastName index is out of range', () => {
    const hero = makeHero({ visualGenes: 0n, firstName: 0, lastName: 99999 })
    const name = getHeroName(hero)
    // Should not contain a trailing space or undefined
    expect(name).not.toContain('undefined')
    expect(name.trim()).toBe(name)
  })

  it('pre-decoded visualGenes avoids re-decoding and still produces a name', () => {
    const maleVisualGenes = {
      gender: { d: 1, r1: 1, r2: 1, r3: 1 },
      headAppendage: { d: 0, r1: 0, r2: 0, r3: 0 },
      backAppendage: { d: 0, r1: 0, r2: 0, r3: 0 },
      background: { d: 0, r1: 0, r2: 0, r3: 0 },
      hairStyle: { d: 0, r1: 0, r2: 0, r3: 0 },
      hairColor: { d: 0, r1: 0, r2: 0, r3: 0 },
      visualUnknown1: { d: 0, r1: 0, r2: 0, r3: 0 },
      eyeColor: { d: 0, r1: 0, r2: 0, r3: 0 },
      skinColor: { d: 0, r1: 0, r2: 0, r3: 0 },
      appendageColor: { d: 0, r1: 0, r2: 0, r3: 0 },
      backAppendageColor: { d: 0, r1: 0, r2: 0, r3: 0 },
      visualUnknown2: { d: 0, r1: 0, r2: 0, r3: 0 },
    }
    const hero = makeHero({ firstName: 5, lastName: 5 })
    const nameWithDecoded = getHeroName(hero, maleVisualGenes)
    // Should match calling without pre-decoded genes (both use visualGenes = 0n which decodes male)
    const heroWithGenes = makeHero({ visualGenes: 0n, firstName: 5, lastName: 5 })
    const nameWithoutDecoded = getHeroName(heroWithGenes)
    expect(nameWithDecoded).toBe(nameWithoutDecoded)
  })
})
