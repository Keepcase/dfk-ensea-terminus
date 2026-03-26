import { useAccount, useDisconnect, useBalance } from 'wagmi'
import { useState } from 'react'
import { Copy, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { WalletModal } from './WalletModal'
import { formatJewelDisplay } from '../lib/pricing'

export function WalletButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)

  if (isConnected && address) {
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
    const jewelBalance = balance
      ? (() => {
          const raw = formatJewelDisplay(balance.value, 2)
          const parts = raw.split('.')
          const whole = parts[0] ?? '0'
          const frac = parts[1]
          const formatted = Number(whole).toLocaleString()
          return frac ? `${formatted}.${frac}` : formatted
        })()
      : '...'

    function copyAddress() {
      navigator.clipboard.writeText(address!)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }

    return (
      <div className="flex items-center gap-1.5">
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-border/30 bg-secondary/30 h-8 px-2.5 text-xs font-mono">
          <img src="/images/jewel.png" alt="JEWEL" className="w-4 h-4" />
          <span className="text-gold/80">{jewelBalance}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border/30 bg-secondary/30 hover:bg-secondary/50 text-foreground/70 hover:text-foreground transition-all h-8 px-2.5 text-xs font-mono outline-none select-none">
            {shortAddress}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-1.5 py-1 font-mono text-xs text-muted-foreground/60 truncate">
              {address}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={copyAddress} className="text-xs cursor-pointer">
              <Copy className="w-3.5 h-3.5 mr-2" />
              {copied ? 'Copied!' : 'Copy Address'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => disconnect()}
              className="text-xs text-destructive cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setShowModal(true)}
        className="h-8 text-xs bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 hover:border-primary/40 transition-all duration-200"
      >
        Connect Wallet
      </Button>
      {showModal && <WalletModal onClose={() => setShowModal(false)} />}
    </>
  )
}
