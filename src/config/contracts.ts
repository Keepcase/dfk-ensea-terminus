import type { Address } from 'viem'

/** Bazaar contract addresses per chain */
export const BAZAAR_ADDRESSES: Record<number, Address> = {
  53935: '0x902F2b740bC158e16170d57528405d7f2a793Ca2', // DFK Chain mainnet
  335: '0x767A9114B61fb14732Cfca1ccA2d9FD309c74E93', // DFK Chain testnet
  // Metis mainnet (same ABI, different address)
  // 1088: '0x4cB622C886c89c0472C0056A7C4c929c98c35D14',
}

/**
 * Bazaar contract ABI — typed `as const` for viem type inference.
 *
 * Source: https://devs.defikingdoms.com/contracts/exchanges/the-bazaar
 *
 * Only includes the functions and events we use. The full contract has more,
 * but we keep this minimal to reduce bundle size and maintenance surface.
 */
export const BAZAAR_ABI = [
  // ── Read Functions ──

  {
    name: 'getBestOrders',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_token', type: 'address' },
      { name: '_tokenId', type: 'uint256' },
    ],
    outputs: [
      {
        name: 'bestBuyOrder',
        type: 'tuple',
        components: [
          { name: 'orderId', type: 'uint256' },
          { name: 'token', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'isERC20', type: 'bool' },
          { name: 'side', type: 'uint8' },
          { name: 'owner', type: 'address' },
          { name: 'price', type: 'uint256' },
          { name: 'quantity', type: 'uint256' },
          { name: 'feePercent', type: 'uint256' },
        ],
      },
      {
        name: 'bestSellOrder',
        type: 'tuple',
        components: [
          { name: 'orderId', type: 'uint256' },
          { name: 'token', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'isERC20', type: 'bool' },
          { name: 'side', type: 'uint8' },
          { name: 'owner', type: 'address' },
          { name: 'price', type: 'uint256' },
          { name: 'quantity', type: 'uint256' },
          { name: 'feePercent', type: 'uint256' },
        ],
      },
    ],
  },

  {
    name: 'getPrices',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_token', type: 'address' },
      { name: '_tokenId', type: 'uint256' },
      { name: '_side', type: 'uint8' },
    ],
    outputs: [{ name: 'prices', type: 'uint256[]' }],
  },

  {
    name: 'getOrderIdsAtPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_token', type: 'address' },
      { name: '_tokenId', type: 'uint256' },
      { name: '_side', type: 'uint8' },
      { name: '_price', type: 'uint256' },
    ],
    outputs: [
      { name: 'orderIds', type: 'uint256[]' },
      { name: 'quantities', type: 'uint256[]' },
    ],
  },

  {
    name: 'getOrders',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_orderIds', type: 'uint256[]' }],
    outputs: [
      {
        name: 'orders',
        type: 'tuple[]',
        components: [
          { name: 'orderId', type: 'uint256' },
          { name: 'token', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'isERC20', type: 'bool' },
          { name: 'side', type: 'uint8' },
          { name: 'owner', type: 'address' },
          { name: 'price', type: 'uint256' },
          { name: 'quantity', type: 'uint256' },
          { name: 'feePercent', type: 'uint256' },
        ],
      },
    ],
  },

  {
    name: 'getUserOpenOrderIds',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: 'orderIds', type: 'uint256[]' }],
  },

  {
    name: 'getCostForQuantity',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_token', type: 'address' },
      { name: '_tokenId', type: 'uint256' },
      { name: '_side', type: 'uint8' },
      { name: '_quantity', type: 'uint256' },
    ],
    outputs: [{ name: 'cost', type: 'uint256' }],
  },

  {
    name: 'calcFee',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_token', type: 'address' },
      { name: '_side', type: 'uint8' },
      { name: '_amount', type: 'uint256' },
    ],
    outputs: [{ name: 'fee', type: 'uint256' }],
  },

  {
    name: 'calcFeePercent',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_user', type: 'address' },
      { name: '_token', type: 'address' },
      { name: '_side', type: 'uint8' },
    ],
    outputs: [{ name: 'feePercent', type: 'uint256' }],
  },

  {
    name: 'PRICE_FACTOR',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },

  // ── Write Functions ──

  {
    name: 'makeOrders',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      {
        name: '_inputs',
        type: 'tuple[]',
        components: [
          { name: 'token', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'side', type: 'uint8' },
          { name: 'totalPrice', type: 'uint256' },
          { name: 'quantity', type: 'uint256' },
          { name: 'addUnfilledOrderToOrderbook', type: 'bool' },
          { name: 'isERC20', type: 'bool' },
        ],
      },
    ],
    outputs: [],
  },

  {
    name: 'cancelOrders',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_orderIds', type: 'uint256[]' }],
    outputs: [],
  },

  {
    name: 'editOrders',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      {
        name: '_inputs',
        type: 'tuple[]',
        components: [
          { name: 'orderId', type: 'uint256' },
          { name: 'newTotalPrice', type: 'uint256' },
          { name: 'newQuantity', type: 'uint256' },
        ],
      },
    ],
    outputs: [],
  },

  // ── Events ──

  {
    name: 'OrderAdded',
    type: 'event',
    inputs: [
      { name: 'orderId', type: 'uint256', indexed: true },
      { name: 'token', type: 'address', indexed: true },
      { name: 'baseToken', type: 'address', indexed: false },
      { name: 'tokenId', type: 'uint256', indexed: false },
      { name: 'isERC20', type: 'bool', indexed: false },
      { name: 'side', type: 'uint8', indexed: false },
      { name: 'sender', type: 'address', indexed: true },
      { name: 'price', type: 'uint256', indexed: false },
      { name: 'quantity', type: 'uint256', indexed: false },
    ],
  },

  {
    name: 'OrderExecuted',
    type: 'event',
    inputs: [
      { name: 'orderId', type: 'uint256', indexed: true },
      { name: 'initiator', type: 'address', indexed: true },
      { name: 'quantity', type: 'uint256', indexed: false },
      { name: 'remainingQuantity', type: 'uint256', indexed: false },
      { name: 'price', type: 'uint256', indexed: false },
    ],
  },

  {
    name: 'OrderCancelled',
    type: 'event',
    inputs: [
      { name: 'orderId', type: 'uint256', indexed: false },
      {
        name: 'order',
        type: 'tuple',
        indexed: false,
        components: [
          { name: 'orderId', type: 'uint256' },
          { name: 'token', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'isERC20', type: 'bool' },
          { name: 'side', type: 'uint8' },
          { name: 'owner', type: 'address' },
          { name: 'price', type: 'uint256' },
          { name: 'quantity', type: 'uint256' },
          { name: 'feePercent', type: 'uint256' },
        ],
      },
    ],
  },
] as const

/** Hero NFT contract addresses per chain */
export const HERO_ADDRESSES: Record<number, Address> = {
  53935: '0xEb9B61B145D6489Be575D3603F4a704810e143dF', // DFK Chain mainnet
  335: '0x3bcaCBeAFefed260d877dbE36378008D4e714c8E',   // DFK Chain testnet
}

/** Hero Auction (sales) contract addresses per chain */
export const HERO_AUCTION_ADDRESSES: Record<number, Address> = {
  53935: '0xc390fAA4C7f66E4D62E59C231D5beD32Ff77BEf0', // DFK Chain mainnet
  335: '0xb9b4C20165a421E7208494A38a37679c7F334770',   // DFK Chain testnet
}

/** CRYSTAL power token addresses per chain */
export const CRYSTAL_ADDRESSES: Record<number, Address> = {
  53935: '0x04b9dA42306B023f3572e106B11D82aAd9D32EBb', // DFK Chain mainnet
  335: '0xa5c47B4bEb35215fB0CF0Ea6516F9921591c3aCE',   // DFK Chain testnet
}

/**
 * Hero NFT contract ABI — typed `as const` for viem type inference.
 *
 * Only includes the functions we use. Minimal to reduce bundle size.
 */
export const HERO_ABI = [
  {
    name: 'getUserHeroes',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_address', type: 'address' }],
    outputs: [{ type: 'uint256[]' }],
  },
  {
    name: 'getHeroV3',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_id', type: 'uint256' }],
    outputs: [{ type: 'uint256[84]' }],
  },
  {
    name: 'isApprovedForAll',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'operator', type: 'address' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'setApprovalForAll',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
    outputs: [],
  },
] as const

/**
 * Hero Auction (sales) contract ABI — typed `as const` for viem type inference.
 *
 * Only includes the functions we use. The auction struct has 8 fields.
 */
export const HERO_AUCTION_ABI = [
  // ── Read Functions ──

  {
    name: 'getAuction',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_tokenId', type: 'uint256' }],
    outputs: [{
      type: 'tuple',
      components: [
        { name: 'seller', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'startingPrice', type: 'uint128' },
        { name: 'endingPrice', type: 'uint128' },
        { name: 'duration', type: 'uint64' },
        { name: 'startedAt', type: 'uint64' },
        { name: 'winner', type: 'address' },
        { name: 'open', type: 'bool' },
      ],
    }],
  },
  {
    name: 'getAuctions',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_tokenIds', type: 'uint256[]' }],
    outputs: [{
      type: 'tuple[]',
      components: [
        { name: 'seller', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'startingPrice', type: 'uint128' },
        { name: 'endingPrice', type: 'uint128' },
        { name: 'duration', type: 'uint64' },
        { name: 'startedAt', type: 'uint64' },
        { name: 'winner', type: 'address' },
        { name: 'open', type: 'bool' },
      ],
    }],
  },
  {
    name: 'getUserAuctions',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_address', type: 'address' }],
    outputs: [{ type: 'uint256[]' }],
  },
  {
    name: 'isOnAuction',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_tokenId', type: 'uint256' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'getCurrentPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_tokenId', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'ownerCut',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'powerToken',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },

  // ── Write Functions ──

  {
    name: 'createAuction',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_tokenId', type: 'uint256' },
      { name: '_startingPrice', type: 'uint128' },
      { name: '_endingPrice', type: 'uint128' },
      { name: '_duration', type: 'uint64' },
      { name: '_winner', type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'cancelAuction',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_tokenId', type: 'uint256' }],
    outputs: [],
  },
] as const

/** Standard ERC-20 ABI — only the functions we need for approvals and balances */
export const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const
