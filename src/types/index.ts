export interface BurnItem {
  validationType: number
  contractAddress: `0x${string}`
  tokenSpec: number
  burnSpec: number
  amount: bigint
  minTokenId: bigint
  maxTokenId: bigint
  merkleRoot: `0x${string}`
}

export interface BurnGroup {
  requiredCount: bigint
  items: BurnItem[]
}

export interface BurnRedeemData {
  paymentReceiver: `0x${string}`
  storageProtocol: number
  redeemedCount: number
  redeemAmount: number
  totalSupply: number
  contractVersion: number
  startDate: number
  endDate: number
  cost: bigint
  location: string
  burnSet: BurnGroup[]
}

export interface Campaign {
  id: string
  data: BurnRedeemData
  isActive: boolean
  artworkUrl?: string
  burnTokenId?: number
  burnContract?: `0x${string}`
  rewardTokenId?: number
  userBalance?: number
  metadata?: Metadata
}

export interface BurnToken {
  groupIndex: number
  itemIndex: number
  contractAddress: `0x${string}`
  id: bigint
  merkleProof: readonly `0x${string}`[]
}

export interface Metadata {
  name?: string
  description?: string
  image?: string
  image_url?: string
}
