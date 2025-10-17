/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ZK_API_URL?: string;
  readonly VITE_ZK_API_KEY?: string;
  readonly VITE_VERCEL_BYPASS_SECRET?: string;
  readonly VITE_NETWORK?: string;
  readonly VITE_TENDERLY_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
