import AbortError from "./errors/AbortError";
import AjaxError from "./errors/AjaxError";
import HttpError from "./errors/HttpError";
import NetworkError from "./errors/NetworkError";
import TimeoutError from "./errors/TimeoutError";
import type {
  AjaxOptions,
  GlobalConfig,
  ProgressEvent,
  ResponseType,
  XMLHttpRequestBodyInit,
} from "./types";
import { addQueryParams, deepMergeObject, isEmptyObject } from "./utils";

/**
 * Global configuration store for AJAX requests.
 */
let globalConfig: GlobalConfig = {};

/**
 * Set global configuration for AJAX requests
 * @param config Configuration object
 */
export function setConfig(config: GlobalConfig): void {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * Get global configuration or specific config value by key
 * @param key Optional key to get specific config value
 * @returns Whole config object or specific config value
 */
export function getConfig(): GlobalConfig;
export function getConfig<T extends keyof GlobalConfig>(
  key: T
): GlobalConfig[T];
export function getConfig<T extends keyof GlobalConfig>(
  key?: T
): GlobalConfig | GlobalConfig[T] {
  if (key === undefined) {
    return globalConfig;
  }
  return globalConfig[key];
}

/**
 * Prepares and normalizes request options by merging global configurations with request-specific options.
 * Handles request data serialization and URL preparation based on the request method.
 *
 * @param url - The target URL for the request
 * @param options - Request-specific options to override defaults
 * @returns A tuple containing the [finalUrl, preparedOptions]
 */
export function prepareRequest(
  url: string,
  options: AjaxOptions
): [string, AjaxOptions] {
  const globalConfig: GlobalConfig = getConfig(),
    defaultOptions: AjaxOptions = {
      method: "GET",
      headers: {},
      data: null,
      responseType: "json",
      timeout: 0,
      engine: "xhr",
      cache: "default",
      credentials: "same-origin",
      mode: "cors",
      redirect: "follow",
    };

  const finalOptions = deepMergeObject(
      defaultOptions,
      deepMergeObject(globalConfig, options)
    ),
    finalUrl =
      finalOptions.method === "GET" &&
      typeof finalOptions.data === "object" &&
      !isEmptyObject(finalOptions.data || {})
        ? addQueryParams(
            url,
            finalOptions.data as Record<string, string | number | boolean>
          )
        : url;

  const { data } = finalOptions;

  if (
    data &&
    typeof data === "object" &&
    !(data instanceof FormData) &&
    !(data instanceof Blob) &&
    !(data instanceof URLSearchParams) &&
    !(data instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(data)
  ) {
    finalOptions.data = JSON.stringify(finalOptions.data);
  }

  return [finalUrl, finalOptions];
}

/**
 * Unified AJAX request function
 * @param url Request url
 * @param options Request Options
 */
export function ajax<T = unknown>(
  url: string,
  options: AjaxOptions = {}
): Promise<T> {
  return options?.engine === "xhr"
    ? xhrRequest<T>(url, options)
    : fetchRequest<T>(url, options);
}

/**
 * XHR-based request with full feature parity
 * @param url Request url
 * @param options Request Options
 */
export function xhrRequest<T>(url: string, options: AjaxOptions): Promise<T> {
  const [urlWithParams, mergedOptions] = prepareRequest(url, options);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(mergedOptions.method || "GET", urlWithParams, true);

    const headers = mergedOptions.headers || {};

    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    const responseType = mergedOptions.responseType || "json";
    xhr.responseType = responseType === "document" ? "text" : responseType;

    if (mergedOptions.onUploadProgress) {
      xhr.upload.onprogress = (event: ProgressEvent) => {
        const percent = event.total
          ? Math.round((event.loaded / event.total) * 100)
          : 0;

        if (event.lengthComputable) {
          mergedOptions.onUploadProgress!({
            loaded: event.loaded,
            total: event.total,
            lengthComputable: true,
            percent: percent,
          });
        } else {
          mergedOptions.onUploadProgress!({
            loaded: event.loaded,
            total: undefined,
            lengthComputable: false,
            percent: percent,
          });
        }
      };
    }

    if (mergedOptions.onDownloadProgress) {
      let lastPercent = 0;

      xhr.onprogress = (event: ProgressEvent) => {
        const percent = event.total
          ? Math.round((event.loaded / event.total) * 100)
          : 0;

        if (event.lengthComputable) {
          if (percent > lastPercent) {
            lastPercent = percent;
            mergedOptions.onDownloadProgress!({
              loaded: event.loaded,
              total: event.total,
              lengthComputable: true,
              percent: percent,
            });
          }
        } else {
          mergedOptions.onDownloadProgress!({
            loaded: event.loaded,
            total: undefined,
            lengthComputable: false,
            percent: percent,
          });
        }
      };
    }

    if (mergedOptions.timeout) {
      xhr.timeout = mergedOptions.timeout;
      xhr.ontimeout = () => reject(new TimeoutError("Request timeout", 408));
    }

    if (mergedOptions.signal) {
      mergedOptions.signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new AbortError("Request aborted", 0));
      });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let responseData = xhr.response;

        if (responseType === "document") {
          responseData = new DOMParser().parseFromString(
            xhr.responseText,
            "text/html"
          );
        }

        resolve(responseData);
      } else {
        reject(
          new HttpError(
            `Request failed with status ${xhr.status}`,
            xhr.status,
            xhr.response
          )
        );
      }
    };

    xhr.onerror = () => reject(new NetworkError("Network request failed", 0));

    if (mergedOptions.data) {
      const isJson = headers["Content-Type"]?.includes("application/json");

      const body = isJson
        ? JSON.stringify(mergedOptions.data)
        : mergedOptions.data;

      xhr.send(body as XMLHttpRequestBodyInit);
    } else {
      xhr.send();
    }
  });
}

/**
 * Fetch-based request with full feature parity including progress tracking
 * @param url Request url
 * @param options Request Options
 */
export async function fetchRequest<T>(
  url: string,
  options: AjaxOptions
): Promise<T> {
  const [urlWithParams, mergedOptions] = prepareRequest(url, options),
    init: RequestInit = {
      method: mergedOptions.method,
      headers: mergedOptions.headers,
      cache: mergedOptions.cache,
      credentials: mergedOptions.credentials,
      mode: mergedOptions.mode,
      redirect: mergedOptions.redirect,
      signal: mergedOptions.signal,
    };

  if (mergedOptions.data) {
    const isJson =
      mergedOptions.headers?.["Content-Type"]?.includes("application/json");

    init.body = isJson
      ? JSON.stringify(mergedOptions.data)
      : (mergedOptions.data as BodyInit);
  }

  let timeoutId: number | undefined;
  if (mergedOptions.timeout) {
    const controller = new AbortController();
    init.signal = controller.signal;

    timeoutId = window.setTimeout(() => {
      controller.abort();
    }, mergedOptions.timeout);
  }

  try {
    if (mergedOptions.onUploadProgress && init.body) {
      await trackUploadProgress(init.body, mergedOptions.onUploadProgress);
    }

    const response = await fetch(urlWithParams, init);

    if (mergedOptions.onDownloadProgress) {
      return await trackDownloadProgress<T>(
        response,
        mergedOptions.onDownloadProgress,
        mergedOptions.responseType
      );
    }

    if (!response.ok) {
      const errorData = await parseErrorResponse(
        response,
        mergedOptions.responseType
      );

      throw new HttpError(
        `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    return await parseResponse<T>(response, mergedOptions.responseType);
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === "AbortError") {
        if (mergedOptions.timeout)
          throw new TimeoutError("Request timeout", 408);
        else throw new AbortError("Request aborted", 408);
      }
    } else if (error instanceof TypeError) {
      if (error.message.includes("NetworkError"))
        throw new NetworkError("Network request failed", 0);
      else throw new AjaxError(error.message, 0);
    }

    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Tracks upload progress for various body types (Blob, FormData, strings, etc.)
 * and reports progress via callback. For Blobs and FormData, it reads data in chunks
 * to provide granular progress updates.
 *
 * @param body - The request body to track (Blob, FormData, string, ArrayBuffer, etc.)
 * @param onProgress - Callback function that receives progress events
 * @returns A Promise resolving to the processed body
 */
async function trackUploadProgress(
  body: BodyInit,
  onProgress: (progress: ProgressEvent) => void
): Promise<BodyInit> {
  if (body instanceof Blob) return trackBlobProgress(body, onProgress);

  if (body instanceof FormData) return trackFormDataProgress(body, onProgress);

  let size: number = 0;

  if (typeof body === "string") size = new TextEncoder().encode(body).length;

  if (body instanceof ArrayBuffer || body instanceof Uint8Array)
    size = body.byteLength;

  if (body instanceof URLSearchParams)
    size = new TextEncoder().encode(body.toString()).length;

  if (body instanceof Blob) size = body.size;

  onProgress({
    loaded: size,
    total: size,
    lengthComputable: true,
    percent: 0,
  });
  return body;
}

/**
 * Tracks upload progress for Blob objects by reading them in chunks (1MB by default).
 * Provides detailed progress updates during the read operation.
 *
 * @param blob - The Blob object to track
 * @param onProgress - Callback function that receives progress events
 * @returns A Promise resolving to a new Blob with the same content
 */
async function trackBlobProgress(
  blob: Blob,
  onProgress: (progress: ProgressEvent) => void
): Promise<Blob> {
  const readBlobWithProgress = (
    blob: Blob,
    onProgress: (progress: ProgressEvent) => void
  ): Promise<Uint8Array> => {
    const reader = new FileReader(),
      chunks: Uint8Array[] = [],
      chunkSize = 1024 * 1024; // 1MB chunks
    let offset = 0;

    return new Promise<Uint8Array>((resolve, reject) => {
      reader.onerror = () => reject(new Error("Failed to read blob"));

      const readNextChunk = () => {
        if (offset >= blob.size) {
          const result = new Uint8Array(blob.size);
          let position = 0;
          for (const chunk of chunks) {
            result.set(chunk, position);
            position += chunk.length;
          }
          resolve(result);

          return;
        }

        const chunk = blob.slice(offset, offset + chunkSize);
        reader.readAsArrayBuffer(chunk);
      };

      reader.onload = (e) => {
        if (!e.target?.result) {
          reject(new Error("Empty chunk read"));

          return;
        }

        const chunkData = new Uint8Array(e.target.result as ArrayBuffer);
        chunks.push(chunkData);
        offset += chunkData.length;

        onProgress({
          loaded: offset,
          total: blob.size,
          lengthComputable: true,
        });

        readNextChunk();
      };

      readNextChunk();
    });
  };

  return new Blob([await readBlobWithProgress(blob, onProgress)]);
}

/**
 * Tracks upload progress for FormData objects by calculating total size and
 * monitoring progress of each field. Handles both Blob and string fields.
 *
 * @param formData - The FormData object to track
 * @param onProgress - Callback function that receives progress events
 * @returns A Promise resolving to a new FormData with the same content
 */
async function trackFormDataProgress(
  formData: FormData,
  onProgress: (progress: ProgressEvent) => void
): Promise<FormData> {
  const newFormData = new FormData();
  let totalSize = 0,
    loadedSize = 0;

  for (const entry of formData.entries()) {
    const value = entry[1];
    if (value instanceof Blob) {
      totalSize += value.size;
    } else {
      totalSize += new TextEncoder().encode(value.toString()).length;
    }
    newFormData.append(entry[0], value);
  }

  for (const entry of newFormData.entries()) {
    const value = entry[1];
    if (value instanceof Blob) {
      await trackBlobProgress(value, (progress) => {
        loadedSize += progress.loaded;
        onProgress({
          loaded: loadedSize,
          total: totalSize,
          lengthComputable: true,
          percent: Math.round((progress.loaded / totalSize) * 100),
        });
      });
    } else {
      const size = new TextEncoder().encode(value.toString()).length;
      loadedSize += size;
      onProgress({
        loaded: loadedSize,
        total: totalSize,
        lengthComputable: true,
        percent: Math.round((size / totalSize) * 100),
      });
    }
  }

  return newFormData;
}

/**
 * Tracks download progress from a Fetch API Response by reading the stream in chunks.
 * Supports reporting percentage complete when Content-Length is available.
 *
 * @template T - The expected response type
 * @param response - The Fetch API Response object
 * @param onProgress - Callback function that receives progress events
 * @param responseType - Optional type hint for response parsing
 * @returns A Promise resolving to the parsed response data
 * @throws {HttpError} When the response status is not OK
 */
async function trackDownloadProgress<T>(
  response: Response,
  onProgress: (progress: ProgressEvent) => void,
  responseType?: ResponseType
): Promise<T> {
  const contentLength = Number(response.headers.get("Content-Length")),
    reader = response.body?.getReader();

  if (!reader) {
    throw new AjaxError("No response body", response.status);
  }

  let receivedLength = 0;
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    receivedLength += value.length;
    onProgress({
      loaded: receivedLength,
      total: contentLength || undefined,
      percent: contentLength
        ? Math.round((receivedLength / contentLength) * 100)
        : 0,
      lengthComputable: !!contentLength,
    });
  }

  const data = new Uint8Array(receivedLength);
  let position = 0;

  for (const chunk of chunks) {
    data.set(chunk, position);
    position += chunk.length;
  }

  if (!response.ok) {
    const errorData = await parseErrorResponseFromBuffer(data, responseType);
    throw new HttpError(
      `Request failed with status ${response.status}`,
      response.status,
      errorData
    );
  }

  return parseResponseFromBuffer<T>(data, responseType);
}

/**
 * Parses a Fetch API Response according to the specified response type.
 * Supports JSON, text, Blob, ArrayBuffer, and HTML document types.
 *
 * @template T - The expected return type
 * @param response - The Fetch API Response object
 * @param responseType - The expected response type
 * @returns A Promise resolving to the parsed data
 */
async function parseResponse<T>(
  response: Response,
  responseType?: ResponseType
): Promise<T> {
  switch (responseType) {
    case "json":
      return response.json();
    case "text":
      return response.text() as Promise<T>;
    case "blob":
      return response.blob() as Promise<T>;
    case "arraybuffer":
      return response.arrayBuffer() as Promise<T>;
    case "document": {
      const text = await response.text();
      return new DOMParser().parseFromString(text, "text/html") as T;
    }
    default:
      return response.json();
  }
}

/**
 * Attempts to parse an error response, falling back to text if primary parsing fails.
 *
 * @param response - The error Response object
 * @param responseType - The expected response type
 * @returns A Promise resolving to the parsed error data or text
 */
async function parseErrorResponse(
  response: Response,
  responseType?: ResponseType
): Promise<unknown> {
  try {
    return await parseResponse(response, responseType);
  } catch {
    try {
      return await response.text();
    } catch {
      return null;
    }
  }
}

/**
 * Parses response data from a Uint8Array buffer according to the specified type.
 *
 * @template T - The expected return type
 * @param buffer - The binary data buffer
 * @param responseType - The expected response type
 * @returns The parsed data
 */
function parseResponseFromBuffer<T>(
  buffer: Uint8Array,
  responseType?: ResponseType
): T {
  const decoder = new TextDecoder();

  switch (responseType) {
    case "json":
      return JSON.parse(decoder.decode(buffer)) as T;
    case "text":
      return decoder.decode(buffer) as T;
    case "blob":
      return new Blob([buffer]) as T;
    case "arraybuffer":
      return buffer.buffer as T;
    case "document":
      return new DOMParser().parseFromString(
        decoder.decode(buffer),
        "text/html"
      ) as T;
    default:
      return JSON.parse(decoder.decode(buffer)) as T;
  }
}

/**
 * Attempts to parse error response data from a buffer, falling back to text if primary parsing fails.
 *
 * @param buffer - The binary error data
 * @param responseType - The expected response type
 * @returns The parsed error data or text
 */
function parseErrorResponseFromBuffer(
  buffer: Uint8Array,
  responseType?: ResponseType
): unknown {
  try {
    return parseResponseFromBuffer(buffer, responseType);
  } catch {
    try {
      return new TextDecoder().decode(buffer);
    } catch {
      return null;
    }
  }
}
