import type { GeneSlot, StatGenes, VisualGenes } from './genes'
import {
  CLASSES,
  PROFESSIONS,
  ELEMENTS,
  STAT_BOOSTS,
  ACTIVE_SKILLS,
  PASSIVE_SKILLS,
  CRAFTING_SKILLS,
  GENDERS,
  BACKGROUNDS,
  VISUAL_TIERS,
  HEAD_APPENDAGES,
  BACK_APPENDAGES,
  MALE_HAIR_STYLES,
  FEMALE_HAIR_STYLES,
  HAIR_COLORS,
  EYE_COLORS,
  SKIN_COLORS,
  APPENDAGE_COLORS,
} from './genes'

/** Resolved gene slot with human-readable names */
export interface ResolvedGeneSlot {
  d: string
  r1: string
  r2: string
  r3: string
}

/** Gene rarity tier based on numeric ID */
export type GeneTier = 'basic' | 'advanced' | 'elite' | 'exalted' | 'transcendent'

/** Gene tier thresholds: 0-15 basic, 16-23 advanced, 24-27 elite, 28-29 exalted, 30 transcendent */
export function getGeneTier(value: number): GeneTier {
  if (value >= 30) return 'transcendent'
  if (value >= 28) return 'exalted'
  if (value >= 24) return 'elite'
  if (value >= 16) return 'advanced'
  return 'basic'
}

/** Tailwind classes for gene tier badges — theme-aware for readability */
export const GENE_TIER_STYLES: Record<GeneTier, string> = {
  basic: 'text-muted-foreground',
  advanced: 'text-green-600 dark:text-green-400',
  elite: 'text-blue-600 dark:text-blue-400',
  exalted: 'text-purple-600 dark:text-purple-400',
  transcendent: 'text-amber-600 dark:text-yellow-400',
}

/** Lookup table for each stat gene trait */
const STAT_TRAIT_MAPS: Record<keyof StatGenes, Record<number, string>> = {
  class: CLASSES,
  subClass: CLASSES,
  profession: PROFESSIONS,
  passive1: PASSIVE_SKILLS,
  passive2: PASSIVE_SKILLS,
  active1: ACTIVE_SKILLS,
  active2: ACTIVE_SKILLS,
  statBoost1: STAT_BOOSTS,
  statBoost2: STAT_BOOSTS,
  crafting1: CRAFTING_SKILLS,
  element: ELEMENTS,
  crafting2: CRAFTING_SKILLS,
}

/** Lookup table for each visual gene trait */
const VISUAL_TRAIT_MAPS: Record<keyof VisualGenes, Record<number, string>> = {
  gender: GENDERS,
  headAppendage: HEAD_APPENDAGES,
  backAppendage: BACK_APPENDAGES,
  background: BACKGROUNDS,
  hairStyle: MALE_HAIR_STYLES, // Default to male — resolveVisualTrait can override with gender context
  hairColor: HAIR_COLORS,
  visualUnknown1: VISUAL_TIERS,
  eyeColor: EYE_COLORS,
  skinColor: SKIN_COLORS,
  appendageColor: APPENDAGE_COLORS,
  backAppendageColor: APPENDAGE_COLORS,
  visualUnknown2: VISUAL_TIERS,
}

/** Resolve a visual gene slot with gender awareness for hair styles */
export function resolveVisualTraitGendered(
  traitName: keyof VisualGenes,
  slot: GeneSlot,
  isFemale: boolean,
): ResolvedGeneSlot {
  if (traitName === 'hairStyle') {
    const map = isFemale ? FEMALE_HAIR_STYLES : MALE_HAIR_STYLES
    return {
      d: lookupGene(map, slot.d),
      r1: lookupGene(map, slot.r1),
      r2: lookupGene(map, slot.r2),
      r3: lookupGene(map, slot.r3),
    }
  }
  return resolveVisualTrait(traitName, slot)
}

/**
 * Look up a gene value in a map. Some maps (professions, elements, stat boosts,
 * crafting) only have even-numbered keys. Odd gene values are valid variants
 * that map to the same trait as the even number below them.
 */
function lookupGene(map: Record<number, string>, value: number): string {
  return map[value] ?? map[value & ~1] ?? `ID ${value}`
}

/** Resolve a stat gene slot to human-readable names */
export function resolveStatTrait(traitName: keyof StatGenes, slot: GeneSlot): ResolvedGeneSlot {
  const map = STAT_TRAIT_MAPS[traitName]
  return {
    d: lookupGene(map, slot.d),
    r1: lookupGene(map, slot.r1),
    r2: lookupGene(map, slot.r2),
    r3: lookupGene(map, slot.r3),
  }
}

/** Resolve a visual gene slot to human-readable names */
export function resolveVisualTrait(traitName: keyof VisualGenes, slot: GeneSlot): ResolvedGeneSlot {
  // Unknown traits have no official mapping — show raw gene values
  if (traitName === 'visualUnknown1' || traitName === 'visualUnknown2') {
    return {
      d: String(slot.d),
      r1: String(slot.r1),
      r2: String(slot.r2),
      r3: String(slot.r3),
    }
  }
  const map = VISUAL_TRAIT_MAPS[traitName]
  return {
    d: lookupGene(map, slot.d),
    r1: lookupGene(map, slot.r1),
    r2: lookupGene(map, slot.r2),
    r3: lookupGene(map, slot.r3),
  }
}

/** Display labels for stat gene trait names */
export const STAT_TRAIT_LABELS: Record<keyof StatGenes, string> = {
  class: 'Class',
  subClass: 'SubClass',
  profession: 'Profession',
  passive1: 'Passive 1',
  passive2: 'Passive 2',
  active1: 'Active 1',
  active2: 'Active 2',
  statBoost1: 'Stat Boost 1',
  statBoost2: 'Stat Boost 2',
  crafting1: 'Crafting 1',
  element: 'Element',
  crafting2: 'Crafting 2',
}

/** Display labels for visual gene trait names */
export const VISUAL_TRAIT_LABELS: Record<keyof VisualGenes, string> = {
  gender: 'Gender',
  headAppendage: 'Head Appendage',
  backAppendage: 'Back Appendage',
  background: 'Background',
  hairStyle: 'Hair Style',
  hairColor: 'Hair Color',
  visualUnknown1: 'Unknown 1',
  eyeColor: 'Eye Color',
  skinColor: 'Skin Color',
  appendageColor: 'Appendage Color',
  backAppendageColor: 'Back App. Color',
  visualUnknown2: 'Unknown 2',
}

/** Ordered list of stat gene traits for display */
export const STAT_TRAIT_ORDER: (keyof StatGenes)[] = [
  'class',
  'subClass',
  'profession',
  'active1',
  'active2',
  'passive1',
  'passive2',
  'statBoost1',
  'statBoost2',
  'element',
  'crafting1',
  'crafting2',
]

/** Ordered list of visual gene traits for display */
export const VISUAL_TRAIT_ORDER: (keyof VisualGenes)[] = [
  'gender',
  'headAppendage',
  'backAppendage',
  'background',
  'hairStyle',
  'hairColor',
  'eyeColor',
  'skinColor',
  'appendageColor',
  'backAppendageColor',
  'visualUnknown1',
  'visualUnknown2',
]
