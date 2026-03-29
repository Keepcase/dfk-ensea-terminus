import { cn } from '@/lib/utils'
import type { StatGenes, VisualGenes } from '../lib/genes'
import {
  STAT_TRAIT_ORDER,
  VISUAL_TRAIT_ORDER,
  STAT_TRAIT_LABELS,
  VISUAL_TRAIT_LABELS,
  resolveStatTrait,
  resolveVisualTraitGendered,
  getGeneTier,
  GENE_TIER_STYLES,
} from '../lib/gene-display'

interface GeneTableStatProps {
  type: 'stat'
  statGenes: StatGenes
  visualGenes?: never
  isFemale?: never
}

interface GeneTableVisualProps {
  type: 'visual'
  visualGenes: VisualGenes
  statGenes?: never
  isFemale: boolean
}

type GeneTableProps = GeneTableStatProps | GeneTableVisualProps

export function GeneTable({ type, statGenes, visualGenes, isFemale }: GeneTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/20">
            <th className="text-left text-xs text-muted-foreground/40 uppercase tracking-wider py-1.5 pr-3 font-normal">
              Trait
            </th>
            <th className="text-left text-xs text-muted-foreground/40 uppercase tracking-wider py-1.5 px-2 font-normal">
              D
            </th>
            <th className="text-left text-xs text-muted-foreground/40 uppercase tracking-wider py-1.5 px-2 font-normal">
              R1
            </th>
            <th className="text-left text-xs text-muted-foreground/40 uppercase tracking-wider py-1.5 px-2 font-normal">
              R2
            </th>
            <th className="text-left text-xs text-muted-foreground/40 uppercase tracking-wider py-1.5 px-2 font-normal">
              R3
            </th>
          </tr>
        </thead>
        <tbody>
          {type === 'stat' && statGenes
            ? STAT_TRAIT_ORDER.map((traitKey) => {
                const slot = statGenes[traitKey]
                const resolved = resolveStatTrait(traitKey, slot)
                const tier = getGeneTier(slot.d)
                const tierStyle = GENE_TIER_STYLES[tier]
                return (
                  <tr key={traitKey} className="border-b border-border/10 last:border-0">
                    <td className="text-sm text-muted-foreground/60 py-1.5 pr-3 whitespace-nowrap">
                      {STAT_TRAIT_LABELS[traitKey]}
                    </td>
                    <td
                      className={cn('text-sm font-medium py-1.5 px-2 whitespace-nowrap', tierStyle)}
                    >
                      {resolved.d}
                    </td>
                    <td className="text-sm text-muted-foreground/40 py-1.5 px-2 whitespace-nowrap">
                      {resolved.r1}
                    </td>
                    <td className="text-sm text-muted-foreground/40 py-1.5 px-2 whitespace-nowrap">
                      {resolved.r2}
                    </td>
                    <td className="text-sm text-muted-foreground/40 py-1.5 px-2 whitespace-nowrap">
                      {resolved.r3}
                    </td>
                  </tr>
                )
              })
            : type === 'visual' && visualGenes
              ? VISUAL_TRAIT_ORDER.map((traitKey) => {
                  const slot = visualGenes[traitKey]
                  const resolved = resolveVisualTraitGendered(traitKey, slot, isFemale ?? false)
                  const isColor = traitKey.toLowerCase().includes('color')
                  return (
                    <tr key={traitKey} className="border-b border-border/10 last:border-0">
                      <td className="text-sm text-muted-foreground/60 py-1.5 pr-3 whitespace-nowrap">
                        {VISUAL_TRAIT_LABELS[traitKey]}
                      </td>
                      <td className="text-sm text-foreground/60 py-1.5 px-2 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          {isColor && resolved.d.startsWith('#') && (
                            <span
                              className="inline-block w-3 h-3 rounded-sm border border-border/30 shrink-0"
                              style={{ backgroundColor: resolved.d }}
                            />
                          )}
                          {resolved.d}
                        </span>
                      </td>
                      <td className="text-sm text-muted-foreground/40 py-1.5 px-2 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          {isColor && resolved.r1.startsWith('#') && (
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-sm border border-border/20 shrink-0"
                              style={{ backgroundColor: resolved.r1 }}
                            />
                          )}
                          {resolved.r1}
                        </span>
                      </td>
                      <td className="text-sm text-muted-foreground/40 py-1.5 px-2 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          {isColor && resolved.r2.startsWith('#') && (
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-sm border border-border/20 shrink-0"
                              style={{ backgroundColor: resolved.r2 }}
                            />
                          )}
                          {resolved.r2}
                        </span>
                      </td>
                      <td className="text-sm text-muted-foreground/40 py-1.5 px-2 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          {isColor && resolved.r3.startsWith('#') && (
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-sm border border-border/20 shrink-0"
                              style={{ backgroundColor: resolved.r3 }}
                            />
                          )}
                          {resolved.r3}
                        </span>
                      </td>
                    </tr>
                  )
                })
              : null}
        </tbody>
      </table>
    </div>
  )
}
