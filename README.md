# Priveted.Ajax
Modern, lightweight and universal AJAX library that provides a unified interface for multiple request technologies (XHR and Fetch API).

## Features

- Unified API for both XMLHttpRequest and Fetch API
- Support for multiple data types (FormData, Blob, JSON, etc.)
- Progress tracking for uploads/downloads
- Global configuration
- TypeScript support
- Abortable requests
- Comprehensive error handling

## Installation

```bash
npm install @priveted/ajax
```

### Basic Usage

```js
import { ajax } from "@priveted/ajax";

ajax("/api/clean", {
  method: "POST",
  data: { key: "value" },
  responseType: "json",
})
  .then((response) => {
    console.log("Success:", response);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

### API Reference

`ajax(url: string, options?: AjaxOptions): Promise<any>`

The main method that provides a unified interface for making requests. It can use either XHR or Fetch API under the hood based on the `engine` option.

| Option               | Type             | Default       | Description                                                                              |
| -------------------- | ---------------- | ------------- | ---------------------------------------------------------------------------------------- |
| `method`             | string           | "GET"         | HTTP method: "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"                  |
| `data`               | various          | null          | Request data (object, string, FormData, Blob, ArrayBuffer, URLSearchParams)              |
| `engine`             | "xhr" \| "fetch" | "xhr"         | Underlying technology to use                                                             |
| `headers`            | object           | {}            | Request headers                                                                          |
| `timeout`            | number           | 0             | Request timeout in ms                                                                    |
| `responseType`       | string           | "json"        | Response type: "json", "text", "blob", "arraybuffer", "document"                         |
| `cache`              | string           | "default"     | Cache mode: "default", "no-store", "reload", "no-cache", "force-cache", "only-if-cached" |
| `credentials`        | string           | "same-origin" | Credentials policy: "omit", "same-origin", "include"                                     |
| `mode`               | string           | "cors"        | Request mode: "cors", "no-cors", "same-origin", "navigate"                               |
| `redirect`           | string           | "follow"      | Redirect handling: "follow", "error", "manual"                                           |
| `signal`             | AbortSignal      | undefined     | AbortSignal for cancelling request                                                       |
| `onDownloadProgress` | function         | undefined     | Download progress callback                                                               |
| `onUploadProgress`   | function         | undefined     | Upload progress callback                                                                 |

`xhrRequest(url: string, options?: AjaxOptions): Promise<any>`

Make requests using XMLHttpRequest specifically.

```js
import { xhrRequest } from "@priveted/ajax";

xhrRequest("/api/getPosts", {
  method: "GET",
  timeout: 5000,
  onDownloadProgress: (event) => {
    console.log(`Downloaded ${event.percent}%`);
  },
})
  .then((response) => {
    console.log("Success:", response);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

`fetchRequest(url: string, options?: AjaxOptions): Promise<any>`

Make requests using Fetch API specifically.

```js
import { fetchRequest } from "@priveted/ajax";

fetchRequest("/api/post/save", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  data: { key: "value" },
})
  .then((response) => {
    console.log("Success:", response);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

### Configuration

`setConfig(options: GlobalConfig): void`

Set a global configuration that will be used by all kinds of requests.

```js
import { setConfig } from "@priveted/ajax";

setConfig({
  timeout: 10000,
  credentials: "include",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});
```

`getConfig(key?: string): any`

Get global configuration or specific configuration value.

```js
import { getConfig } from "@priveted/ajax";

// Get entire config
const config = getConfig();

// Get specific value
const timeout = getConfig("timeout");
```

### Advanced Examples

Uploading files with progress

```js
import { ajax } from "@priveted/ajax";

const fileInput = document.getElementById("file-input");
const formData = new FormData();
formData.append("file", fileInput.files[0]);

ajax("/upload", {
  method: "POST",
  data: formData,
  onUploadProgress: (event) => {
    console.log(`Upload progress: ${event.percent}%`);
  },
});
```

Cancelling requests

```js
import { ajax } from "@priveted/ajax";

const controller = new AbortController();

ajax("/long-request", {
  signal: controller.signal,
}).catch((error) => {
  if (error.name === "AbortError") {
    console.log("Request was aborted");
  }
});

// Abort the request
controller.abort();
```

### Error Handling

- `NetworkError` for network issues
- `TimeoutError` when request times out
- `HttpError` for HTTP errors (status codes 4xx/5xx)
- `AbortError` when request is aborted

```js
import { ajax } from "@priveted/ajax";

ajax("/api/data").catch((error) => {
  if (error.name === "TimeoutError") {
    console.log("Request timed out");
  } else if (error.name === "HttpError") {
    console.log(`Server responded with ${error.status}`);
  } else {
    console.log("Network error", error.message);
  }
});
```

### Browser Support

The library supports all modern browsers and IE11+. For IE11 you might need polyfills for:
- Promise
- Fetch API (if you want to use fetch engine)

### License
MIT © Eduard Y
