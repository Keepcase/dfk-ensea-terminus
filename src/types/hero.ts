import type { Address } from 'viem'
export { CLASSES as HERO_CLASSES } from '../lib/genes'

/** Hero auction data as returned by getAuction/getAuctions on the Hero Auction contract */
export interface HeroAuction {
  seller: Address
  tokenId: bigint
  /** Starting price in CRYSTAL wei (uint128) */
  startingPrice: bigint
  /** Ending price in CRYSTAL wei (uint128) — equals startingPrice for fixed-price listings */
  endingPrice: bigint
  /** Auction duration in seconds (uint64) */
  duration: bigint
  /** Unix timestamp when auction was created (uint64) */
  startedAt: bigint
  /** Predetermined winner address — 0x0 for public listings */
  winner: Address
  /** Whether the auction is still active */
  open: boolean
}

/**
 * Parsed hero metadata from getHeroV3/getHeroesV3.
 *
 * The on-chain return is an 84-word (2688 byte) raw struct.
 * Field offsets verified against deployed contract on DFK Chain.
 */
export interface HeroDetails {
  id: bigint
  summonedTime: number
  nextSummonTime: number
  summonerId: bigint
  assistantId: bigint
  summons: number
  maxSummons: number
  statGenes: bigint
  visualGenes: bigint
  rarity: number
  shiny: boolean
  generation: number
  firstName: number
  lastName: number
  mainClass: number
  subClass: number
  level: number
  xp: number
  staminaFullAt: number
  /** Skill points (matches level) */
  sp: number
  /** Primary stats */
  strength: number
  intelligence: number
  wisdom: number
  luck: number
  agility: number
  vitality: number
  endurance: number
  dexterity: number
  hp: number
  mp: number
  stamina: number
  /** Primary growth rates (values ×100, so 3000 = 30.00%) */
  primaryGrowth: StatGrowth
  /** Secondary growth rates (values ×100) */
  secondaryGrowth: StatGrowth
}

/** Growth rates for 8 primary stats (values ×100, so 3000 = 30.00%) */
export interface StatGrowth {
  strength: number
  dexterity: number
  agility: number
  vitality: number
  intelligence: number
  endurance: number
  wisdom: number
  luck: number
}

/**
 * Word offsets in the getHeroV3 raw return data.
 * Each word is 32 bytes. Used by parseHeroV3().
 */
export const HERO_V3_OFFSETS = {
  id: 0,
  summonedTime: 1,
  nextSummonTime: 2,
  summonerId: 3,
  assistantId: 4,
  summons: 5,
  maxSummons: 6,
  statGenes: 7,
  visualGenes: 8,
  rarity: 9,
  shiny: 10,
  generation: 11,
  firstName: 12,
  lastName: 13,
  mainClass: 14,
  subClass: 15,
  level: 20,
  xp: 21,
  staminaFullAt: 17,
  strength: 25,
  intelligence: 26,
  wisdom: 27,
  luck: 28,
  agility: 29,
  vitality: 30,
  endurance: 31,
  dexterity: 32,
  sp: 23,
  hp: 33,
  mp: 34,
  stamina: 35,
  // Primary growth rates (×100) — struct order: STR, INT, WIS, LCK, AGI, VIT, END, DEX + 6 HP/MP fields
  primaryGrowthStrength: 36,
  primaryGrowthIntelligence: 37,
  primaryGrowthWisdom: 38,
  primaryGrowthLuck: 39,
  primaryGrowthAgility: 40,
  primaryGrowthVitality: 41,
  primaryGrowthEndurance: 42,
  primaryGrowthDexterity: 43,
  // words 44-49: hpSm, hpRg, hpLg, mpSm, mpRg, mpLg (unused)
  // Secondary growth rates (×100) — same field order
  secondaryGrowthStrength: 50,
  secondaryGrowthIntelligence: 51,
  secondaryGrowthWisdom: 52,
  secondaryGrowthLuck: 53,
  secondaryGrowthAgility: 54,
  secondaryGrowthVitality: 55,
  secondaryGrowthEndurance: 56,
  secondaryGrowthDexterity: 57,
  // words 58-63: hpSm, hpRg, hpLg, mpSm, mpRg, mpLg (unused)
} as const

/** Combined hero + auction status for display */
export interface HeroWithAuction {
  hero: HeroDetails
  auction: HeroAuction | null
}

/** Hero rarity ID → display name */
export const HERO_RARITIES: Record<number, string> = {
  0: 'Common',
  1: 'Uncommon',
  2: 'Rare',
  3: 'Legendary',
  4: 'Mythic',
}

/** Marketplace fee: ownerCut = 375 = 3.75% */
export const MARKETPLACE_FEE_BPS = 375
