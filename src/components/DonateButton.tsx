import { useState } from 'react'
import { useAccount, useSendTransaction, usePublicClient, useSwitchChain } from 'wagmi'
import { parseEther } from 'viem'
import { activeChainId } from '../config/network'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Heart } from 'lucide-react'

/** Default: project maintainer. Override via VITE_DONATION_ADDRESS in .env */
const DONATION_ADDRESS: `0x${string}` =
  (import.meta.env.VITE_DONATION_ADDRESS as `0x${string}` | undefined) ??
  '0x9F1768D32523D1f12726fCAF51e5ED44C40DAFa2'

const PRESETS = ['50', '100', '250']

function DonateForm() {
  const [amount, setAmount] = useState('1')
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const { isConnected, chainId } = useAccount()
  const { sendTransactionAsync } = useSendTransaction()
  const { switchChainAsync } = useSwitchChain()
  const publicClient = usePublicClient()

  const DFK_CHAIN_ID = activeChainId
  const isWrongChain = chainId !== DFK_CHAIN_ID

  async function handleDonate() {
    if (!amount || DONATION_ADDRESS === '0x0000000000000000000000000000000000000000') return
    setStatus('sending')
    try {
      if (isWrongChain) {
        await switchChainAsync({ chainId: DFK_CHAIN_ID })
      }
      const hash = await sendTransactionAsync({
        to: DONATION_ADDRESS,
        value: parseEther(amount),
        chainId: DFK_CHAIN_ID,
      })
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash })
      }
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  function copyAddress() {
    navigator.clipboard.writeText(DONATION_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/60 mb-1.5 block">
          Donation Address
        </label>
        <div className="flex gap-2">
          <code className="flex-1 text-[11px] bg-secondary/50 rounded-lg p-2.5 break-all font-mono text-foreground/70 border border-border/30">
            {DONATION_ADDRESS}
          </code>
          <Button
            variant="secondary"
            size="sm"
            onClick={copyAddress}
            className="shrink-0 h-auto w-16"
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>

      {isConnected && DONATION_ADDRESS !== '0x0000000000000000000000000000000000000000' && (
        <div>
          <label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/60 mb-1.5 block">
            Quick Send (JEWEL)
          </label>
          <div className="flex gap-2 mb-2">
            {PRESETS.map((p) => (
              <Button
                key={p}
                variant={amount === p ? 'default' : 'secondary'}
                size="sm"
                className={`flex-1 text-xs ${amount === p ? 'bg-primary/15 text-primary border-primary/30' : ''}`}
                onClick={() => setAmount(p)}
              >
                <img src="/images/jewel.png" alt="" className="w-3.5 h-3.5" /> {p}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Custom amount"
              className="font-mono text-sm bg-secondary/30 border-border/30"
            />
            <Button
              onClick={handleDonate}
              disabled={status === 'sending'}
              size="sm"
              className="shrink-0 h-auto px-4 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {status === 'sending' ? 'Sending...' : isWrongChain ? 'Switch & Send' : 'Send'}
            </Button>
          </div>
          {status === 'success' && (
            <p className="text-xs text-buy mt-2 bg-buy/5 border border-buy/10 rounded-lg px-3 py-2">
              Thank you for your donation!
            </p>
          )}
          {status === 'error' && (
            <p className="text-xs text-destructive mt-2 bg-destructive/5 border border-destructive/10 rounded-lg px-3 py-2">
              Transaction failed. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function DonateButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="h-8 text-xs gap-1.5 border-border/30 bg-secondary/50 hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
        onClick={() => setOpen(true)}
      >
        <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
        Donate
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:!max-w-lg">
          <DialogHeader className="items-center text-center">
            <img
              src="/images/ensea-land.png"
              alt="Ensea Land"
              className="w-full max-w-xs rounded-xl border border-border/30 object-cover shadow-sm mx-auto"
            />
            <DialogTitle className="font-heading tracking-wide">Support Ensea Terminus</DialogTitle>
            <DialogDescription className="text-muted-foreground/60">
              Free & open source. Any JEWEL tips are greatly appreciated and help me build more
              tools for the community. You can also send tokens to this address on any EVM chain.
            </DialogDescription>
          </DialogHeader>
          <DonateForm />
          <div className="text-center text-xs text-muted-foreground/50 pt-1">
            <a
              href="https://x.com/keepcase"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              @Keepcase
            </a>{' '}
            on X
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
