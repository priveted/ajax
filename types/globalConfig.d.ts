import type { AjaxOptions } from "./ajaxOptions";

export type GlobalConfig = Omit<
  AjaxOptions,
  "onUploadProgress" | "onDownloadProgress" | "signal" | "data" | "url" | "engine"
>;
