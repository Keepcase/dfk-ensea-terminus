import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { dfkChain, dfkTestnet } from './chains'
import { isTestnet } from './network'

/**
 * wagmi config with EIP-6963 injected provider discovery.
 *
 * To add WalletConnect later, install `@wagmi/connectors` and add:
 *   import { walletConnect } from '@wagmi/connectors'
 *   connectors: [injected(), walletConnect({ projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID })]
 */
export const config = isTestnet
  ? createConfig({
      chains: [dfkTestnet],
      connectors: [injected()],
      transports: { [dfkTestnet.id]: http() },
      multiInjectedProviderDiscovery: true,
    })
  : createConfig({
      chains: [dfkChain],
      connectors: [injected()],
      transports: { [dfkChain.id]: http() },
      multiInjectedProviderDiscovery: true,
    })

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
