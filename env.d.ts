/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

interface ImportMetaEnv {
  // Fundermaps Base API Url
  readonly VITE_FUNDERMAPS_URL: string
  /** Auth app origin; defaults to https://auth.fundermaps.com */
  readonly VITE_AUTH_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
