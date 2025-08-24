export type RequestEngine = "xhr" | "fetch";
export type RequestCredentials = "omit" | "same-origin" | "include";
export type RequestMode = "cors" | "no-cors" | "same-origin" | "navigate";
export type RequestRedirect = "follow" | "error" | "manual";
export type RequestCache = "default" | "no-store" | "reload" | "no-cache" | "force-cache" | "only-if-cached";
export type XMLHttpRequestBodyInit = Blob | BufferSource | FormData | URLSearchParams | string;
export type RequestData =
  | string
  | Blob
  | FormData
  | URLSearchParams
  | ArrayBuffer
  | ArrayBufferView
  | Record<string, unknown>
  | null
  | undefined;

export type RequestTransformer = (data: unknown, headers: Record<string, string>) => unknown;
