import { createPublicClient, http } from 'viem'
import { dfkChain, dfkTestnet } from './chains'
import { BAZAAR_ADDRESSES } from './contracts'

/**
 * Network configuration — single source of truth.
 *
 * Set VITE_NETWORK=testnet to use DFK Chain testnet.
 * Defaults to mainnet.
 */
const networkEnv = (import.meta.env.VITE_NETWORK as string | undefined)?.toLowerCase()

export const isTestnet = networkEnv === 'testnet'

export const activeChain = isTestnet ? dfkTestnet : dfkChain
export const activeChainId = activeChain.id
export const bazaarAddress = BAZAAR_ADDRESSES[activeChainId]!

export const GLACIER_BASE = `https://glacier-api.avax.network/v1/chains/${activeChainId}/addresses`

/** Donation address — override via VITE_DONATION_ADDRESS in .env */
export const DONATION_ADDRESS: `0x${string}` =
  (import.meta.env.VITE_DONATION_ADDRESS as `0x${string}` | undefined) ??
  '0x9F1768D32523D1f12726fCAF51e5ED44C40DAFa2'

/** Shared public client for read-only RPC calls outside of React hooks */
export const dfkClient = createPublicClient({ chain: activeChain, transport: http() })

/** ERC-1155 balanceOf ABI fragment */
export const ERC1155_BALANCE_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const
