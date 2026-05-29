/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

interface ImportMetaEnv {
  // Fundermaps Base API Url
  readonly VITE_FUNDERMAPS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
