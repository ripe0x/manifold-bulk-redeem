// Manifold ERC1155 Burn/Redeem Contract
export const BURN_REDEEM_ERC1155 = '0xFc29813Beeb3c7395C7A5f8dfC3352491D5ea0E2' as const
export const BURN_REDEEM_ERC721 = '0xe5ce79AB71A5F1caC06fB3498b25298f37e43327' as const

// Manifold fee per burn/redeem
export const MANIFOLD_FEE = 0.00069
export const MANIFOLD_FEE_WEI = 690000000000000n

// Burn/Redeem ABI
export const BURN_REDEEM_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'creatorContractAddress', type: 'address' },
      { internalType: 'uint256', name: 'instanceId', type: 'uint256' },
    ],
    name: 'getBurnRedeem',
    outputs: [
      {
        components: [
          { internalType: 'address payable', name: 'paymentReceiver', type: 'address' },
          { internalType: 'uint8', name: 'storageProtocol', type: 'uint8' },
          { internalType: 'uint32', name: 'redeemedCount', type: 'uint32' },
          { internalType: 'uint16', name: 'redeemAmount', type: 'uint16' },
          { internalType: 'uint32', name: 'totalSupply', type: 'uint32' },
          { internalType: 'uint8', name: 'contractVersion', type: 'uint8' },
          { internalType: 'uint48', name: 'startDate', type: 'uint48' },
          { internalType: 'uint48', name: 'endDate', type: 'uint48' },
          { internalType: 'uint160', name: 'cost', type: 'uint160' },
          { internalType: 'string', name: 'location', type: 'string' },
          {
            components: [
              { internalType: 'uint256', name: 'requiredCount', type: 'uint256' },
              {
                components: [
                  { internalType: 'uint8', name: 'validationType', type: 'uint8' },
                  { internalType: 'address', name: 'contractAddress', type: 'address' },
                  { internalType: 'uint8', name: 'tokenSpec', type: 'uint8' },
                  { internalType: 'uint8', name: 'burnSpec', type: 'uint8' },
                  { internalType: 'uint72', name: 'amount', type: 'uint72' },
                  { internalType: 'uint256', name: 'minTokenId', type: 'uint256' },
                  { internalType: 'uint256', name: 'maxTokenId', type: 'uint256' },
                  { internalType: 'bytes32', name: 'merkleRoot', type: 'bytes32' },
                ],
                internalType: 'struct IBurnRedeemCore.BurnItem[]',
                name: 'items',
                type: 'tuple[]',
              },
            ],
            internalType: 'struct IBurnRedeemCore.BurnGroup[]',
            name: 'burnSet',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct IBurnRedeemCore.BurnRedeem',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'creatorContractAddress', type: 'address' },
      { internalType: 'uint256', name: 'instanceId', type: 'uint256' },
      { internalType: 'uint32', name: 'burnRedeemCount', type: 'uint32' },
      {
        components: [
          { internalType: 'uint48', name: 'groupIndex', type: 'uint48' },
          { internalType: 'uint48', name: 'itemIndex', type: 'uint48' },
          { internalType: 'address', name: 'contractAddress', type: 'address' },
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'bytes32[]', name: 'merkleProof', type: 'bytes32[]' },
        ],
        internalType: 'struct IBurnRedeemCore.BurnToken[]',
        name: 'burnTokens',
        type: 'tuple[]',
      },
    ],
    name: 'burnRedeem',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const

// Ownable ABI (for getting contract owner)
export const OWNABLE_ABI = [
  {
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Contract metadata ABI
export const CONTRACT_METADATA_ABI = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'contractURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTransferValidatorReference',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// ERC1155 total supply (Manifold specific)
export const ERC1155_SUPPLY_ABI = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// BurnRedeemInitialized event ABI
export const BURN_REDEEM_INITIALIZED_EVENT = {
  type: 'event',
  name: 'BurnRedeemInitialized',
  inputs: [
    { type: 'address', name: 'creatorContract', indexed: true },
    { type: 'uint256', name: 'instanceId', indexed: true },
    { type: 'address', name: 'initializer', indexed: false },
  ],
} as const

// Get the reward token ID for an instance
export const GET_BURN_REDEEM_TOKEN_ABI = [
  {
    inputs: [
      { name: 'creatorContractAddress', type: 'address' },
      { name: 'instanceId', type: 'uint256' },
    ],
    name: 'getBurnRedeemToken',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// ERC1155 ABI
export const ERC1155_ABI = [
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'accounts', type: 'address[]' },
      { name: 'ids', type: 'uint256[]' },
    ],
    name: 'balanceOfBatch',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'operator', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
