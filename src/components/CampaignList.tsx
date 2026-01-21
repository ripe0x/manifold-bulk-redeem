import { useState } from 'react'
import type { Campaign } from '../types'
import { Modal } from './ui/Modal'

function formatTimeRemaining(endDate: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = endDate - now

  if (diff <= 0) return 'ended'

  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  const minutes = Math.floor((diff % 3600) / 60)

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function formatEndDate(endDate: number): string {
  const date = new Date(endDate * 1000)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

interface CampaignListProps {
  campaigns: Campaign[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onRedeemSingle: (campaign: Campaign) => void
  isExecuting: boolean
  rewardBalances: Map<string, number>
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%231a1a1a' width='100' height='100'/><text x='50' y='55' text-anchor='middle' fill='%23333' font-size='10'>No Image</text></svg>"

export function CampaignList({
  campaigns,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onRedeemSingle,
  isExecuting,
  rewardBalances,
}: CampaignListProps) {
  const [detailCampaign, setDetailCampaign] = useState<Campaign | null>(null)
  const [showEndDate, setShowEndDate] = useState(false)

  if (campaigns.length === 0) {
    return (
      <div className="py-16 text-text-muted">
        No campaigns found.
      </div>
    )
  }

  const activeCampaigns = campaigns.filter((c) => c.isActive)
  const allActiveSelected = activeCampaigns.length > 0 && activeCampaigns.every((c) => selectedIds.has(c.id))

  return (
    <>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-xs text-text-muted uppercase tracking-wider border-b border-text-muted/20">
            <th className="w-10 md:w-12 py-4 px-2 md:px-4 text-left">
              <input
                type="checkbox"
                checked={allActiveSelected}
                onChange={() => allActiveSelected ? onDeselectAll() : onSelectAll()}
                className="w-4 h-4 accent-accent cursor-pointer"
                title={allActiveSelected ? 'Deselect all' : 'Select all active'}
              />
            </th>
            <th className="w-16 md:w-24 py-4 pr-3 md:pr-6"></th>
            <th className="py-4 pr-3 md:pr-6 text-left">Token</th>
            <th className="hidden md:table-cell w-20 py-4 pr-6 text-left">Owned</th>
            <th className="hidden md:table-cell w-24 py-4 pr-6 text-left">Ends</th>
            <th className="w-20 md:w-24 py-4 pr-2 md:pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <CampaignRow
              key={campaign.id}
              campaign={campaign}
              isSelected={selectedIds.has(campaign.id)}
              onToggle={() => onToggle(campaign.id)}
              onRedeem={() => onRedeemSingle(campaign)}
              onShowDetail={() => setDetailCampaign(campaign)}
              isExecuting={isExecuting}
              owned={rewardBalances.get(campaign.id) ?? 0}
              showEndDate={showEndDate}
              onToggleEndDate={() => setShowEndDate(!showEndDate)}
            />
          ))}
        </tbody>
      </table>

      <Modal isOpen={!!detailCampaign} onClose={() => setDetailCampaign(null)}>
        {detailCampaign && (
          <CampaignDetail
            campaign={detailCampaign}
            onClose={() => setDetailCampaign(null)}
            owned={rewardBalances.get(detailCampaign.id) ?? 0}
          />
        )}
      </Modal>
    </>
  )
}

interface CampaignRowProps {
  campaign: Campaign
  isSelected: boolean
  onToggle: () => void
  onRedeem: () => void
  onShowDetail: () => void
  isExecuting: boolean
  owned: number
  showEndDate: boolean
  onToggleEndDate: () => void
}

function CampaignRow({ campaign, isSelected, onToggle, onRedeem, onShowDetail, isExecuting, owned, showEndDate, onToggleEndDate }: CampaignRowProps) {
  const title = campaign.metadata?.name || `#${campaign.id}`
  const endDate = campaign.data.endDate

  const handleRowClick = () => {
    if (campaign.isActive) {
      onToggle()
    }
  }

  return (
    <tr
      onClick={handleRowClick}
      className={`
        transition-colors cursor-pointer
        ${isSelected ? 'bg-accent/5' : 'hover:bg-white/5'}
        ${!campaign.isActive ? 'opacity-40 cursor-default' : ''}
      `}
    >
      <td className="py-4 md:py-6 px-2 md:px-4 align-middle">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          disabled={!campaign.isActive}
          className="w-4 h-4 accent-accent cursor-pointer disabled:cursor-not-allowed"
        />
      </td>

      <td className="py-4 md:py-6 pr-3 md:pr-6 align-middle">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onShowDetail()
          }}
          className="block w-12 md:w-16 cursor-pointer hover:opacity-70 transition-opacity"
        >
          <img
            src={campaign.artworkUrl || PLACEHOLDER_IMAGE}
            alt={title}
            className="w-full h-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE
            }}
          />
        </button>
      </td>

      <td className="py-4 md:py-6 pr-3 md:pr-6 align-middle">
        <div className="text-text-primary font-medium text-sm md:text-base">
          {title}
        </div>
        <div className="text-xs text-text-muted mt-1 font-mono">
          #{campaign.rewardTokenId ?? '—'}
        </div>
      </td>

      <td className="hidden md:table-cell py-6 pr-6 align-middle font-mono text-sm">
        {owned}
      </td>

      <td className="hidden md:table-cell py-6 pr-6 align-middle">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleEndDate()
          }}
          className={`text-xs font-mono cursor-pointer hover:text-text-primary transition-colors ${campaign.isActive ? 'text-text-muted' : 'text-text-muted/50'}`}
        >
          {campaign.isActive
            ? (showEndDate ? formatEndDate(endDate) : formatTimeRemaining(endDate))
            : 'ended'
          }
        </button>
      </td>

      <td className="py-4 md:py-6 pr-4 align-middle">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRedeem()
          }}
          disabled={!campaign.isActive || isExecuting}
          className="px-4 py-2 text-xs uppercase tracking-wider font-medium bg-white hover:bg-accent-hover text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Redeem
        </button>
      </td>
    </tr>
  )
}

interface CampaignDetailProps {
  campaign: Campaign
  onClose: () => void
  owned: number
}

function CampaignDetail({ campaign, onClose, owned }: CampaignDetailProps) {
  const title = campaign.metadata?.name || `#${campaign.id}`

  return (
    <div className="bg-bg-card flex flex-col max-h-[90vh]">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-primary text-2xl font-light z-50 bg-bg-card/80"
        aria-label="Close"
      >
        ×
      </button>

      {/* Image - as large as possible */}
      <div className="flex-1 min-h-0 flex items-center justify-center bg-black p-4">
        <img
          src={campaign.artworkUrl || PLACEHOLDER_IMAGE}
          alt={title}
          className="max-w-full max-h-full object-contain"
          style={{ maxHeight: '70vh' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE
          }}
        />
      </div>

      {/* Info panel */}
      <div className="p-8 border-t border-text-muted/10">
        <div className="flex items-start justify-between gap-8 mb-6">
          <h2 className="text-xl font-medium">{title}</h2>
          <span className={`text-xs uppercase tracking-wider flex-shrink-0 ${campaign.isActive ? 'text-success' : 'text-text-muted'}`}>
            {campaign.isActive ? 'Active' : 'Ended'}
          </span>
        </div>

        <div className="flex gap-12 text-sm">
          <div>
            <div className="text-text-muted text-xs uppercase tracking-wider mb-1">Token ID</div>
            <div className="font-mono">#{campaign.rewardTokenId ?? '—'}</div>
          </div>
          <div>
            <div className="text-text-muted text-xs uppercase tracking-wider mb-1">Owned</div>
            <div className="font-mono">{owned}</div>
          </div>
        </div>

        {campaign.metadata?.description && (
          <p className="mt-6 pt-6 border-t border-text-muted/10 text-text-muted text-sm leading-relaxed">
            {campaign.metadata.description}
          </p>
        )}
      </div>
    </div>
  )
}
