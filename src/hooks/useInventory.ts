import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { type Address, erc20Abi } from 'viem'
import { dfkClient, ERC1155_BALANCE_ABI } from '../config/network'
import { getAllTokens } from '../config/tokens'

/**
 * Fetch the connected wallet's balance for all tokens in the registry.
 * Uses a single multicall for efficiency.
 * Returns a map of token address (lowercase) -> balance (bigint).
 * For ERC-1155 tokens, key includes tokenId: "address:tokenId"
 */
export function useInventory() {
  const { address: userAddress } = useAccount()

  return useQuery<Record<string, bigint>>({
    queryKey: ['inventory', userAddress],
    enabled: !!userAddress,
    staleTime: 30_000,
    refetchInterval: 60_000,
    queryFn: async () => {
      if (!userAddress) return {}

      const tokens = getAllTokens()
      const calls = tokens.map((token) => {
        if (token.isERC20 === false) {
          // ERC-1155
          return {
            address: token.address as Address,
            abi: ERC1155_BALANCE_ABI,
            functionName: 'balanceOf' as const,
            args: [userAddress, token.tokenId ?? 0n] as const,
          }
        }
        // ERC-20
        return {
          address: token.address as Address,
          abi: erc20Abi,
          functionName: 'balanceOf' as const,
          args: [userAddress] as const,
        }
      })

      const results = await dfkClient.multicall({ contracts: calls })

      const balances: Record<string, bigint> = {}
      tokens.forEach((token, i) => {
        const result = results[i]
        if (
          result?.status === 'success' &&
          result.result !== undefined &&
          typeof result.result === 'bigint'
        ) {
          const key =
            token.isERC20 === false
              ? `${token.address.toLowerCase()}:${token.tokenId ?? 0}`
              : token.address.toLowerCase()
          if (result.result > 0n) {
            balances[key] = result.result
          }
        }
      })

      return balances
    },
  })
}

/** Get the balance key for a token */
export function getBalanceKey(token: {
  address: Address
  tokenId?: bigint
  isERC20?: boolean
}): string {
  if (token.isERC20 === false) {
    return `${token.address.toLowerCase()}:${token.tokenId ?? 0}`
  }
  return token.address.toLowerCase()
}

/** Format a balance for display */
export function formatBalance(balance: bigint, decimals: number): string {
  const n = decimals === 0 ? Number(balance) : Number(balance) / 10 ** decimals
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 100_000) return `${(n / 1000).toFixed(1)}k`
  if (n >= 1_000) return Math.floor(n).toLocaleString()
  if (decimals > 0 && n >= 1) return n.toFixed(decimals > 2 ? 2 : decimals)
  return n.toString()
}
