/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Fundermaps Base API Url
  readonly VITE_FUNDERMAPS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
