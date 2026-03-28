import { cn } from '@/lib/utils'
import { Heart, Droplet, Mars, Venus, Sparkles, Infinity } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { getHeroName, getStatScore, getXpProgress, getCurrentStamina } from '../lib/hero'
import { decodeStatGenes, decodeVisualGenes } from '../lib/genes'
import { resolveStatTrait, resolveVisualTrait } from '../lib/gene-display'
import { HERO_RARITIES } from '../types/hero'
import { formatDate, formatTimestamp } from '../lib/format'
import { StatBar } from './StatBar'
import { GeneTable } from './GeneTable'
import type { HeroDetails } from '../types/hero'

/** Badge pill colors matching HeroCard rarity system */
const RARITY_BADGE_STYLES: Record<number, string> = {
  0: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-400/20',
  1: 'bg-green-600 dark:bg-green-600 text-white ring-1 ring-green-500/30',
  2: 'bg-blue-600 dark:bg-blue-500 text-white ring-1 ring-blue-400/30',
  3: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white ring-1 ring-amber-400/30',
  4: 'bg-gradient-to-r from-purple-600 to-violet-500 text-white ring-1 ring-purple-400/30',
}

/** Top border accent matching card rarity */
const RARITY_ACCENT_BORDER: Record<number, string> = {
  0: 'border-t-border/40',
  1: 'border-t-green-500/60',
  2: 'border-t-sky-500/60',
  3: 'border-t-amber-500/60',
  4: 'border-t-purple-500/60',
}

interface HeroDetailSheetProps {
  hero: HeroDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-heading text-sm sm:text-base uppercase tracking-[0.12em] text-muted-foreground/60 mb-3">
      {children}
    </h3>
  )
}

function HeroDetailContent({ hero }: { hero: HeroDetails }) {
  const statGenes = decodeStatGenes(hero.statGenes)
  const visualGenes = decodeVisualGenes(hero.visualGenes)

  // Use genetic class (from statGenes), not the raw struct field — matches DFK's display
  const mainClassName = resolveStatTrait('class', statGenes.class).d
  const subClassName = resolveStatTrait('subClass', statGenes.subClass).d
  const rarityName = HERO_RARITIES[hero.rarity] ?? 'Unknown'
  const rarityStyle = RARITY_BADGE_STYLES[hero.rarity] ?? RARITY_BADGE_STYLES[0]!
  const heroName = getHeroName(hero, visualGenes)
  const statScore = getStatScore(hero)

  const profession = resolveStatTrait('profession', statGenes.profession).d
  const element = resolveStatTrait('element', statGenes.element).d
  const background = resolveVisualTrait('background', visualGenes.background).d
  const gender = resolveVisualTrait('gender', visualGenes.gender).d
  const xpProgress = getXpProgress(hero)

  // Stat boost colors — statBoost1 = green, statBoost2 = blue (per DFK convention)
  // When both land on the same stat = purple (double boost)
  const boost1 = resolveStatTrait('statBoost1', statGenes.statBoost1).d
  const boost2 = resolveStatTrait('statBoost2', statGenes.statBoost2).d
  function statColor(statName: string): string | undefined {
    const isBoost1 = boost1 === statName
    const isBoost2 = boost2 === statName
    if (isBoost1 && isBoost2) return 'text-buy font-bold'
    if (isBoost1) return 'text-buy font-semibold'
    if (isBoost2) return 'text-blue-800 font-semibold dark:text-blue-400'
    return undefined
  }
  function statTooltip(statName: string): string | undefined {
    const isBoost1 = boost1 === statName
    const isBoost2 = boost2 === statName
    if (isBoost1 && isBoost2) return `Stat Boost 1 + 2: bonus to ${statName} growth on level-up`
    if (isBoost1) return `Stat Boost 1: bonus to ${statName} growth on level-up`
    if (isBoost2) return `Stat Boost 2: bonus to ${statName} growth on level-up`
    return undefined
  }

  // Dynamic max for stat bars — use the highest stat value + buffer
  const statValues = [
    hero.strength,
    hero.intelligence,
    hero.wisdom,
    hero.luck,
    hero.agility,
    hero.vitality,
    hero.endurance,
    hero.dexterity,
  ]
  const statMax = Math.max(...statValues, 50)

  // Growth rate color based on value (raw value / 100 = %)
  function growthColor(raw: number): string {
    const pct = raw / 100
    if (pct >= 80) return 'text-buy font-semibold'
    if (pct >= 60) return 'text-buy'
    if (pct >= 40) return 'text-foreground/80'
    if (pct >= 20) return 'text-muted-foreground/60'
    return 'text-muted-foreground/40'
  }

  function fmtGrowth(raw: number): string {
    return (raw / 100).toFixed(2) + '%'
  }

  const stamina = getCurrentStamina(hero)

  return (
    // Two-column layout on desktop, single column on mobile
    <div className="flex flex-col md:flex-row gap-0 min-h-0">

      {/* ── LEFT COLUMN ── */}
      <div className="md:w-[45%] md:border-r md:border-border/20 overflow-y-auto p-5 sm:p-6 space-y-6">

        {/* ── HEADER ── */}
        <div className="space-y-2">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-foreground leading-tight tracking-wide">
              {heroName} <span className="inline-flex align-middle ml-1" title={gender}>{gender === 'Female' ? <Venus className="w-5 h-5 text-muted-foreground/50" /> : <Mars className="w-5 h-5 text-muted-foreground/50" />}</span>
            </h2>
            <span className="font-mono text-sm text-muted-foreground/50">
              #{hero.id.toString()}
            </span>
          </div>

          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
              Gen {hero.generation}
            </span>
            <span className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
              Lvl {hero.level}
            </span>
            <span
              className={cn(
                'text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full',
                rarityStyle,
              )}
            >
              {rarityName}
            </span>
            {hero.shiny && (
              <Sparkles className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
            )}
          </div>

          {/* Class / Subclass */}
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-medium text-foreground">{mainClassName}</span>
            <span className="text-muted-foreground/30 text-base">·</span>
            <span className="text-base sm:text-lg text-muted-foreground/60">{subClassName}</span>
          </div>

          {/* Profession + Element */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs sm:text-sm px-2.5 py-1 rounded-md border bg-secondary/20 text-muted-foreground/70 border-border/20 leading-none">
              {profession}
            </span>
            <span className="text-xs sm:text-sm px-2.5 py-1 rounded-md border bg-secondary/20 text-muted-foreground/70 border-border/20 leading-none">
              {element}
            </span>
            <span className="text-xs sm:text-sm px-2.5 py-1 rounded-md border bg-secondary/20 text-muted-foreground/70 border-border/20 leading-none">
              {background}
            </span>
          </div>
        </div>

        <Separator className="opacity-20" />

        {/* ── VITALS ── */}
        <div>
          <SectionHeader>Vitals</SectionHeader>
          <div className="space-y-3">
            <StatBar
              label="Summons"
              displayValue={<>{hero.summons} / {hero.generation === 0 ? <Infinity className="w-5 h-5 inline" /> : hero.maxSummons}</>}
              value={hero.generation === 0 ? 0 : hero.summons}
              max={hero.generation === 0 ? 1 : (hero.maxSummons || 1)}
              barColor="bg-gradient-to-r from-pink-500/70 to-pink-400/30"
            />
            <StatBar
              label="Stamina"
              displayValue={`${stamina.current} / ${stamina.max}`}
              value={stamina.current}
              max={stamina.max}
              barColor="bg-gradient-to-r from-amber-500/70 to-amber-400/30"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground/60 uppercase tracking-wide">XP</span>
              <span className="font-mono text-base font-medium text-foreground/80">
                {xpProgress.current.toLocaleString()} / {xpProgress.isMaxLevel ? 'MAX' : xpProgress.needed.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-500 dark:text-red-400 fill-red-500 dark:fill-red-400" />
                <span className="font-mono text-base font-medium text-foreground/80">{hero.hp}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-blue-500 dark:text-blue-400 fill-blue-500 dark:fill-blue-400" />
                <span className="font-mono text-base font-medium text-foreground/80">{hero.mp}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="opacity-20" />

        {/* ── PRIMARY STATS ── */}
        <div>
          <SectionHeader>Primary Stats</SectionHeader>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            <StatBar label="STR" value={hero.strength} max={statMax} labelColor={statColor('STR')} title={statTooltip('STR')} />
            <StatBar label="INT" value={hero.intelligence} max={statMax} labelColor={statColor('INT')} title={statTooltip('INT')} />
            <StatBar label="AGI" value={hero.agility} max={statMax} labelColor={statColor('AGI')} title={statTooltip('AGI')} />
            <StatBar label="WIS" value={hero.wisdom} max={statMax} labelColor={statColor('WIS')} title={statTooltip('WIS')} />
            <StatBar label="VIT" value={hero.vitality} max={statMax} labelColor={statColor('VIT')} title={statTooltip('VIT')} />
            <StatBar label="LCK" value={hero.luck} max={statMax} labelColor={statColor('LCK')} title={statTooltip('LCK')} />
            <StatBar label="END" value={hero.endurance} max={statMax} labelColor={statColor('END')} title={statTooltip('END')} />
            <StatBar label="DEX" value={hero.dexterity} max={statMax} labelColor={statColor('DEX')} title={statTooltip('DEX')} />
          </div>
          <div className="mt-3 pt-2 border-t border-border/15 flex items-center justify-between">
            <span className="text-sm text-muted-foreground/50 uppercase tracking-wide">Total Score</span>
            <span className="font-mono text-sm font-bold text-primary">{statScore}</span>
          </div>
        </div>

      </div>

      {/* ── RIGHT COLUMN ── */}
      <div className="md:w-[55%] overflow-y-auto p-5 sm:p-6 space-y-6">

        {/* Separator only visible on mobile between columns */}
        <div className="md:hidden">
          <Separator className="opacity-20" />
        </div>

        {/* ── GROWTH RATES ── */}
        <div>
          <SectionHeader>Growth Rates</SectionHeader>
          <div className="grid grid-cols-2 gap-x-6">
            {/* Primary column */}
            <div>
              <div className="text-xs text-muted-foreground/40 uppercase tracking-wider mb-1.5">Primary</div>
              <div className="space-y-1">
                {(
                  [
                    ['STR', hero.primaryGrowth.strength],
                    ['DEX', hero.primaryGrowth.dexterity],
                    ['AGI', hero.primaryGrowth.agility],
                    ['VIT', hero.primaryGrowth.vitality],
                    ['INT', hero.primaryGrowth.intelligence],
                    ['END', hero.primaryGrowth.endurance],
                    ['WIS', hero.primaryGrowth.wisdom],
                    ['LCK', hero.primaryGrowth.luck],
                  ] as [string, number][]
                ).map(([label, raw]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground/50">{label}</span>
                    <span className={cn('font-mono text-sm', growthColor(raw))}>
                      {fmtGrowth(raw)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary column */}
            <div>
              <div className="text-xs text-muted-foreground/40 uppercase tracking-wider mb-1.5">Secondary</div>
              <div className="space-y-1">
                {(
                  [
                    ['STR', hero.secondaryGrowth.strength],
                    ['DEX', hero.secondaryGrowth.dexterity],
                    ['AGI', hero.secondaryGrowth.agility],
                    ['VIT', hero.secondaryGrowth.vitality],
                    ['INT', hero.secondaryGrowth.intelligence],
                    ['END', hero.secondaryGrowth.endurance],
                    ['WIS', hero.secondaryGrowth.wisdom],
                    ['LCK', hero.secondaryGrowth.luck],
                  ] as [string, number][]
                ).map(([label, raw]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground/50">{label}</span>
                    <span className={cn('font-mono text-sm', growthColor(raw))}>
                      {fmtGrowth(raw)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator className="opacity-20" />

        {/* ── STAT GENES (Genetics) ── */}
        <div>
          <SectionHeader>Genetics</SectionHeader>
          <GeneTable type="stat" statGenes={statGenes} />
        </div>

        <Separator className="opacity-20" />

        {/* ── VISUAL GENES ── */}
        <div>
          <SectionHeader>Visual Genes</SectionHeader>
          <GeneTable type="visual" visualGenes={visualGenes} isFemale={visualGenes.gender.d === 3} />
        </div>

        <Separator className="opacity-20" />

        {/* ── LINEAGE ── */}
        <div className="pb-4">
          <SectionHeader>Lineage</SectionHeader>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground/50">Summoner</span>
              <span className="font-mono text-base text-foreground/70">
                {hero.summonerId === 0n ? 'Origin' : `#${hero.summonerId.toString()}`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground/50">Assistant</span>
              <span className="font-mono text-base text-foreground/70">
                {hero.assistantId === 0n ? 'N/A' : `#${hero.assistantId.toString()}`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground/50">Summoned</span>
              <span className="font-mono text-base text-foreground/70">
                {formatDate(hero.summonedTime)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground/50">Next Summon</span>
              <span className="font-mono text-base text-foreground/70">
                {formatTimestamp(hero.nextSummonTime)}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export function HeroDetailSheet({ hero, open, onOpenChange }: HeroDetailSheetProps) {
  const rarityAccent = hero != null
    ? (RARITY_ACCENT_BORDER[hero.rarity] ?? RARITY_ACCENT_BORDER[0]!)
    : RARITY_ACCENT_BORDER[0]!

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'sm:max-w-7xl w-[95vw] max-h-[90vh] p-0 flex flex-col gap-0 overflow-hidden',
          'border-t-2',
          rarityAccent,
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>
            {hero ? getHeroName(hero) : 'Hero Details'}
          </DialogTitle>
        </DialogHeader>
        {hero && <HeroDetailContent hero={hero} />}
      </DialogContent>
    </Dialog>
  )
}
