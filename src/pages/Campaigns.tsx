import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount, usePublicClient, useReadContract, useEnsName } from 'wagmi'
import { useCampaigns } from '../hooks/useCampaigns'
import { useBurnRedeem } from '../hooks/useBurnRedeem'
import { CampaignList } from '../components/CampaignList'
import { RedeemPanel } from '../components/RedeemPanel'
import { Spinner } from '../components/ui/Spinner'
import { ERC1155_ABI, OWNABLE_ABI, CONTRACT_METADATA_ABI } from '../config/contracts'
import type { Campaign } from '../types'

export function Campaigns() {
  const { creatorContract, burnRedeemContract, id } = useParams<{
    creatorContract: string
    burnRedeemContract: string
    id?: string
  }>()
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { campaigns, loading, error, fetchCampaigns } = useCampaigns()
  const { execute, isExecuting, progress, transactions, clearTransactions } = useBurnRedeem()

  // Fetch creator contract owner
  const { data: ownerAddress } = useReadContract({
    address: creatorContract as `0x${string}` | undefined,
    abi: OWNABLE_ABI,
    functionName: 'owner',
    query: {
      enabled: !!creatorContract,
    },
  })

  // Resolve owner's ENS name
  const { data: creatorEns } = useEnsName({
    address: ownerAddress as `0x${string}` | undefined,
    query: {
      enabled: !!ownerAddress,
    },
  })

  // Fetch contract name
  const { data: contractName } = useReadContract({
    address: creatorContract as `0x${string}` | undefined,
    abi: CONTRACT_METADATA_ABI,
    functionName: 'name',
    query: {
      enabled: !!creatorContract,
    },
  })

  // Fetch contract URI for description
  const { data: contractURI } = useReadContract({
    address: creatorContract as `0x${string}` | undefined,
    abi: CONTRACT_METADATA_ABI,
    functionName: 'contractURI',
    query: {
      enabled: !!creatorContract,
    },
  })

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [contractDescription, setContractDescription] = useState<string | null>(null)
  const [campaignsWithBalances, setCampaignsWithBalances] = useState<Campaign[]>([])
  const [burnTokenBalance, setBurnTokenBalance] = useState<number | null>(null)
  const [rewardBalances, setRewardBalances] = useState<Map<string, number>>(new Map())

  // Fetch campaigns on mount or when params change
  useEffect(() => {
    if (creatorContract && burnRedeemContract) {
      fetchCampaigns(creatorContract as `0x${string}`, burnRedeemContract as `0x${string}`)
    }
  }, [creatorContract, burnRedeemContract, fetchCampaigns])

  // Fetch contract description from contractURI
  useEffect(() => {
    async function fetchContractMetadata() {
      if (!contractURI) return

      try {
        let url = contractURI as string
        if (url.startsWith('ipfs://')) {
          url = `https://ipfs.io/ipfs/${url.slice(7)}`
        } else if (url.startsWith('ar://')) {
          url = `https://arweave.net/${url.slice(5)}`
        }

        const response = await fetch(url)
        const metadata = await response.json()
        if (metadata?.description) {
          setContractDescription(metadata.description)
        }
      } catch (e) {
        console.error('Error fetching contract metadata:', e)
      }
    }

    fetchContractMetadata()
  }, [contractURI])

  // Auto-select instance if provided in URL
  useEffect(() => {
    if (id && campaigns.length > 0) {
      const campaign = campaigns.find((c) => c.id === id)
      if (campaign) {
        setSelectedIds(new Set([id]))
      }
    }
  }, [id, campaigns])

  // Fetch burn token balance and reward token balances
  useEffect(() => {
    async function fetchBalances() {
      setCampaignsWithBalances(campaigns)

      if (!isConnected || !address || !publicClient || campaigns.length === 0) {
        setBurnTokenBalance(null)
        setRewardBalances(new Map())
        return
      }

      // Get burn token info from first campaign (all should be the same)
      const firstCampaign = campaigns[0]
      if (!firstCampaign?.burnContract || firstCampaign?.burnTokenId === undefined) {
        setBurnTokenBalance(null)
      } else {
        try {
          const balance = await publicClient.readContract({
            address: firstCampaign.burnContract,
            abi: ERC1155_ABI,
            functionName: 'balanceOf',
            args: [address, BigInt(firstCampaign.burnTokenId)],
          })
          setBurnTokenBalance(Number(balance))
        } catch {
          setBurnTokenBalance(null)
        }
      }

      // Fetch reward token balances using the actual reward token ID
      if (creatorContract) {
        const balances = new Map<string, number>()

        await Promise.all(
          campaigns.map(async (campaign) => {
            if (campaign.rewardTokenId === undefined) {
              balances.set(campaign.id, 0)
              return
            }

            try {
              const balance = await publicClient.readContract({
                address: creatorContract as `0x${string}`,
                abi: ERC1155_ABI,
                functionName: 'balanceOf',
                args: [address, BigInt(campaign.rewardTokenId)],
              })
              balances.set(campaign.id, Number(balance))
            } catch {
              balances.set(campaign.id, 0)
            }
          })
        )

        setRewardBalances(balances)
      }
    }

    fetchBalances()
  }, [campaigns, isConnected, address, publicClient, creatorContract])

  const toggleSelection = useCallback((campaignId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(campaignId)) {
        next.delete(campaignId)
      } else {
        next.add(campaignId)
      }
      return next
    })
  }, [])

  const selectAllActive = useCallback(() => {
    const activeIds = campaignsWithBalances
      .filter((c) => c.isActive)
      .map((c) => c.id)
    setSelectedIds(new Set(activeIds))
  }, [campaignsWithBalances])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleExecute = async () => {
    if (!creatorContract || !burnRedeemContract || !address) return

    const selectedCampaigns = campaignsWithBalances.filter((c) => selectedIds.has(c.id))
    const result = await execute(
      selectedCampaigns,
      creatorContract as `0x${string}`,
      burnRedeemContract as `0x${string}`,
      address
    )

    if (result.successCount > 0) {
      setSelectedIds(new Set())
      fetchCampaigns(creatorContract as `0x${string}`, burnRedeemContract as `0x${string}`)
    }
  }

  const handleRedeemSingle = async (campaign: Campaign) => {
    if (!creatorContract || !burnRedeemContract || !address) return

    const result = await execute(
      [campaign],
      creatorContract as `0x${string}`,
      burnRedeemContract as `0x${string}`,
      address
    )

    if (result.successCount > 0) {
      fetchCampaigns(creatorContract as `0x${string}`, burnRedeemContract as `0x${string}`)
    }
  }

  const selectedCampaigns = campaignsWithBalances.filter((c) => selectedIds.has(c.id))

  return (
    <div className="pb-32">
      {/* Header */}
      <header className="mb-16 flex items-start justify-between">
        <div>
          {contractName && (
            <h1 className="text-sm mb-2">{contractName}</h1>
          )}
          <p className="text-xs text-text-muted mb-4">
            {creatorEns && <>by {creatorEns}</>}
            {creatorEns && campaignsWithBalances.length > 0 && (() => {
              const maxTokenId = Math.max(...campaignsWithBalances.map(c => c.rewardTokenId ?? 0))
              const activeCount = campaignsWithBalances.filter(c => c.isActive).length
              return maxTokenId > 0 ? <> · {activeCount}/{maxTokenId} active</> : null
            })()}
          </p>
          {contractDescription && (
            <p className="text-xs text-text-muted max-w-md leading-relaxed">{contractDescription}</p>
          )}
        </div>
        {burnTokenBalance !== null && burnTokenBalance > 0 && (
          <div className="text-xs text-text-muted">
            {burnTokenBalance} BURN TOKENS REMAINING
          </div>
        )}
      </header>

      {/* Content */}
      {loading ? (
        <div className="py-24">
          <Spinner size="lg" />
          <p className="text-text-muted text-xs mt-6">scanning...</p>
        </div>
      ) : error ? (
        <div className="py-12">
          <p className="text-error text-sm mb-2">{error}</p>
          <p className="text-text-muted text-xs">
            check that the contract addresses are correct
          </p>
        </div>
      ) : (
        <>
          {/* Campaign list */}
          <CampaignList
            campaigns={campaignsWithBalances}
            selectedIds={selectedIds}
            onToggle={toggleSelection}
            onSelectAll={selectAllActive}
            onDeselectAll={deselectAll}
            onRedeemSingle={handleRedeemSingle}
            isExecuting={isExecuting}
            rewardBalances={rewardBalances}
          />
        </>
      )}

      <RedeemPanel
        selectedCampaigns={selectedCampaigns}
        onExecute={handleExecute}
        isExecuting={isExecuting}
        progress={progress}
        isConnected={isConnected}
        transactions={transactions}
        onClearTransactions={clearTransactions}
      />
    </div>
  )
}
