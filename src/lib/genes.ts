/**
 * DFK Hero Gene Decoding
 *
 * Pure functional adaptation of DFK's GeneWrapper contract logic.
 * Genes are a uint256 (bigint) encoded in base-32.
 * 48 slots = 12 traits × 4 dominance levels (dominant, r1, r2, r3).
 *
 * Based on DFK's official GeneWrapper. Reference shared by DrZipper.
 * https://discord.com/channels/861728723991527464/979822368081993758/1197614586891882556
 */

// ---------------------------------------------------------------------------
// Lookup maps
// ---------------------------------------------------------------------------

/** Hero class ID → display name */
export const CLASSES: Record<number, string> = {
  0: 'Warrior',
  1: 'Knight',
  2: 'Thief',
  3: 'Archer',
  4: 'Priest',
  5: 'Wizard',
  6: 'Monk',
  7: 'Pirate',
  8: 'Berserker',
  9: 'Seer',
  10: 'Legionnaire',
  11: 'Scholar',
  16: 'Paladin',
  17: 'DarkKnight',
  18: 'Summoner',
  19: 'Ninja',
  20: 'Shapeshifter',
  21: 'Bard',
  24: 'Dragoon',
  25: 'Sage',
  26: 'SpellBow',
  28: 'DreadKnight',
}

/** Profession ID → display name */
export const PROFESSIONS: Record<number, string> = {
  0: 'Mining',
  2: 'Gardening',
  4: 'Fishing',
  6: 'Foraging',
}

/** Element ID → display name */
export const ELEMENTS: Record<number, string> = {
  0: 'Fire',
  2: 'Water',
  4: 'Earth',
  6: 'Wind',
  8: 'Lightning',
  10: 'Ice',
  12: 'Light',
  14: 'Dark',
}

/** Stat boost ID → display name */
export const STAT_BOOSTS: Record<number, string> = {
  0: 'STR',
  2: 'AGI',
  4: 'INT',
  6: 'WIS',
  8: 'LCK',
  10: 'VIT',
  12: 'END',
  14: 'DEX',
}

/** Active skill ID → display name (from DFK GeneWrapper) */
export const ACTIVE_SKILLS: Record<number, string> = {
  0: 'Poisoned Blade',
  1: 'Blinding Winds',
  2: 'Heal',
  3: 'Cleanse',
  4: 'Iron Skin',
  5: 'Speed',
  6: 'Critical Aim',
  7: 'Deathmark',
  16: 'Exhaust',
  17: 'Daze',
  18: 'Explosion',
  19: 'Hardened Shield',
  24: 'Stun',
  25: 'Second Wind',
  28: 'Resurrection',
}

/** Passive skill ID → display name (from DFK GeneWrapper) */
export const PASSIVE_SKILLS: Record<number, string> = {
  0: 'Duelist',
  1: 'Clutch',
  2: 'Foresight',
  3: 'Headstrong',
  4: 'Clear Vision',
  5: 'Fearless',
  6: 'Chatterbox',
  7: 'Stalwart',
  16: 'Leadership',
  17: 'Efficient',
  18: 'Intimidation',
  19: 'Toxic',
  24: 'Giant Slayer',
  25: 'Last Stand',
  28: 'Second Life',
}

/** Crafting skill ID → display name (from DFK GeneWrapper) */
export const CRAFTING_SKILLS: Record<number, string> = {
  0: 'Blacksmithing',
  2: 'Goldsmithing',
  4: 'Armorsmithing',
  6: 'Woodworking',
  8: 'Leatherworking',
  10: 'Tailoring',
  12: 'Enchanting',
  14: 'Alchemy',
}

// ---------------------------------------------------------------------------
// Visual gene lookup maps (from DFK GeneWrapper)
// ---------------------------------------------------------------------------

/** Gender gene values */
export const GENDERS: Record<number, string> = {
  1: 'Male',
  3: 'Female',
}

/** Background gene values */
export const BACKGROUNDS: Record<number, string> = {
  0: 'Desert',
  2: 'Forest',
  4: 'Plains',
  6: 'Island',
  8: 'Swamp',
  10: 'Mountains',
  12: 'City',
  14: 'Arctic',
}

/** Head appendage gene values → display name (from DFK docs) */
export const HEAD_APPENDAGES: Record<number, string> = {
  0: 'None',
  1: 'Kitsune Ears',
  2: 'Satyr Horns',
  3: 'Ram Horns',
  4: 'Imp Horns',
  5: 'Cat Ears',
  6: 'Minotaur Horns',
  7: 'Faun Horns',
  8: 'Draconic Horns',
  9: 'Fae Circlet',
  10: 'Ragfly Antennae',
  11: 'Royal Crown',
  16: 'Jagged Horns',
  17: 'Spindle Horns',
  18: 'Bear Ears',
  19: 'Antennae',
  20: 'Fallen Angel Coronet',
  21: 'Power Horn',
  24: 'Wood Elf Ears',
  25: 'Snow Elf Ears',
  26: 'Cranial Wings',
  28: 'Insight Jewel',
}

/** Back appendage gene values → display name (from DFK docs) */
export const BACK_APPENDAGES: Record<number, string> = {
  0: 'None',
  1: 'Monkey Tail',
  2: 'Cat Tail',
  3: 'Imp Tail',
  4: 'Minotaur Tail',
  5: 'Daishō',
  6: 'Kitsune Tail',
  7: 'Zweihänder',
  8: 'Skeletal Wings',
  9: 'Skeletal Tail',
  10: 'Afflicted Spikes',
  11: "Traveler's Pack",
  16: 'Gryphon Wings',
  17: 'Draconic Wings',
  18: 'Butterfly Wings',
  19: 'Phoenix Wings',
  20: 'Fallen Angel',
  21: 'Crystal Wings',
  24: 'Aura of the Inner Grove',
  25: 'Ancient Orbs',
  26: 'Arachnid Legs',
  28: 'Cecaelia Tentacles',
}

/** Male hair style gene values → display name (from DFK docs) */
export const MALE_HAIR_STYLES: Record<number, string> = {
  0: 'Battle Hawk',
  1: 'Wolf Mane',
  2: 'Enchanter',
  3: 'Wild Growth',
  4: 'Pixel',
  5: 'Sunrise',
  6: 'Bouffant',
  7: 'Agleam Spike',
  8: 'Wayfinder',
  9: 'Faded Topknot',
  10: 'Side Shave',
  11: 'Ronin',
  16: 'Gruff',
  17: 'Rogue Locs',
  18: 'Stone Cold',
  19: "Zinra's Tail",
  20: 'Hedgehog',
  21: 'Delinquent',
  24: 'Skegg',
  25: 'Shinobi',
  26: 'Sanjo',
  28: 'Perfect Form',
}

/** Female hair style gene values → display name (from DFK docs) */
export const FEMALE_HAIR_STYLES: Record<number, string> = {
  0: 'Windswept',
  1: 'Fauna',
  2: 'Enchantress',
  3: 'Pineapple Top',
  4: 'Pixie',
  5: 'Darkweave Plait',
  6: 'Dejanira',
  7: 'Courtly Updo',
  8: 'Centaur Tail',
  9: 'Lamia',
  10: 'Casual Ponytail',
  11: 'Wild Ponytail',
  16: 'Vogue Locs',
  17: 'Twin Vine Loops',
  18: 'Sweeping Willow',
  19: 'Odango',
  20: 'Goddess Locks',
  21: 'Lioness',
  24: 'Ethereal Waterfall',
  25: 'Kunoichi',
  26: 'Bowlcut',
  28: 'Lunar Light Odango',
}

/** Generic visual gene tier names (fallback for unknown visual traits) */
export const VISUAL_TIERS: Record<number, string> = {
  0: 'Basic1',
  1: 'Basic2',
  2: 'Basic3',
  3: 'Basic4',
  4: 'Basic5',
  5: 'Basic6',
  6: 'Basic7',
  7: 'Basic8',
  8: 'Basic9',
  9: 'Basic10',
  10: 'Basic11',
  11: 'Basic12',
  12: 'Basic13',
  13: 'Basic14',
  14: 'Basic15',
  15: 'Basic16',
  16: 'Advanced1',
  17: 'Advanced2',
  18: 'Advanced3',
  19: 'Advanced4',
  20: 'Advanced5',
  21: 'Advanced6',
  22: 'Advanced7',
  23: 'Advanced8',
  24: 'Elite1',
  25: 'Elite2',
  26: 'Elite3',
  27: 'Elite4',
  28: 'Exalted1',
  29: 'Exalted2',
  30: 'Transcendent1',
  31: '31',
}

/** Hair color gene values → hex color codes */
export const HAIR_COLORS: Record<number, string> = {
  0: '#ab9159',
  1: '#af3853',
  2: '#578761',
  3: '#068483',
  4: '#48321e',
  5: '#66489e',
  6: '#ca93a7',
  7: '#62a7e6',
  8: '#c34b1e',
  9: '#326988',
  10: '#513f4f',
  11: '#d48b41',
  16: '#d7bc65',
  17: '#9b68ab',
  18: '#8d6b3a',
  19: '#566377',
  20: '#275435',
  21: '#77b23c',
  24: '#880016',
  25: '#353132',
  26: '#dbfbf5',
  28: '#8f9bb3',
}

/** Eye color gene values → hex color codes */
export const EYE_COLORS: Record<number, string> = {
  0: '#203997',
  2: '#896693',
  4: '#bb3f55',
  6: '#0d7634',
  8: '#8d7136',
  10: '#613d8a',
  12: '#2494a2',
  14: '#a41e12',
}

/** Skin color gene values → hex color codes */
export const SKIN_COLORS: Record<number, string> = {
  0: '#c58135',
  2: '#f1ca9e',
  4: '#985e1c',
  6: '#57340c',
  8: '#e6a861',
  10: '#7b4a11',
  12: '#e5ac91',
  14: '#aa5c38',
  16: '#7db44f',
  18: '#7786b8',
}

/** Appendage color gene values → hex color codes */
export const APPENDAGE_COLORS: Record<number, string> = {
  0: '#c5bfa7',
  1: '#a88b47',
  2: '#58381e',
  3: '#566f7d',
  4: '#2a386d',
  5: '#3f2e40',
  6: '#830e18',
  7: '#6f3a3c',
  8: '#cddef0',
  9: '#df7126',
  10: '#835138',
  11: '#86a637',
  16: '#6b173c',
  17: '#a0304d',
  18: '#78547c',
  19: '#352a51',
  20: '#147256',
  21: '#cf7794',
  24: '#c29d35',
  25: '#211f1f',
  26: '#77b5cf',
  28: '#d7d7d7',
}

// ---------------------------------------------------------------------------
// Trait index maps
// ---------------------------------------------------------------------------

/** Stat gene trait index → field name */
const STAT_TRAIT_NAMES = [
  'class',
  'subClass',
  'profession',
  'passive1',
  'passive2',
  'active1',
  'active2',
  'statBoost1',
  'statBoost2',
  'crafting1',
  'element',
  'crafting2',
] as const

/** Visual gene trait index → field name */
const VISUAL_TRAIT_NAMES = [
  'gender',
  'headAppendage',
  'backAppendage',
  'background',
  'hairStyle',
  'hairColor',
  'visualUnknown1',
  'eyeColor',
  'skinColor',
  'appendageColor',
  'backAppendageColor',
  'visualUnknown2',
] as const

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Dominant + recessive values for a single gene trait */
export interface GeneSlot {
  /** Dominant (expressed) value */
  d: number
  /** First recessive */
  r1: number
  /** Second recessive */
  r2: number
  /** Third recessive */
  r3: number
}

export interface StatGenes {
  class: GeneSlot
  subClass: GeneSlot
  profession: GeneSlot
  passive1: GeneSlot
  passive2: GeneSlot
  active1: GeneSlot
  active2: GeneSlot
  statBoost1: GeneSlot
  statBoost2: GeneSlot
  crafting1: GeneSlot
  element: GeneSlot
  crafting2: GeneSlot
}

export interface VisualGenes {
  gender: GeneSlot
  headAppendage: GeneSlot
  backAppendage: GeneSlot
  background: GeneSlot
  hairStyle: GeneSlot
  hairColor: GeneSlot
  visualUnknown1: GeneSlot
  eyeColor: GeneSlot
  skinColor: GeneSlot
  appendageColor: GeneSlot
  backAppendageColor: GeneSlot
  visualUnknown2: GeneSlot
}

// ---------------------------------------------------------------------------
// Core decoding functions
// ---------------------------------------------------------------------------

/**
 * Convert a gene bigint to a 48-element number array.
 *
 * Matches the GeneWrapper algorithm exactly: extract base-32 digits
 * from least-significant to most-significant, then reverse so index 0
 * is the most significant digit. Pad with leading zeros to 48 elements.
 *
 * Index i maps to trait Math.floor(i / 4), dominance = i % 4
 * (3 = dominant, 2 = r1, 1 = r2, 0 = r3).
 */
export function genesToArray(genes: bigint): number[] {
  const BASE = 32n
  const buf: number[] = []
  let remaining = genes
  while (remaining >= BASE) {
    const mod = remaining % BASE
    buf.unshift(Number(mod))
    remaining = (remaining - mod) / BASE
  }
  buf.unshift(Number(remaining))
  while (buf.length < 48) {
    buf.unshift(0)
  }
  return buf
}

/** Build a GeneSlot from the 48-element array for a given trait index. */
function slotFromArray(arr: number[], traitIndex: number): GeneSlot {
  const base = traitIndex * 4
  return {
    // Slot layout: idx%4 === 0 is r3, 1 is r2, 2 is r1, 3 is dominant
    r3: arr[base]!,
    r2: arr[base + 1]!,
    r1: arr[base + 2]!,
    d: arr[base + 3]!,
  }
}

/** Decode stat genes into named traits with dominant + recessive values. */
export function decodeStatGenes(statGenes: bigint): StatGenes {
  const arr = genesToArray(statGenes)
  return {
    class: slotFromArray(arr, 0),
    subClass: slotFromArray(arr, 1),
    profession: slotFromArray(arr, 2),
    passive1: slotFromArray(arr, 3),
    passive2: slotFromArray(arr, 4),
    active1: slotFromArray(arr, 5),
    active2: slotFromArray(arr, 6),
    statBoost1: slotFromArray(arr, 7),
    statBoost2: slotFromArray(arr, 8),
    crafting1: slotFromArray(arr, 9),
    element: slotFromArray(arr, 10),
    crafting2: slotFromArray(arr, 11),
  }
}

/** Decode visual genes into named traits with dominant + recessive values. */
export function decodeVisualGenes(visualGenes: bigint): VisualGenes {
  const arr = genesToArray(visualGenes)
  return {
    gender: slotFromArray(arr, 0),
    headAppendage: slotFromArray(arr, 1),
    backAppendage: slotFromArray(arr, 2),
    background: slotFromArray(arr, 3),
    hairStyle: slotFromArray(arr, 4),
    hairColor: slotFromArray(arr, 5),
    visualUnknown1: slotFromArray(arr, 6),
    eyeColor: slotFromArray(arr, 7),
    skinColor: slotFromArray(arr, 8),
    appendageColor: slotFromArray(arr, 9),
    backAppendageColor: slotFromArray(arr, 10),
    visualUnknown2: slotFromArray(arr, 11),
  }
}

// Suppress unused variable warnings for the trait name arrays
// (exported for documentation/introspection purposes)
export { STAT_TRAIT_NAMES, VISUAL_TRAIT_NAMES }
