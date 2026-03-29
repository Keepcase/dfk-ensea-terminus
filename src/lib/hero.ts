import type { HeroDetails } from '../types/hero'
import { HERO_V3_OFFSETS } from '../types/hero'
import { decodeVisualGenes, type VisualGenes } from './genes'
import { MALE_FIRST_NAMES, FEMALE_FIRST_NAMES, LAST_NAMES } from '../config/hero-names'

/**
 * Parse the uint256[84] array returned by getHeroV3 into a typed HeroDetails.
 *
 * The on-chain function returns a fixed-size array of 84 uint256 words.
 * Each word maps to a field via HERO_V3_OFFSETS.
 */
export function parseHeroV3(words: readonly bigint[]): HeroDetails {
  const o = HERO_V3_OFFSETS
  return {
    id: words[o.id]!,
    summonedTime: Number(words[o.summonedTime]!),
    nextSummonTime: Number(words[o.nextSummonTime]!),
    summonerId: words[o.summonerId]!,
    assistantId: words[o.assistantId]!,
    summons: Number(words[o.summons]!),
    maxSummons: Number(words[o.maxSummons]!),
    statGenes: words[o.statGenes]!,
    visualGenes: words[o.visualGenes]!,
    rarity: Number(words[o.rarity]!),
    shiny: words[o.shiny]! !== 0n,
    generation: Number(words[o.generation]!),
    firstName: Number(words[o.firstName]!),
    lastName: Number(words[o.lastName]!),
    mainClass: Number(words[o.mainClass]!),
    subClass: Number(words[o.subClass]!),
    level: Number(words[o.level]!),
    xp: Number(words[o.xp]!),
    staminaFullAt: Number(words[o.staminaFullAt]!),
    sp: Number(words[o.sp]!),
    strength: Number(words[o.strength]!),
    intelligence: Number(words[o.intelligence]!),
    wisdom: Number(words[o.wisdom]!),
    luck: Number(words[o.luck]!),
    agility: Number(words[o.agility]!),
    vitality: Number(words[o.vitality]!),
    endurance: Number(words[o.endurance]!),
    dexterity: Number(words[o.dexterity]!),
    hp: Number(words[o.hp]!),
    mp: Number(words[o.mp]!),
    stamina: Number(words[o.stamina]!),
    primaryGrowth: {
      strength: Number(words[o.primaryGrowthStrength]!),
      dexterity: Number(words[o.primaryGrowthDexterity]!),
      agility: Number(words[o.primaryGrowthAgility]!),
      vitality: Number(words[o.primaryGrowthVitality]!),
      intelligence: Number(words[o.primaryGrowthIntelligence]!),
      endurance: Number(words[o.primaryGrowthEndurance]!),
      wisdom: Number(words[o.primaryGrowthWisdom]!),
      luck: Number(words[o.primaryGrowthLuck]!),
    },
    secondaryGrowth: {
      strength: Number(words[o.secondaryGrowthStrength]!),
      dexterity: Number(words[o.secondaryGrowthDexterity]!),
      agility: Number(words[o.secondaryGrowthAgility]!),
      vitality: Number(words[o.secondaryGrowthVitality]!),
      intelligence: Number(words[o.secondaryGrowthIntelligence]!),
      endurance: Number(words[o.secondaryGrowthEndurance]!),
      wisdom: Number(words[o.secondaryGrowthWisdom]!),
      luck: Number(words[o.secondaryGrowthLuck]!),
    },
  }
}

/**
 * XP threshold per level — the XP needed to be eligible for leveling up.
 * Cross-referenced with DFK Helper display values.
 * Max level is currently 20.
 */
const MAX_LEVEL = 20

/** XP cap per level — max XP a hero accumulates before being eligible to level up.
 * Derived from on-chain data (max XP observed across 1000+ heroes per level). */
const XP_CAP: Record<number, number> = {
  1: 2000,
  2: 3000,
  3: 4000,
  4: 5000,
  5: 6000,
  6: 8000,
  7: 10000,
  8: 12000,
  9: 16000,
  10: 20000,
  11: 24000,
  12: 28000,
  13: 32000,
  14: 36000,
  15: 40000,
  16: 45000,
  17: 50000,
  18: 55000,
  19: 60000,
  20: 65000,
}

/** Get XP progress for current level. */
export function getXpProgress(hero: HeroDetails): {
  current: number
  needed: number
  isMaxLevel: boolean
} {
  if (hero.level >= MAX_LEVEL) {
    return { current: hero.xp, needed: hero.xp, isMaxLevel: true }
  }
  const needed = XP_CAP[hero.level] ?? hero.level * 4000
  return { current: hero.xp, needed, isMaxLevel: false }
}

/** Compute the sum of all 8 primary stats */
export function getStatScore(hero: HeroDetails): number {
  return (
    hero.strength +
    hero.intelligence +
    hero.wisdom +
    hero.luck +
    hero.agility +
    hero.vitality +
    hero.endurance +
    hero.dexterity
  )
}

const MAX_STAMINA = 25
const SECONDS_PER_STAMINA = 1200 // 20 minutes

/** Get current stamina based on staminaFullAt timestamp */
export function getCurrentStamina(hero: HeroDetails): { current: number; max: number } {
  if (!hero.staminaFullAt) return { current: MAX_STAMINA, max: MAX_STAMINA }
  const now = Math.floor(Date.now() / 1000)
  if (now >= hero.staminaFullAt) return { current: MAX_STAMINA, max: MAX_STAMINA }
  const secsUntilFull = hero.staminaFullAt - now
  return {
    current: Math.max(0, MAX_STAMINA - Math.ceil(secsUntilFull / SECONDS_PER_STAMINA)),
    max: MAX_STAMINA,
  }
}

/**
 * Get a hero's display name from the DFK name tables.
 * Pass pre-decoded visual genes to avoid redundant decoding.
 */
export function getHeroName(hero: HeroDetails, visualGenes?: VisualGenes): string {
  const genes = visualGenes ?? decodeVisualGenes(hero.visualGenes)
  const isFemale = genes.gender.d === 3
  const firstNames = isFemale ? FEMALE_FIRST_NAMES : MALE_FIRST_NAMES
  const first = firstNames[hero.firstName] ?? `Hero`
  const last = LAST_NAMES[hero.lastName] ?? ''
  return last ? `${first} ${last}` : first
}
