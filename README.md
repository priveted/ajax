# Priveted.Ajax

A modern and lightweight library for working with ajax, which allows you to use various query technologies in a single style.

#### Installation

```
npm i @priveted/ajax
```

### Usage

```js
import { ajax } from '@priveted/ajax';

// Ajax request using FormData
const form = document.getElementById('my-form');
const data = new FormData(form);
// All options
const defaultOptions = {
  method: "GET",                   // "GET"| "POST" | "PUT" | "PATCH"  | "DELETE" | "HEAD" | "OPTIONS"
  data: data,                      // object | string | FormData | Blob | ArrayBuffer | URLSearchParams | null
  engine: "xhr",                   // "xhr" | "fetch"
  headers: {},                     // object
  timeout: 0,                      // number
  responseType: "json",            // "json" | "text" | "blob" | "arraybuffer" | "document";
  cache: "default";                // "default" | "no-store" | "reload" | "no-cache" | "force-cache" | "only-if-cached";
  credentials: "same-origin",      // "omit" | "same-origin" | "include"
  mode: "cors",                    // "cors" | "no-cors" | "same-origin" | "navigate"
  redirect: "follow",              // "follow" | "error" | "manual"
  signal: undefined,               // undefined | AbortSignal
  onDownloadProgress: (event) => { // event = { loaded: 0, total: 0, percent: 0, lengthComputable: true}
    //...
  },
  onUploadProgress: (event) => {   // event = { loaded: 0, total: 0, percent: 0, lengthComputable: true}
    //...
  }
};
//
ajax('/myUrl', defaultOptions).then((response) => {
  console.log(response);
}).catch((error) => {
  console.log(error);
});
```

### Example of a method using only XMLHttpRequest

```js
import { xhrRequest } from "@priveted/ajax";

xhrRequest("/getPosts?sort=new", {
  method: "GET",
  data: new URLSearchParams("status=active&topic=new"),
})
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.log(error);
  });
```

### Example of a method using only Fetch API

```js
import { fetchRequest } from '@priveted/ajax';

fetchRequest("/post/save", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  }
  data: {
    postId: 123,
  },
})
  .then((response) => {
    console.log(response);
  }).catch((error) => {
    console.log(error);
  });
```

### Global configuration

```js
import { setConfig, getConfig } from "@priveted/ajax";

// The ajax, xhrRequest, and fetchRequest methods will now use this configuration by default.
setConfig({
  timeout: 100,
  cache: "no-cache",
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

// Get all global configuration
const { timeout, cache } = getConfig();
// Get configuration by key
const headers = getConfig("headers");
```
