import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAccount } from 'wagmi'
import { LayoutGrid, List } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useUserHeroes } from '../hooks/useUserHeroes'
import { useHeroDetails } from '../hooks/useHeroDetails'
import { useAllHeroDetails } from '../hooks/useAllHeroDetails'
import { HeroCard } from '../components/HeroCard'
import { Table, TableBody } from '@/components/ui/table'
import { HeroListRow, HeroListRowSkeleton, HeroListHeader } from '../components/HeroListRow'
import { HeroDetailSheet } from '../components/HeroDetailSheet'
import { useSyncedScroll } from '../hooks/useSyncedScroll'
import type { HeroDetails } from '../types/hero'

const PAGE_SIZE = 100

function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  const [jumpInput, setJumpInput] = useState('')

  function handleJump(val: string) {
    const num = parseInt(val, 10)
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      onPageChange(num - 1)
    }
    setJumpInput('')
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="px-3 py-2 text-sm rounded-md border border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
      >
        Prev
      </button>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground/60 font-mono tabular-nums">
        <span>Page</span>
        <input
          type="text"
          inputMode="numeric"
          value={jumpInput !== '' ? jumpInput : page + 1}
          onChange={(e) => setJumpInput(e.target.value)}
          onBlur={(e) => handleJump(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleJump((e.target as HTMLInputElement).value)
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          className="w-12 text-center rounded border border-border/30 bg-card/60 text-foreground/80 focus:border-primary/40 focus:outline-none py-1 text-sm"
        />
        <span>of {totalPages}</span>
      </div>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
        className="px-3 py-2 text-sm rounded-md border border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
      >
        Next
      </button>
    </div>
  )
}

type SortField = 'id' | 'gen' | 'rarity' | 'level' | 'summons' | 'xp'
type SortOrder = 'asc' | 'desc'

function SkeletonCard() {
  return (
    <Card className="border-border/25 bg-card/40 h-full overflow-hidden">
      <CardContent className="p-3 sm:p-4 space-y-2.5">
        <div className="flex justify-between">
          <div className="h-3 w-12 rounded bg-secondary/40 animate-pulse" />
          <div className="h-3 w-10 rounded bg-secondary/40 animate-pulse" />
        </div>
        <div className="h-4 w-20 rounded bg-secondary/40 animate-pulse" />
        <div className="h-3 w-16 rounded bg-secondary/30 animate-pulse" />
        <div className="flex gap-1">
          <div className="h-4 w-10 rounded bg-secondary/30 animate-pulse" />
          <div className="h-4 w-14 rounded bg-secondary/30 animate-pulse" />
        </div>
        <div className="h-3 w-20 rounded bg-secondary/20 animate-pulse" />
        <div className="h-8 w-full rounded-md bg-secondary/25 animate-pulse mt-2" />
      </CardContent>
    </Card>
  )
}

export function MyHeroesPage() {
  const { isConnected } = useAccount()

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [detailHero, setDetailHero] = useState<HeroDetails | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const { topRef: tableTopScrollRef, contentRef: tableContentRef } =
    useSyncedScroll<HTMLDivElement>()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      const saved = localStorage.getItem('ensea-terminus-hero-view')
      return saved === 'list' ? 'list' : 'grid'
    } catch {
      return 'grid'
    }
  })

  function toggleView() {
    const next = viewMode === 'grid' ? 'list' : 'grid'
    setViewMode(next)
    try {
      localStorage.setItem('ensea-terminus-hero-view', next)
    } catch {
      /* storage unavailable */
    }
  }

  const { data: allHeroIds = [], isLoading: isLoadingIds } = useUserHeroes()

  const needsGlobalSort = sortField !== 'id'

  // Filter by search (ID match)
  const filteredIds = useMemo(() => {
    const ids = !search.trim()
      ? allHeroIds
      : allHeroIds.filter((id) => id.toString().includes(search.trim()))
    if (sortField === 'id') {
      return [...ids].sort((a, b) => (sortOrder === 'asc' ? (a < b ? -1 : 1) : a > b ? -1 : 1))
    }
    return ids
  }, [allHeroIds, search, sortField, sortOrder])

  // Load ALL hero details when sorting by non-ID fields (cached after first load)
  const { data: allDetails = [], isLoading: isLoadingAll } = useAllHeroDetails(
    filteredIds,
    needsGlobalSort,
  )

  // Sort all details globally when we have them
  const sortedAllDetails = useMemo(() => {
    if (!needsGlobalSort || allDetails.length === 0) return allDetails
    return [...allDetails].sort((a, b) => {
      let aVal: number, bVal: number
      switch (sortField) {
        case 'gen':
          aVal = a.generation
          bVal = b.generation
          break
        case 'rarity':
          aVal = a.rarity
          bVal = b.rarity
          break
        case 'level':
          aVal = a.level
          bVal = b.level
          break
        case 'summons':
          aVal = a.summons
          bVal = b.summons
          break
        case 'xp':
          aVal = a.xp
          bVal = b.xp
          break
        default:
          return 0
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [allDetails, sortField, sortOrder, needsGlobalSort])

  const totalItems = needsGlobalSort ? sortedAllDetails.length : filteredIds.length
  const totalPages = Math.ceil(totalItems / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(0, totalPages - 1))

  // For ID sort: paginate IDs first, fetch details for that page only
  const pageIds = useMemo(() => {
    if (needsGlobalSort) return []
    const start = safePage * PAGE_SIZE
    return filteredIds.slice(start, start + PAGE_SIZE)
  }, [filteredIds, safePage, needsGlobalSort])

  const { data: pageDetails = [], isLoading: isLoadingPage } = useHeroDetails(
    needsGlobalSort ? [] : pageIds,
  )

  // Final heroes to display: slice from global sort or use page-fetched details
  const displayHeroes = useMemo(() => {
    if (needsGlobalSort) {
      const start = safePage * PAGE_SIZE
      return sortedAllDetails.slice(start, start + PAGE_SIZE)
    }
    return pageDetails
  }, [needsGlobalSort, sortedAllDetails, pageDetails, safePage])

  const isLoading =
    isLoadingIds ||
    (needsGlobalSort
      ? isLoadingAll && allDetails.length === 0
      : pageIds.length > 0 && isLoadingPage)
  const isSortLoading = needsGlobalSort && isLoadingAll && allDetails.length === 0

  function handleSelect(hero: HeroDetails) {
    setDetailHero(hero)
    setDetailOpen(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Page header */}
      <div className="mb-6 sm:mb-10">
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-[0.06em] text-foreground">
          My Heroes
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1 tracking-wide">
          {isConnected
            ? isLoadingIds
              ? 'Loading your heroes...'
              : isSortLoading
                ? `Loading details for sorting... ${allDetails.length}/${filteredIds.length}`
                : `You own ${allHeroIds.length} ${allHeroIds.length === 1 ? 'hero' : 'heroes'}`
            : 'View and manage your hero listings on DFK Chain'}
        </p>
      </div>

      {/* Not connected */}
      {!isConnected && (
        <div className="text-center py-20 text-muted-foreground/50 text-sm tracking-wide">
          Connect your wallet to view your heroes
        </div>
      )}

      {isConnected && (
        <>
          {/* Search + Sort controls */}
          <div className="mb-6 sm:mb-8 flex flex-wrap items-center gap-3">
            <div className="relative sm:max-w-xs flex-1 min-w-[160px]">
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
                placeholder="Search by hero ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(0)
                }}
                className="pl-10 bg-card/60 border-border/40 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/40 h-10"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={sortField}
                onChange={(e) => {
                  setSortField(e.target.value as SortField)
                  setPage(0)
                }}
                className="h-10 px-2 rounded-md border border-border/40 bg-card/60 text-xs text-foreground/80 focus:border-primary/40 focus:outline-none cursor-pointer"
              >
                <option value="id">ID</option>
                <option value="gen">Gen</option>
                <option value="rarity">Rarity</option>
                <option value="level">Level</option>
                <option value="summons">Summons</option>
                <option value="xp">XP</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as SortOrder)
                  setPage(0)
                }}
                className="h-10 px-2 rounded-md border border-border/40 bg-card/60 text-xs text-foreground/80 focus:border-primary/40 focus:outline-none cursor-pointer"
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
              <button
                type="button"
                onClick={toggleView}
                title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
                className={cn(
                  'h-10 w-10 flex items-center justify-center rounded-md border transition-colors duration-150 cursor-pointer',
                  'border-border/40 bg-card/60 text-muted-foreground hover:text-foreground hover:border-border/70',
                )}
              >
                {viewMode === 'grid' ? (
                  <List className="w-4 h-4" />
                ) : (
                  <LayoutGrid className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* No heroes */}
          {!isLoadingIds && allHeroIds.length === 0 && (
            <div className="text-center py-20 text-muted-foreground/50 text-sm tracking-wide">
              No heroes found in this wallet
            </div>
          )}

          {/* No search results */}
          {!isLoadingIds && allHeroIds.length > 0 && filteredIds.length === 0 && (
            <div className="text-center py-20 text-muted-foreground/50 text-sm tracking-wide">
              No heroes match "{search}"
            </div>
          )}

          {/* Hero grid / list */}
          {(isLoading || filteredIds.length > 0) && (
            <>
              {/* Pagination — top */}
              <div className="mb-4">
                <PaginationControls
                  page={safePage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>

              <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                  <motion.div
                    key={`grid-${safePage}-${search}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3"
                  >
                    {isLoading
                      ? Array.from({
                          length: Math.min(PAGE_SIZE, pageIds.length || PAGE_SIZE),
                        }).map((_, i) => <SkeletonCard key={i} />)
                      : displayHeroes.map((hero) => (
                          <HeroCard key={hero.id.toString()} hero={hero} onSelect={handleSelect} />
                        ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key={`list-${safePage}-${search}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Top scrollbar mirror */}
                    <div
                      ref={tableTopScrollRef}
                      className="overflow-x-auto"
                      style={{ height: '12px' }}
                    >
                      <div className="min-w-[900px]" style={{ height: '1px' }} />
                    </div>
                    <div
                      ref={tableContentRef}
                      className="overflow-x-auto rounded-lg"
                      style={{ backgroundColor: 'var(--background)' }}
                    >
                      <Table className="min-w-[900px] border-separate border-spacing-0">
                        <HeroListHeader />
                        <TableBody>
                          {isLoading
                            ? Array.from({
                                length: Math.min(PAGE_SIZE, pageIds.length || PAGE_SIZE),
                              }).map((_, i) => <HeroListRowSkeleton key={i} />)
                            : displayHeroes.map((hero) => (
                                <HeroListRow
                                  key={hero.id.toString()}
                                  hero={hero}
                                  onSelect={handleSelect}
                                />
                              ))}
                        </TableBody>
                      </Table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pagination — bottom */}
              <div className="mt-8">
                <PaginationControls
                  page={safePage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* Hero detail sheet/drawer */}
      <HeroDetailSheet hero={detailHero} open={detailOpen} onOpenChange={setDetailOpen} />
    </motion.div>
  )
}
