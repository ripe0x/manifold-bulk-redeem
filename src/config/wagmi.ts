import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet } from 'wagmi/chains'
import { http } from 'wagmi'

const alchemyKey = import.meta.env.VITE_ALCHEMY_API_KEY || 'demo'
// WalletConnect requires a project ID - get one free at https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

export const config = getDefaultConfig({
  appName: 'Manifold Bulk Burn/Redeem',
  projectId,
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`),
  },
  ssr: false,
})
