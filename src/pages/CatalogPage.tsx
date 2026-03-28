import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { motion } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  getAllTokens,
  getTokensByCategory,
  getItemImageUrl,
  type ItemCategory,
} from '../config/tokens'
import { useInventory, getBalanceKey, formatBalance } from '../hooks/useInventory'

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'plant', label: 'Plants' },
  { value: 'fish', label: 'Fish' },
  { value: 'crystal', label: 'Crystals' },
  { value: 'stone', label: 'Stones' },
  { value: 'consumable', label: 'Consumables' },
  { value: 'rune', label: 'Runes' },
  { value: 'pet-egg', label: 'Eggs' },
  { value: 'pet-treat', label: 'Treats' },
  { value: 'misc', label: 'Misc' },
]

const CATEGORY_VALUES = new Set(CATEGORIES.map((c) => c.value))

const CATEGORY_ORDER: Record<ItemCategory, number> = {
  plant: 0,
  fish: 1,
  crystal: 2,
  stone: 3,
  rune: 4,
  consumable: 5,
  'pet-egg': 6,
  'pet-treat': 7,
  misc: 8,
}

const WORD_NUMBERS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
}

function sortKey(name: string): [string, number] {
  const lower = name.toLowerCase()
  let base = name
  let tier = 1 // standard

  // Crystal/Stone tiers
  if (lower.startsWith('lesser ')) {
    tier = 0
    base = name.slice(7)
  } else if (lower.startsWith('greater ')) {
    tier = 2
    base = name.slice(8)
  }
  // Potion grouping: "Health Vial" → group "Health", "Full Health Potion" → group "Health"
  else if (lower.startsWith('full ')) {
    tier = 1
    base = name.slice(5).replace(/ Potion$/, '')
  } else if (lower.endsWith(' vial')) {
    tier = 0
    base = name.replace(/ Vial$/, '')
  }
  // Crate grouping: "Health Vial Crate" after "Health Vial"
  else if (lower.endsWith(' crate')) {
    const withoutCrate = name.replace(/ Crate$/, '')
    const inner = sortKey(withoutCrate)
    return [inner[0], inner[1] + 0.5]
  }

  // Convert trailing word-numbers to sortable format: "Page Five" → "Page 05"
  const words = base.split(' ')
  const lastWord = words[words.length - 1]?.toLowerCase() ?? ''
  if (lastWord in WORD_NUMBERS) {
    words[words.length - 1] = String(WORD_NUMBERS[lastWord]).padStart(2, '0')
    base = words.join(' ')
  }

  return [base.toLowerCase(), tier]
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('q') ?? ''
  const rawCat = searchParams.get('category') ?? 'all'
  const activeCategory = CATEGORY_VALUES.has(rawCat) ? rawCat : 'all'
  const { isConnected } = useAccount()
  const { data: inventory } = useInventory()

  const tokens = useMemo(() => {
    let items =
      activeCategory === 'all'
        ? getAllTokens()
        : getTokensByCategory(activeCategory as ItemCategory)

    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        (t) => t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q),
      )
    }

    return items.sort((a, b) => {
      const catCmp = CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category]
      if (catCmp !== 0) return catCmp

      const [aBase, aTier] = sortKey(a.name)
      const [bBase, bTier] = sortKey(b.name)
      const cmp = aBase.localeCompare(bBase)
      return cmp !== 0 ? cmp : aTier - bTier
    })
  }, [activeCategory, search])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-[0.06em] text-foreground">
            The Bazaar
          </h1>
          {isConnected && (
            <Link
              to="/my-orders"
              className="text-xs sm:text-sm text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              My Orders &rarr;
            </Link>
          )}
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1 tracking-wide">
          {tokens.length} items available for trade on DFK Chain
        </p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-10">
        <div className="relative sm:max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => {
              const val = e.target.value
              setSearchParams(
                (prev) => {
                  if (val) {
                    prev.set('q', val)
                  } else {
                    prev.delete('q')
                  }
                  return prev
                },
                { replace: true },
              )
            }}
            className="pl-10 bg-card/60 border-border/40 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/40 h-10"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setSearchParams(
                  (prev) => {
                    if (cat.value === 'all') {
                      prev.delete('category')
                    } else {
                      prev.set('category', cat.value)
                    }
                    return prev
                  },
                  { replace: true },
                )
              }}
              className={`text-[11px] sm:text-xs px-3 sm:px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
                activeCategory === cat.value
                  ? 'filter-pill-active'
                  : 'border-border/40 text-muted-foreground hover:text-foreground hover:border-border/70 hover:bg-secondary/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Wallet nudge */}
      {!isConnected && (
        <p className="text-xs text-muted-foreground/40 mb-4 tracking-wide">
          Connect your wallet to see your inventory
        </p>
      )}

      {/* Item Grid */}
      {tokens.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground/50 text-sm tracking-wide">
          No items found
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.02 } },
          }}
        >
          {tokens.map((token) => (
            <motion.div
              key={token.slug}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Link to={`/item/${token.slug}`}>
                <Card className="group relative overflow-hidden border-border/25 hover:border-primary/30 bg-card/40 hover:bg-card/70 transition-all duration-200 cursor-pointer h-full hover:glow-gold hover:-translate-y-0.5">
                  {inventory?.[getBalanceKey(token)] != null && (
                    <span className="absolute top-1.5 right-1.5 bg-foreground/90 text-background text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md leading-none min-w-[1.25rem] text-center z-10">
                      x{formatBalance(inventory![getBalanceKey(token)] ?? 0n, token.decimals)}
                    </span>
                  )}
                  <CardContent className="p-3 sm:p-4 relative">
                    <div className="aspect-square rounded-lg bg-secondary/15 flex items-center justify-center mb-2 sm:mb-3 overflow-hidden">
                      <img
                        src={getItemImageUrl(token.imageFile)}
                        alt={token.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          if (target.parentElement) {
                            target.parentElement.innerHTML = `<span class="text-xl font-heading font-bold text-muted-foreground/20">${token.name[0]}</span>`
                          }
                        }}
                      />
                    </div>
                    <h3 className="text-[12px] sm:text-[13px] font-medium truncate leading-tight text-foreground group-hover:text-primary transition-colors">
                      {token.name}
                    </h3>
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 block tracking-wider uppercase">
                      {token.category}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
