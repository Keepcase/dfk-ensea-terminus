import { Infinity as InfinityIcon } from 'lucide-react'
import { TableRow, TableCell, TableHead, TableHeader } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { HeroDetails } from '../types/hero'
import { HERO_RARITIES } from '../types/hero'
import { getHeroName, getXpProgress } from '../lib/hero'
import { decodeStatGenes, decodeVisualGenes } from '../lib/genes'
import { resolveStatTrait, resolveVisualTrait } from '../lib/gene-display'
import { getRarityBadge } from '../lib/rarity'

const stickyClass = 'sticky left-0 z-20 whitespace-nowrap border-r border-border/20'
const stickyBg: React.CSSProperties = { backgroundColor: 'var(--background)' }

interface HeroListRowProps {
  hero: HeroDetails
  onSelect?: (hero: HeroDetails) => void
}

export function HeroListRow({ hero, onSelect }: HeroListRowProps) {
  const statGenes = decodeStatGenes(hero.statGenes)
  const visualGenes = decodeVisualGenes(hero.visualGenes)
  const mainClassName = resolveStatTrait('class', statGenes.class).d
  const subClassName = resolveStatTrait('subClass', statGenes.subClass).d
  const element = resolveStatTrait('element', statGenes.element).d
  const background = resolveVisualTrait('background', visualGenes.background).d
  const gender = resolveVisualTrait('gender', visualGenes.gender).d
  const xpProgress = getXpProgress(hero)
  const rarityName = HERO_RARITIES[hero.rarity] ?? 'Unknown'
  const rarityBadge = getRarityBadge(hero.rarity)
  const heroName = getHeroName(hero, visualGenes)

  return (
    <TableRow
      className={cn(
        'bg-background hover:bg-muted/50 transition-colors',
        onSelect && 'cursor-pointer',
      )}
      onClick={() => onSelect?.(hero)}
    >
      <TableCell
        className={cn('font-mono text-[11px] text-foreground/40 font-semibold', stickyClass)}
        style={stickyBg}
      >
        #{hero.id.toString()}
      </TableCell>
      <TableCell className="text-[12px] font-semibold text-foreground max-w-[10rem]">
        <span className="block truncate">{heroName}</span>
      </TableCell>
      <TableCell className="text-[11px] text-muted-foreground/60">
        {gender === 'Female' ? 'F' : 'M'}
      </TableCell>
      <TableCell className="text-[11px]">{mainClassName}</TableCell>
      <TableCell className="text-[11px] text-muted-foreground/60">{subClassName}</TableCell>
      <TableCell className="font-mono text-[11px] text-center">{hero.level}</TableCell>
      <TableCell>
        <span
          className={cn(
            'text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block',
            rarityBadge,
          )}
        >
          {rarityName}
        </span>
      </TableCell>
      <TableCell className="font-mono text-[11px] text-muted-foreground/50 text-center">
        {hero.generation}
      </TableCell>
      <TableCell className="text-[11px] text-muted-foreground/60">{background}</TableCell>
      <TableCell className="text-[11px] text-muted-foreground/60">{element}</TableCell>
      <TableCell className="text-[11px]">
        {hero.shiny ? <span className="text-yellow-500">Yes</span> : ''}
      </TableCell>
      <TableCell className="font-mono text-[11px] text-foreground/50 text-center">
        <span className="flex items-center justify-center gap-0.5">
          {hero.summons}
          <span className="text-foreground/20">/</span>
          {hero.generation === 0 ? <InfinityIcon className="w-3 h-3 inline" /> : hero.maxSummons}
        </span>
      </TableCell>
      <TableCell className="font-mono text-[11px] text-foreground/50 text-center">
        {xpProgress.isMaxLevel
          ? 'MAX'
          : `${xpProgress.current.toLocaleString()}/${xpProgress.needed.toLocaleString()}`}
      </TableCell>
      <TableCell className="font-mono text-[11px] text-foreground/50 text-center">
        {hero.hp}
      </TableCell>
      <TableCell className="font-mono text-[11px] text-foreground/50 text-center">
        {hero.mp}
      </TableCell>
    </TableRow>
  )
}

export function HeroListHeader() {
  const headClass = 'text-[10px] text-muted-foreground/50 uppercase tracking-wider'

  return (
    <TableHeader>
      <TableRow className="bg-background">
        <TableHead className={cn(headClass, stickyClass)} style={stickyBg}>
          ID
        </TableHead>
        <TableHead className={headClass}>Name</TableHead>
        <TableHead className={headClass}>G</TableHead>
        <TableHead className={headClass}>Class</TableHead>
        <TableHead className={headClass}>Subclass</TableHead>
        <TableHead className={cn(headClass, 'text-center')}>Lvl</TableHead>
        <TableHead className={headClass}>Rarity</TableHead>
        <TableHead className={cn(headClass, 'text-center')}>Gen</TableHead>
        <TableHead className={headClass}>Background</TableHead>
        <TableHead className={headClass}>Element</TableHead>
        <TableHead className={headClass}>Shiny</TableHead>
        <TableHead className={cn(headClass, 'text-center')}>Summons</TableHead>
        <TableHead className={cn(headClass, 'text-center')}>XP</TableHead>
        <TableHead className={cn(headClass, 'text-center')}>HP</TableHead>
        <TableHead className={cn(headClass, 'text-center')}>MP</TableHead>
      </TableRow>
    </TableHeader>
  )
}

export function HeroListRowSkeleton() {
  return (
    <TableRow className="bg-background">
      <TableCell className={stickyClass} style={stickyBg}>
        <div className="h-3 w-10 rounded bg-secondary/40 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-3 w-24 rounded bg-secondary/40 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-3 w-4 rounded bg-secondary/30 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-3 w-16 rounded bg-secondary/30 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-3 w-16 rounded bg-secondary/30 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-3 w-6 rounded bg-secondary/30 animate-pulse mx-auto" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-14 rounded-full bg-secondary/30 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-3 w-6 rounded bg-secondary/20 animate-pulse mx-auto" />
      </TableCell>
      <TableCell>
        <div className="h-3 w-16 rounded bg-secondary/20 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-3 w-12 rounded bg-secondary/20 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-3 w-8 rounded bg-secondary/20 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-3 w-10 rounded bg-secondary/20 animate-pulse mx-auto" />
      </TableCell>
      <TableCell>
        <div className="h-3 w-16 rounded bg-secondary/20 animate-pulse mx-auto" />
      </TableCell>
      <TableCell>
        <div className="h-3 w-8 rounded bg-secondary/20 animate-pulse mx-auto" />
      </TableCell>
      <TableCell>
        <div className="h-3 w-8 rounded bg-secondary/20 animate-pulse mx-auto" />
      </TableCell>
    </TableRow>
  )
}
