import { useReadContract } from 'wagmi'
import { ERC1155_ABI } from '../config/contracts'

interface UseTokenBalanceResult {
  balance: number
  isLoading: boolean
}

export function useTokenBalance(
  contractAddress: `0x${string}` | undefined,
  tokenId: number | undefined,
  userAddress: `0x${string}` | undefined
): UseTokenBalanceResult {
  const { data, isLoading } = useReadContract({
    address: contractAddress,
    abi: ERC1155_ABI,
    functionName: 'balanceOf',
    args: userAddress && tokenId !== undefined ? [userAddress, BigInt(tokenId)] : undefined,
    query: {
      enabled: !!contractAddress && tokenId !== undefined && !!userAddress,
    },
  })

  return {
    balance: data ? Number(data) : 0,
    isLoading,
  }
}
