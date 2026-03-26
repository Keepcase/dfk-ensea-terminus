import { defineChain } from 'viem'

export const dfkChain = defineChain({
  id: 53935,
  name: 'DFK Chain',
  nativeCurrency: {
    name: 'JEWEL',
    symbol: 'JEWEL',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        import.meta.env.VITE_DFK_RPC_URL ||
          'https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'DFK Chain Explorer',
      url: 'https://subnets.avax.network/defi-kingdoms',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
})

export const dfkTestnet = defineChain({
  id: 335,
  name: 'DFK Chain Testnet',
  nativeCurrency: {
    name: 'JEWEL',
    symbol: 'JEWEL',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://subnets.avax.network/defi-kingdoms/dfk-chain-testnet/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'DFK Testnet Explorer',
      url: 'https://subnets-test.avax.network/defi-kingdoms',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
})
