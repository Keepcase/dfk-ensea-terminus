import { Heart, Droplet, Mars, Venus, Sparkles, Infinity } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HeroDetails } from '../types/hero'
import { HERO_RARITIES } from '../types/hero'
import { getHeroName, getXpProgress, getCurrentStamina } from '../lib/hero'
import { decodeStatGenes, decodeVisualGenes } from '../lib/genes'
import { resolveStatTrait, resolveVisualTrait } from '../lib/gene-display'
import { getRarityBadge, getRarityHover } from '../lib/rarity'

/** Compact progress bar with label */
function MiniBar({ value, max, color, label, display }: {
  value: number
  max: number
  color: string
  label: string
  display: React.ReactNode
}) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100))
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-muted-foreground/50 w-[3.2rem] shrink-0">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[11px] text-foreground/60 min-w-[2.5rem] text-right shrink-0">{display}</span>
    </div>
  )
}

interface HeroCardProps {
  hero: HeroDetails
  onSelect?: (hero: HeroDetails) => void
}

export function HeroCard({ hero, onSelect }: HeroCardProps) {
  const rarityBadge = getRarityBadge(hero.rarity)
  const rarityHover = getRarityHover(hero.rarity)
  const statGenes = decodeStatGenes(hero.statGenes)
  const mainClassName = resolveStatTrait('class', statGenes.class).d
  const subClassName = resolveStatTrait('subClass', statGenes.subClass).d
  const element = resolveStatTrait('element', statGenes.element).d
  const visualGenes = decodeVisualGenes(hero.visualGenes)
  const background = resolveVisualTrait('background', visualGenes.background).d
  const gender = resolveVisualTrait('gender', visualGenes.gender).d
  const xpProgress = getXpProgress(hero)
  const rarityName = HERO_RARITIES[hero.rarity] ?? 'Unknown'
  const heroName = getHeroName(hero, visualGenes)
  const stamina = getCurrentStamina(hero)

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden transition-all duration-200 border border-border/25 bg-card/40 hover:bg-card/70',
        onSelect && 'cursor-pointer',
        rarityHover,
      )}
      onClick={() => onSelect?.(hero)}
    >
      <div className="p-2.5 flex flex-col gap-1.5">
        {/* Header: ID + Gen */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-foreground/40 font-semibold">
            #{hero.id.toString()}
          </span>
          <span className="text-[10px] text-muted-foreground/35 tracking-wider uppercase font-medium">
            Gen {hero.generation}
          </span>
        </div>

        {/* Portrait placeholder */}
        <div className="aspect-[3/2] rounded-lg bg-secondary/15 flex flex-col items-center justify-center gap-0.5">
          <span className="text-[10px] text-muted-foreground/30 tracking-wider uppercase">
            {gender === 'Female' ? 'Ms.' : 'Mr.'}
          </span>
          <span className="text-2xl font-heading font-bold text-foreground/20 leading-none">
            {heroName.split(' ').map(n => n[0]).join('.') + '.'}
          </span>
        </div>

        {/* Name + Class */}
        <div>
          <p className="text-[13px] font-semibold text-foreground leading-tight flex items-center gap-1">
            <span className="truncate">{heroName}</span>
            <span className="shrink-0" title={gender}>
              {gender === 'Female'
                ? <Venus className="w-3 h-3 text-muted-foreground/50" />
                : <Mars className="w-3 h-3 text-muted-foreground/50" />
              }
            </span>
          </p>
          <p className="text-[10px] text-muted-foreground/55 leading-snug mt-0.5 truncate">
            {mainClassName}
            <span className="text-foreground/20 mx-0.5">·</span>
            {subClassName}
            <span className="text-foreground/20 mx-0.5">·</span>
            {background}
            <span className="text-foreground/20 mx-0.5">·</span>
            {element}
          </p>
        </div>

        {/* Level + Rarity badges + Shiny icon */}
        <div className="flex flex-wrap items-center gap-1 mt-0.5">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
            Lvl {hero.level}
          </span>
          <span className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-full',
            rarityBadge,
          )}>
            {rarityName}
          </span>
          {hero.shiny && (
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400" />
          )}
        </div>

        {/* Stat bars */}
        <div className="space-y-0.5">
          <MiniBar
            label="Summons"
            value={hero.generation === 0 ? 0 : hero.summons}
            max={hero.generation === 0 ? 1 : (hero.maxSummons || 1)}
            color="bg-pink-500 dark:bg-pink-400"
            display={<>{hero.summons}/{hero.generation === 0 ? <Infinity className="w-3.5 h-3.5 inline" /> : hero.maxSummons}</>}
          />
          <MiniBar
            label="Stamina"
            value={stamina.current}
            max={stamina.max}
            color="bg-amber-500"
            display={`${stamina.current}/${stamina.max}`}
          />
          <MiniBar
            label="XP"
            value={xpProgress.current}
            max={xpProgress.needed}
            color="bg-gradient-to-r from-purple-500 to-blue-500"
            display={`${xpProgress.current.toLocaleString()}/${xpProgress.isMaxLevel ? 'MAX' : xpProgress.needed.toLocaleString()}`}
          />
        </div>

        {/* Footer: HP + Hero ID + MP */}
        <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span className="font-mono text-[10px] text-foreground/50">{hero.hp}</span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/25">#{hero.id.toString()}</span>
          <div className="flex items-center gap-1">
            <Droplet className="w-3 h-3 text-blue-500 fill-blue-500" />
            <span className="font-mono text-[10px] text-foreground/50">{hero.mp}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
