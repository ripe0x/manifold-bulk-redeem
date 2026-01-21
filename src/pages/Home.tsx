import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

export function Home() {
  const navigate = useNavigate()
  const [creatorContract, setCreatorContract] = useState('')
  const [burnRedeemContract, setBurnRedeemContract] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!creatorContract || !burnRedeemContract) return
    navigate(`/${creatorContract}/${burnRedeemContract}`)
  }

  return (
    <div style={{ maxWidth: '320px' }}>
      <header style={{ marginBottom: '4rem' }}>
        <h1 className="text-lg mb-4">Bulk Burn & Redeem</h1>
        <p className="text-text-muted text-sm leading-relaxed">
          Redeem multiple tokens from Manifold burn/redeem campaigns in one session.
          Enter the contract addresses below to view all available redeems.
        </p>
      </header>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '3rem' }}>
          <label className="block text-xs text-text-muted uppercase tracking-wider" style={{ marginBottom: '0.5rem' }}>
            Creator Contract
          </label>
          <input
            type="text"
            value={creatorContract}
            onChange={(e) => setCreatorContract(e.target.value)}
            placeholder="0x..."
            className="w-full px-0 py-3 bg-transparent text-text-primary text-sm focus:outline-none border-b border-text-muted/20 focus:border-text-primary font-mono"
            required
          />
          <p className="text-xs text-text-muted opacity-50" style={{ marginTop: '0.5rem' }}>
            The ERC-1155 contract that holds the reward tokens
          </p>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <label className="block text-xs text-text-muted uppercase tracking-wider" style={{ marginBottom: '0.5rem' }}>
            Burn/Redeem Contract
          </label>
          <input
            type="text"
            value={burnRedeemContract}
            onChange={(e) => setBurnRedeemContract(e.target.value)}
            placeholder="0x..."
            className="w-full px-0 py-3 bg-transparent text-text-primary text-sm focus:outline-none border-b border-text-muted/20 focus:border-text-primary font-mono"
            required
          />
          <p className="text-xs text-text-muted opacity-50" style={{ marginTop: '0.5rem' }}>
            The Manifold burn/redeem extension contract
          </p>
        </div>

        <button
          type="submit"
          disabled={!creatorContract || !burnRedeemContract}
          className="px-8 py-4 text-xs uppercase tracking-wider bg-white hover:bg-accent-hover text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Find Redeems
        </button>
      </form>

    </div>
  )
}
