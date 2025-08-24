import type { AjaxOptions } from "./ajaxOptions";

export type ResponseType = "json" | "text" | "blob" | "arraybuffer" | "document";

export interface AjaxExtendedResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config?: AjaxOptions;
}
export type ResponseTransformer = (data: unknown, response: XMLHttpRequest | Response) => unknown;
