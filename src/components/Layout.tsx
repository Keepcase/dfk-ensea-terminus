import { useState, useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { WalletButton } from './WalletButton'
import { DonateButton } from './DonateButton'
import { MusicPlayer } from './MusicToggle'
import { ScrollToTop } from './ScrollToTop'
import { ThemeToggle } from './ThemeToggle'

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const navLinks = [
    { to: '/', label: 'Bazaar' },
    { to: '/my-heroes', label: 'My Heroes' },
    { to: '/hall-of-heroes', label: 'Hall of Heroes' },
  ]

  function isActive(to: string) {
    return to === '/'
      ? location.pathname === '/' || location.pathname.startsWith('/item/') || location.pathname === '/my-orders'
      : location.pathname === to
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/25 flex items-center justify-center group-hover:border-primary/50 group-hover:glow-gold transition-all duration-300">
              <span className="text-gold font-heading text-xs sm:text-sm font-bold tracking-tight">
                E
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-sm sm:text-[15px] tracking-[0.06em] text-foreground leading-none">
                Ensea Terminus
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground/50 tracking-[0.12em] uppercase leading-none mt-0.5 hidden sm:block">
                DFK Community Tools
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(link.to)
                    ? 'filter-pill-active'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              href="https://github.com/Keepcase/dfk-ensea-terminus"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              <GitHubIcon className="w-4 h-4" />
            </a>
            <ThemeToggle />
            <DonateButton />
            <WalletButton />
          </div>

          {/* Mobile: hamburger only */}
          <div className="flex lg:hidden items-center gap-1">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger className="inline-flex items-center justify-center rounded-lg w-8 h-8 p-0 text-muted-foreground hover:bg-muted transition-colors">
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72 !bg-background">
                <SheetHeader>
                  <SheetTitle className="font-heading tracking-[0.06em]">Ensea Terminus</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-4 mt-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive(link.to)
                          ? 'filter-pill-active'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="flex flex-col gap-3 px-4 mt-6">
                  <WalletButton />
                  <DonateButton />
                </div>
                <div className="flex items-center justify-between px-4 mt-6 pt-4 border-t border-border/30">
                  <ThemeToggle />
                  <a
                    href="https://github.com/Keepcase/dfk-ensea-terminus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <GitHubIcon className="w-4 h-4" />
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full">{children}</main>

      {/* Footer */}
      <Separator className="opacity-20" />
      <footer className="py-5 sm:py-6 pb-16 text-center px-4 space-y-1.5">
        <p className="text-[10px] sm:text-[11px] text-muted-foreground/50 tracking-wide">
          Built by{' '}
          <a
            href="https://x.com/Keepcase"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/60 hover:text-foreground transition-colors"
          >
            @Keepcase
          </a>
        </p>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground/40 tracking-wide">
          Community-built for{' '}
          <a
            href="https://x.com/DeFiKingdoms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/60 hover:text-primary transition-colors"
          >
            @DeFiKingdoms
          </a>
          {' · '}
          <a
            href="https://github.com/Keepcase/dfk-ensea-terminus"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/60 hover:text-primary transition-colors"
          >
            Open Source
          </a>
        </p>
      </footer>

      {/* Floating scroll-to-top */}
      <ScrollToTop />

      {/* Floating music player */}
      <MusicPlayer />
    </div>
  )
}
