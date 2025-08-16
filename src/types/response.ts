export type ResponseType = "json" | "text" | "blob" | "arraybuffer" | "document";

export interface AjaxExtendedResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}
