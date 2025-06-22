import type { AjaxOptions } from "./ajaxOptions";

export type GlobalConfig = Omit<
  AjaxOptions,
  | "onUploadProgress"
  | "onDownloadProgress"
  | "signal"
  | "params"
  | "data"
  | "url"
  | "engine"
>;
