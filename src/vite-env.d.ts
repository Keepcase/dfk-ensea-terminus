/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NETWORK?: string
  readonly VITE_DFK_RPC_URL?: string
  readonly VITE_DONATION_ADDRESS?: string
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
