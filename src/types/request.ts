export type RequestEngine = "xhr" | "fetch";
export type RequestCredentials = "omit" | "same-origin" | "include";
export type RequestMode = "cors" | "no-cors" | "same-origin" | "navigate";
export type RequestRedirect = "follow" | "error" | "manual";
export type RequestCache = "default" | "no-store" | "reload" | "no-cache" | "force-cache" | "only-if-cached";
export type XMLHttpRequestBodyInit =
  | Blob
  | ArrayBuffer
  | ArrayBufferView
  | FormData
  | URLSearchParams
  | string
  | Document
  | null
  | undefined;
export type RequestData =
  | Record<string, string | number | boolean>
  | FormData
  | string
  | Blob
  | ArrayBuffer
  | URLSearchParams
  | null;
