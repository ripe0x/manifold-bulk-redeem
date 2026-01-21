import { ConnectButton } from '@rainbow-me/rainbowkit'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <header>
        <div className="max-w-5xl mx-auto px-8 py-8 flex items-center justify-between">
          <Link to="/" className="text-xs text-text-muted hover:text-text-primary transition-colors uppercase tracking-wider">
            MANIFOLD BULK REDEEM
          </Link>
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted
              const connected = ready && account && chain

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          className="text-xs text-text-muted hover:text-text-primary transition-colors uppercase tracking-wider"
                        >
                          CONNECT
                        </button>
                      )
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          className="text-xs text-error uppercase tracking-wider"
                        >
                          WRONG NETWORK
                        </button>
                      )
                    }

                    return (
                      <button
                        onClick={openAccountModal}
                        className="text-xs text-text-muted hover:text-text-primary transition-colors uppercase tracking-wider"
                      >
                        {account.displayName}
                      </button>
                    )
                  })()}
                </div>
              )
            }}
          </ConnectButton.Custom>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-8 py-12">{children}</main>
      <footer className="max-w-5xl mx-auto px-8 py-12">
        <div className="border-t border-text-muted/20">
          <p className="text-xs text-text-muted uppercase tracking-wider mt-8">
            MADE BY <a href="https://x.com/ripe0x" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">RIPE</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
