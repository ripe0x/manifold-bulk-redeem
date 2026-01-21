import { formatEther } from 'viem'
import type { Campaign } from '../types'
import type { TransactionState } from '../hooks/useBurnRedeem'
import { Spinner } from './ui/Spinner'
import { MANIFOLD_FEE } from '../config/contracts'

interface RedeemPanelProps {
  selectedCampaigns: Campaign[]
  onExecute: () => void
  isExecuting: boolean
  progress: { current: number; total: number } | null
  isConnected: boolean
  transactions: TransactionState[]
  onClearTransactions: () => void
}

export function RedeemPanel({
  selectedCampaigns,
  onExecute,
  isExecuting,
  progress,
  isConnected,
  transactions,
  onClearTransactions,
}: RedeemPanelProps) {
  const hasTransactions = transactions.length > 0
  const isComplete = hasTransactions && !isExecuting
  const successCount = transactions.filter(t => t.status === 'success').length
  const errorCount = transactions.filter(t => t.status === 'error').length

  if (selectedCampaigns.length === 0 && !hasTransactions) return null

  const totalCost = selectedCampaigns.reduce((sum, c) => {
    return sum + Number(formatEther(c.data.cost)) + MANIFOLD_FEE
  }, 0)

  return (
    <div className="fixed inset-x-0 bottom-0 flex justify-center p-4 md:p-6 pointer-events-none">
      <div className="bg-bg-card border border-text-muted/20 px-4 py-3 md:px-6 md:py-4 w-full max-w-xl pointer-events-auto">

        {/* Transaction Status List */}
        {hasTransactions && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-wider text-text-muted">Transaction Status</h3>
              {isComplete && (
                <button
                  onClick={onClearTransactions}
                  className="text-xs text-text-muted hover:text-text-primary transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-36 overflow-auto">
              {transactions.map((tx) => (
                <div key={tx.campaignId} className="flex items-center gap-4">
                  <StatusIndicator status={tx.status} />
                  <span className="flex-1 truncate text-sm">{tx.campaignName}</span>
                  <div className="flex items-center gap-3 text-xs">
                    {tx.hash && (
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-accent font-mono transition-colors"
                      >
                        View tx
                      </a>
                    )}
                    {tx.error && (
                      <span className="text-error">{tx.error}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isComplete && (
              <div className="mt-4 pt-4 border-t border-text-muted/10 flex gap-6 text-sm">
                <span className="text-success">{successCount} succeeded</span>
                {errorCount > 0 && (
                  <span className="text-error">{errorCount} failed</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Selection Summary & Action */}
        {selectedCampaigns.length > 0 && !isExecuting && (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-mono text-accent">{selectedCampaigns.length}</span>
                <span className="text-text-muted text-sm">selected</span>
              </div>
              <div className="text-xs text-text-muted opacity-50 mt-1">
                manifold fee: {totalCost.toFixed(5)} ETH / {(totalCost / selectedCampaigns.length).toFixed(5)} ETH each
              </div>
            </div>

            <button
              onClick={onExecute}
              disabled={!isConnected || isExecuting}
              className="px-6 md:px-12 py-3 md:py-4 text-xs md:text-sm uppercase tracking-wider font-medium bg-white hover:bg-accent-hover text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              Burn & Redeem
            </button>
          </div>
        )}

        {/* Processing State */}
        {isExecuting && (
          <div className="flex items-center justify-center gap-6 py-2">
            <Spinner size="md" />
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider text-text-muted mb-1">Processing</div>
              <div className="text-2xl font-mono">
                {progress ? `${progress.current} / ${progress.total}` : '...'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusIndicator({ status }: { status: TransactionState['status'] }) {
  const baseClasses = "w-3 h-3 flex-shrink-0"

  switch (status) {
    case 'pending':
      return <span className={`${baseClasses} bg-text-muted/30`} />
    case 'confirming':
      return <span className={`${baseClasses} bg-accent animate-pulse`} />
    case 'success':
      return <span className={`${baseClasses} bg-success`} />
    case 'error':
      return <span className={`${baseClasses} bg-error`} />
  }
}
