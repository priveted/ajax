/// <reference types="vite/client" />

export interface ImportMetaEnv {
  readonly VITE_UPLOAD_URL: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}
