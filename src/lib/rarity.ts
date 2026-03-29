/** Rarity badge pill styles — shared across HeroCard and HeroListRow */
export const RARITY_BADGES: Record<number, string> = {
  0: 'bg-zinc-300 text-zinc-700 dark:bg-zinc-600 dark:text-zinc-100',
  1: 'bg-green-600 text-white',
  2: 'bg-blue-600 text-white',
  3: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
  4: 'bg-gradient-to-r from-purple-600 to-violet-500 text-white',
}

/** Rarity hover glow for card borders */
export const RARITY_HOVER: Record<number, string> = {
  0: 'hover:border-zinc-300 active:border-zinc-300 dark:hover:border-zinc-500 dark:active:border-zinc-500',
  1: 'hover:border-green-400 active:border-green-400 dark:hover:border-green-500 dark:active:border-green-500',
  2: 'hover:border-blue-400 active:border-blue-400 dark:hover:border-blue-500 dark:active:border-blue-500',
  3: 'hover:border-amber-400 active:border-amber-400 dark:hover:border-amber-500 dark:active:border-amber-500',
  4: 'hover:border-purple-400 active:border-purple-400 dark:hover:border-purple-500 dark:active:border-purple-500',
}

export function getRarityBadge(r: number): string {
  return RARITY_BADGES[r] ?? RARITY_BADGES[0]!
}

export function getRarityHover(r: number): string {
  return RARITY_HOVER[r] ?? RARITY_HOVER[0]!
}
