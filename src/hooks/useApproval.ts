import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ERC1155_ABI } from '../config/contracts'

interface UseApprovalResult {
  isApproved: boolean
  isLoading: boolean
  approve: () => void
  isPending: boolean
  isConfirming: boolean
  isConfirmed: boolean
}

export function useApproval(
  tokenContract: `0x${string}` | undefined,
  operator: `0x${string}`,
  userAddress: `0x${string}` | undefined
): UseApprovalResult {
  const { data: isApproved, isLoading } = useReadContract({
    address: tokenContract,
    abi: ERC1155_ABI,
    functionName: 'isApprovedForAll',
    args: userAddress ? [userAddress, operator] : undefined,
    query: {
      enabled: !!tokenContract && !!userAddress,
    },
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = () => {
    if (!tokenContract) return
    writeContract({
      address: tokenContract,
      abi: ERC1155_ABI,
      functionName: 'setApprovalForAll',
      args: [operator, true],
    })
  }

  return {
    isApproved: !!isApproved,
    isLoading,
    approve,
    isPending,
    isConfirming,
    isConfirmed,
  }
}
