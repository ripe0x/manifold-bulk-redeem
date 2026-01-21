import { useState, useCallback } from 'react'
import { usePublicClient } from 'wagmi'
import type { Campaign, BurnRedeemData } from '../types'
import {
  BURN_REDEEM_ABI,
  BURN_REDEEM_INITIALIZED_EVENT,
  GET_BURN_REDEEM_TOKEN_ABI,
} from '../config/contracts'
import { fetchMetadata, getImageUrl } from '../utils/metadata'

interface UseCampaignsResult {
  campaigns: Campaign[]
  loading: boolean
  error: string | null
  fetchCampaigns: (creatorContract: `0x${string}`, burnRedeemContract: `0x${string}`) => Promise<void>
}

export function useCampaigns(): UseCampaignsResult {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const publicClient = usePublicClient()

  const fetchCampaigns = useCallback(
    async (
      creatorContract: `0x${string}`,
      burnRedeemContract: `0x${string}`
    ) => {
      if (!publicClient) return

      setLoading(true)
      setError(null)
      setCampaigns([])

      try {
        const currentBlock = await publicClient.getBlockNumber()
        const fromBlock = currentBlock - 100000n

        const logs = await publicClient.getLogs({
          address: burnRedeemContract,
          event: BURN_REDEEM_INITIALIZED_EVENT,
          args: {
            creatorContract,
          },
          fromBlock,
          toBlock: 'latest',
        })

        if (logs.length === 0) {
          setError('No campaigns found in recent blocks')
          setLoading(false)
          return
        }

        const instanceIds = [...new Set(logs.map((log) => log.args.instanceId))]
        const now = Math.floor(Date.now() / 1000)

        const fetchedCampaigns: Campaign[] = []

        for (const instanceId of instanceIds) {
          if (instanceId === undefined) continue

          try {
            const burnRedeem = (await publicClient.readContract({
              address: burnRedeemContract,
              abi: BURN_REDEEM_ABI,
              functionName: 'getBurnRedeem',
              args: [creatorContract, instanceId],
            })) as BurnRedeemData

            if (!burnRedeem || !burnRedeem.burnSet || burnRedeem.burnSet.length === 0) {
              continue
            }

            const startDate = Number(burnRedeem.startDate)
            const endDate = Number(burnRedeem.endDate)
            const isActive = now >= startDate && (endDate === 0 || now <= endDate)

            // Get burn token info
            const burnItem = burnRedeem.burnSet[0]?.items[0]
            const burnTokenId = burnItem ? Number(burnItem.minTokenId) : undefined
            const burnContract = burnItem?.contractAddress

            // Get reward token ID
            let rewardTokenId: number | undefined
            try {
              const tokenId = await publicClient.readContract({
                address: burnRedeemContract,
                abi: GET_BURN_REDEEM_TOKEN_ABI,
                functionName: 'getBurnRedeemToken',
                args: [creatorContract, instanceId],
              })
              rewardTokenId = Number(tokenId)
            } catch (e) {
              console.error(`Error getting reward token ID for instance ${instanceId}:`, e)
            }

            // Fetch metadata
            let artworkUrl: string | undefined
            let metadata = null
            if (burnRedeem.location) {
              metadata = await fetchMetadata(burnRedeem.location, burnRedeem.storageProtocol)
              artworkUrl = getImageUrl(metadata)
            }

            fetchedCampaigns.push({
              id: instanceId.toString(),
              data: burnRedeem,
              isActive,
              artworkUrl,
              burnTokenId,
              burnContract,
              rewardTokenId,
              metadata: metadata || undefined,
            })
          } catch (e) {
            console.error(`Error loading instance ${instanceId}:`, e)
          }
        }

        // Sort: active first, then by instance ID descending
        fetchedCampaigns.sort((a, b) => {
          if (a.isActive && !b.isActive) return -1
          if (!a.isActive && b.isActive) return 1
          return Number(b.id) - Number(a.id)
        })

        setCampaigns(fetchedCampaigns)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch campaigns')
      } finally {
        setLoading(false)
      }
    },
    [publicClient]
  )

  return { campaigns, loading, error, fetchCampaigns }
}
