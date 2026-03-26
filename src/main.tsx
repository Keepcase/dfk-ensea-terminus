import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './config/wagmi'
import { MusicProvider } from './hooks/useMusicPlayer'
import { App } from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Orderbook data is stale quickly — 20s matches our polling interval
      staleTime: 20_000,
      refetchInterval: 20_000,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MusicProvider>
          <App />
        </MusicProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)
