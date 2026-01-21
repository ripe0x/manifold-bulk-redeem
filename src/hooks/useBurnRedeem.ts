import { useState, useCallback } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'
import type { Campaign, BurnToken } from '../types'
import { BURN_REDEEM_ABI, MANIFOLD_FEE_WEI, ERC1155_ABI } from '../config/contracts'

export type TransactionStatus = 'pending' | 'confirming' | 'success' | 'error'

export interface TransactionState {
  campaignId: string
  campaignName: string
  status: TransactionStatus
  hash?: string
  error?: string
}

interface UseBurnRedeemResult {
  execute: (
    campaigns: Campaign[],
    creatorContract: `0x${string}`,
    burnRedeemContract: `0x${string}`,
    userAddress: `0x${string}`
  ) => Promise<{ successCount: number; failCount: number }>
  isExecuting: boolean
  progress: { current: number; total: number } | null
  transactions: TransactionState[]
  clearTransactions: () => void
}

export function useBurnRedeem(): UseBurnRedeemResult {
  const [isExecuting, setIsExecuting] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [transactions, setTransactions] = useState<TransactionState[]>([])
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const updateTransaction = (campaignId: string, update: Partial<TransactionState>) => {
    setTransactions(prev =>
      prev.map(tx => tx.campaignId === campaignId ? { ...tx, ...update } : tx)
    )
  }

  const clearTransactions = useCallback(() => {
    setTransactions([])
  }, [])

  const execute = useCallback(
    async (
      campaigns: Campaign[],
      creatorContract: `0x${string}`,
      burnRedeemContract: `0x${string}`,
      userAddress: `0x${string}`
    ) => {
      if (!publicClient || !walletClient) {
        return { successCount: 0, failCount: campaigns.length }
      }

      setIsExecuting(true)
      setProgress({ current: 0, total: campaigns.length })

      // Initialize transaction states
      setTransactions(campaigns.map(c => ({
        campaignId: c.id,
        campaignName: c.metadata?.name || `#${c.id}`,
        status: 'pending' as TransactionStatus,
      })))

      let successCount = 0
      let failCount = 0

      // Check and request approval if needed
      const isApproved = await publicClient.readContract({
        address: creatorContract,
        abi: ERC1155_ABI,
        functionName: 'isApprovedForAll',
        args: [userAddress, burnRedeemContract],
      })

      if (!isApproved) {
        try {
          const approvalHash = await walletClient.writeContract({
            address: creatorContract,
            abi: ERC1155_ABI,
            functionName: 'setApprovalForAll',
            args: [burnRedeemContract, true],
          })
          await publicClient.waitForTransactionReceipt({ hash: approvalHash })
        } catch (e) {
          console.error('Approval failed:', e)
          setTransactions(prev => prev.map(tx => ({ ...tx, status: 'error' as TransactionStatus, error: 'Approval denied' })))
          setIsExecuting(false)
          setProgress(null)
          return { successCount: 0, failCount: campaigns.length }
        }
      }

      // Process each campaign
      for (let i = 0; i < campaigns.length; i++) {
        const campaign = campaigns[i]
        setProgress({ current: i + 1, total: campaigns.length })

        try {
          const burnItem = campaign.data.burnSet[0]?.items[0]
          if (!burnItem) {
            updateTransaction(campaign.id, { status: 'error', error: 'Invalid burn data' })
            failCount++
            continue
          }

          const tokenId = Number(burnItem.minTokenId)
          const burnAmount = Number(burnItem.amount) || 1

          // Check balance
          const balance = await publicClient.readContract({
            address: burnItem.contractAddress,
            abi: ERC1155_ABI,
            functionName: 'balanceOf',
            args: [userAddress, BigInt(tokenId)],
          })

          if (Number(balance) < burnAmount) {
            updateTransaction(campaign.id, { status: 'error', error: 'Insufficient balance' })
            failCount++
            continue
          }

          // Build burn tokens array
          const burnTokens: BurnToken[] = [
            {
              groupIndex: 0,
              itemIndex: 0,
              contractAddress: burnItem.contractAddress,
              id: BigInt(tokenId),
              merkleProof: [],
            },
          ]

          // Calculate cost
          const campaignCost = campaign.data.cost
          const cost = campaignCost + MANIFOLD_FEE_WEI

          // Execute burn/redeem
          updateTransaction(campaign.id, { status: 'confirming' })

          const hash = await walletClient.writeContract({
            address: burnRedeemContract,
            abi: BURN_REDEEM_ABI,
            functionName: 'burnRedeem',
            args: [creatorContract, BigInt(campaign.id), 1, burnTokens],
            value: cost,
          })

          updateTransaction(campaign.id, { hash })

          const receipt = await publicClient.waitForTransactionReceipt({ hash })

          if (receipt.status === 'success') {
            updateTransaction(campaign.id, { status: 'success' })
            successCount++
          } else {
            updateTransaction(campaign.id, { status: 'error', error: 'Transaction reverted' })
            failCount++
          }
        } catch (e) {
          console.error(`Error processing campaign ${campaign.id}:`, e)
          const errorMsg = e instanceof Error ? e.message : 'Transaction failed'
          updateTransaction(campaign.id, { status: 'error', error: errorMsg.slice(0, 50) })
          failCount++
        }
      }

      setIsExecuting(false)
      setProgress(null)

      return { successCount, failCount }
    },
    [publicClient, walletClient]
  )

  return { execute, isExecuting, progress, transactions, clearTransactions }
}
