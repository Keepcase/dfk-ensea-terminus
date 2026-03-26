import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { dfkChain, dfkTestnet } from './chains'
import { isTestnet } from './network'

/** wagmi config with EIP-6963 injected provider discovery. */
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
