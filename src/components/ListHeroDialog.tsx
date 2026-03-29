import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useListHero } from '../hooks/useListHero'
import { useHeroApproval } from '../hooks/useHeroApproval'
import type { HeroDetails } from '../types/hero'
import { HERO_CLASSES, HERO_RARITIES, MARKETPLACE_FEE_BPS } from '../types/hero'

interface ListHeroDialogProps {
  hero: HeroDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const FEE_DISPLAY = (MARKETPLACE_FEE_BPS / 100).toFixed(2)

export function ListHeroDialog({ hero, open, onOpenChange, onSuccess }: ListHeroDialogProps) {
  const [price, setPrice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const { listHero } = useListHero()
  const { isApproved, needsApproval, approveAll } = useHeroApproval()

  if (!hero) return null

  const mainClassName = HERO_CLASSES[hero.mainClass] ?? `Class ${hero.mainClass}`
  const rarityName = HERO_RARITIES[hero.rarity] ?? 'Unknown'
  const priceNum = parseFloat(price)
  const isValidPrice = !isNaN(priceNum) && priceNum > 0

  function handleOpenChange(next: boolean) {
    if (!isSubmitting) {
      if (!next) {
        setPrice('')
        setError(null)
        setTxHash(null)
      }
      onOpenChange(next)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!hero || !isValidPrice) return

    setError(null)
    setIsSubmitting(true)

    try {
      if (needsApproval) {
        await approveAll()
      }

      const result = await listHero(hero.id, price)
      setTxHash(result.hash)
      setPrice('')
      onSuccess()
      // Keep dialog open briefly to show success
      setTimeout(() => {
        onOpenChange(false)
        setTxHash(null)
      }, 2000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed'
      if (msg.includes('User rejected') || msg.includes('user rejected')) {
        setError('Transaction cancelled')
      } else {
        const details = msg.includes('Details:')
          ? msg.split('Details:')[1]?.trim().split('\n')[0]
          : undefined
        const shortMsg = details ?? msg
        setError(shortMsg.length > 200 ? shortMsg.slice(0, 200) + '...' : shortMsg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const buttonLabel = () => {
    if (isSubmitting) {
      return needsApproval && !isApproved ? 'Approving...' : 'Listing...'
    }
    if (needsApproval) return 'Approve & List'
    return 'List for Sale'
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm bg-card border-border/30">
        <DialogHeader>
          <DialogTitle className="font-heading tracking-wide text-foreground">
            List Hero for Sale
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/60 text-xs">
            Set a fixed price in CRYSTAL
          </DialogDescription>
        </DialogHeader>

        {/* Hero summary */}
        <div className="rounded-lg bg-secondary/15 border border-border/20 px-3 py-2.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-foreground/80 font-semibold">
              #{hero.id.toString()}
            </span>
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
              Gen {hero.generation}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">{mainClassName}</p>
          <div className="flex gap-1.5">
            <span className="text-[10px] text-muted-foreground/60">Lvl {hero.level}</span>
            <span className="text-[10px] text-muted-foreground/40">·</span>
            <span className="text-[10px] text-muted-foreground/60">{rarityName}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Price input */}
          <div>
            <label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/40 mb-1.5 block">
              Price (CRYSTAL)
            </label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 100"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={cn(
                'font-mono bg-secondary/20 border-border/30 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 h-10',
                price && !isValidPrice ? 'border-destructive/50' : '',
              )}
              disabled={isSubmitting}
              required
            />
            {price && !isValidPrice && (
              <p className="text-[10px] text-destructive/70 mt-1">Enter a valid price</p>
            )}
          </div>

          {/* Fee notice */}
          <p className="text-[11px] text-muted-foreground/50 bg-secondary/10 border border-border/15 rounded-lg px-3 py-2">
            Marketplace fee: {FEE_DISPLAY}% — deducted from the sale proceeds
          </p>

          {/* Approval notice */}
          {needsApproval && (
            <p className="text-[11px] text-amber-400/70 bg-amber-900/10 border border-amber-800/20 rounded-lg px-3 py-2">
              First-time setup: approval transaction required before listing
            </p>
          )}

          {/* Error */}
          {error && (
            <p className="text-[11px] text-destructive/80 bg-destructive/5 border border-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Success */}
          {txHash && (
            <p className="text-[11px] text-green-400/80 bg-green-900/10 border border-green-800/20 rounded-lg px-3 py-2 font-mono">
              Listed! Tx: {txHash.slice(0, 10)}...
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !isValidPrice}
            className="w-full h-11 font-semibold text-sm rounded-lg bg-primary/90 text-primary-foreground hover:bg-primary transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {buttonLabel()}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
