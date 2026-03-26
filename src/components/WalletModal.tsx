import { useConnect } from 'wagmi'
import { activeChainId } from '../config/network'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'

interface WalletModalProps {
  onClose: () => void
}

function WalletConnectorList({
  connectors,
  onSelect,
  isPending,
}: {
  connectors: ReturnType<typeof useConnect>['connectors']
  onSelect: (connector: ReturnType<typeof useConnect>['connectors'][number]) => void
  isPending: boolean
}) {
  const seen = new Set<string>()
  const deduped = connectors.filter((connector) => {
    if (seen.has(connector.name)) return false
    seen.add(connector.name)
    return true
  })
  // Hide generic "Injected" when named wallets are available
  const uniqueConnectors =
    deduped.length > 1 ? deduped.filter((c) => c.name !== 'Injected') : deduped

  // If the only connector is the generic "Injected" with no actual provider,
  // show a helpful message instead of an unhelpful "Injected" button
  const hasOnlyGenericInjected =
    uniqueConnectors.length === 1 && uniqueConnectors[0]?.name === 'Injected'

  if (uniqueConnectors.length === 0 || hasOnlyGenericInjected) {
    return (
      <div className="text-center py-6 space-y-3">
        <p className="text-muted-foreground text-sm">
          No wallet extension detected
        </p>
        <p className="text-muted-foreground/60 text-xs">
          Install a browser wallet to connect
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {uniqueConnectors.map((connector) => (
        <Button
          key={connector.uid}
          variant="secondary"
          className="w-full justify-start gap-3 h-14 border-0 bg-secondary/30 hover:bg-secondary/50 transition-all rounded-xl"
          onClick={() => onSelect(connector)}
          disabled={isPending}
        >
          {connector.icon ? (
            <img src={connector.icon} alt={connector.name} className="w-9 h-9 rounded-xl" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">
              {connector.name[0]}
            </div>
          )}
          <span className="text-sm font-medium">{connector.name}</span>
        </Button>
      ))}
    </div>
  )
}

export function WalletModal({ onClose }: WalletModalProps) {
  const { connectors, connect, isPending } = useConnect()
  const isDesktop = useMediaQuery('(min-width: 640px)')

  function handleSelect(connector: (typeof connectors)[number]) {
    connect({ connector })
    onClose()
  }

  if (isDesktop) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent showCloseButton={false}>
          <DialogHeader className="text-center">
            <DialogTitle className="font-heading tracking-wide text-lg">Connect Wallet</DialogTitle>
            <DialogDescription>Connect to DFK Chain (ID: {activeChainId})</DialogDescription>
          </DialogHeader>

          <WalletConnectorList
            connectors={connectors}
            onSelect={handleSelect}
            isPending={isPending}
          />

          <DialogFooter>
            <DialogClose className="w-full inline-flex items-center justify-center rounded-xl border-0 bg-secondary/30 hover:bg-secondary/50 h-10 text-sm font-medium transition-all">
              Cancel
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-w-md mx-auto">
        <DrawerHeader className="text-center">
          <DrawerTitle className="font-heading tracking-wide text-lg">Connect Wallet</DrawerTitle>
          <DrawerDescription>Connect to DFK Chain (ID: {activeChainId})</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-2">
          <WalletConnectorList
            connectors={connectors}
            onSelect={handleSelect}
            isPending={isPending}
          />
        </div>

        <DrawerFooter>
          <DrawerClose className="w-full inline-flex items-center justify-center rounded-xl border-0 bg-secondary/30 hover:bg-secondary/50 h-10 text-sm font-medium transition-all">
            Cancel
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
