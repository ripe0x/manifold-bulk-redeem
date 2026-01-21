import { useState, useEffect, Component, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { config } from './config/wagmi'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Campaigns } from './pages/Campaigns'
import '@rainbow-me/rainbowkit/styles.css'

// Error boundary to catch initialization errors
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    console.error('ErrorBoundary caught:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error details:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, background: '#0a0a0a', color: '#f0f0f0', minHeight: '100vh' }}>
          <h1 style={{ color: '#e94560' }}>Something went wrong</h1>
          <pre style={{ marginTop: 20, padding: 20, background: '#1a1a1a', borderRadius: 8, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

const queryClient = new QueryClient()

const customTheme = darkTheme({
  accentColor: '#e94560',
  accentColorForeground: 'white',
  borderRadius: 'medium',
  fontStack: 'system',
})

function AppContent() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log('App mounted')
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div style={{ padding: 40, background: '#0a0a0a', color: '#888', minHeight: '100vh' }}>
        Initializing...
      </div>
    )
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme}>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/:creatorContract/:burnRedeemContract" element={<Campaigns />} />
                <Route path="/:creatorContract/:burnRedeemContract/:id" element={<Campaigns />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default function App() {
  console.log('App rendering')
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}
