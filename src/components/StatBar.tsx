import { cn } from '@/lib/utils'

interface StatBarProps {
  label: string
  value: number
  max?: number
  /** Optional content to show instead of just the value */
  displayValue?: React.ReactNode
  /** Bar fill color class (default: gold gradient) */
  barColor?: string
  /** Label color override (e.g., for stat boost highlighting) */
  labelColor?: string
  /** Tooltip text on hover */
  title?: string
  className?: string
}

export function StatBar({
  label,
  value,
  max = 100,
  displayValue,
  barColor,
  labelColor,
  title,
  className,
}: StatBarProps) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100))

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center justify-between">
        <span className={cn('text-sm uppercase tracking-wide cursor-default', labelColor ?? 'text-muted-foreground/60')} title={title}>{label}</span>
        <span className="font-mono text-base font-medium text-foreground/80">
          {displayValue ?? value}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary/30 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            barColor ?? 'bg-gradient-to-r from-primary/60 to-primary/30',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
