import type {
  HttpMethod,
  ProgressEvent,
  ResponseType,
  RequestData,
  RequestMode,
  RequestCache,
  RequestEngine,
  RequestRedirect,
  RequestCredentials
} from ".";

export interface AjaxOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  data?: RequestData;
  responseType?: ResponseType;
  timeout?: number;
  engine?: RequestEngine;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  signal?: AbortSignal;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
  onDownloadProgress?: (progressEvent: ProgressEvent) => void;
}
