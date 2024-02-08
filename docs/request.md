# Request API
The request method is the root method for making http requests. Short method like get or post use it under the hood.

The method **options** and **response** are described by the following TypeScript interfaces:

```ts
type ModeOfHttpieResponseHandler = "decompress" | "parse" | "raw";

export interface RequestOptions {
  /** @default 0 */
  maxRedirections?: number;
  /** @default{ "user-agent": "httpie" } */
  headers?: IncomingHttpHeaders;
  querystring?: string | URLSearchParams;
  body?: any;
  authorization?: string;
  // Could be dynamically computed depending on the provided URI.
  agent?: undici.Agent | undici.ProxyAgent | undici.MockAgent;
  /** @description API limiter from a package like `p-ratelimit`. */
  limit?: InlineCallbackAction;
  /** @default "parse" */
  mode?: ModeOfHttpieResponseHandler;
  /** @default true */
  throwOnHttpError?: boolean;
}

export interface RequestResponse<T> {
  data: T;
  headers: IncomingHttpHeaders;
  statusMessage: string;
  statusCode: number;
}
```

## request< T >(method: string, uri: string | URL, options?: RequestOptions): Promise< RequestResponse< T > >
The first **method** argument take an [HTTP Verb](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) like `GET`, `POST`, `PATCH` etc. The second one **uri** (Uniform Resource Identifier) take a string or a WHATWG URL.

The options allow you to quickly authenticate and add additional headers:
```js
import { request } from "@myunisoft/httpie";

const { data } = await request("GET", "https://test.domain.fr/user/info", {
  authorization: "Token here",
  headers: {
    "society-id": 1
  }
});
console.log(data);
```

By default the client will detect the `test.domain.fr` hostname and assign the right Undici Agent (if locally configured).

## shorthand methods
Those methods are equivalent to the request arguments (except for `method`)

```ts
export type RequestCallback = <T>(uri: string | URL, options?: RequestOptions) => Promise<RequestResponse<T>>;

export const get = request.bind(null, "GET") as RequestCallback;
export const post = request.bind(null, "POST") as RequestCallback;
export const put = request.bind(null, "PUT") as RequestCallback;
export const del = request.bind(null, "DELETE") as RequestCallback;
export const patch = request.bind(null, "PATCH") as RequestCallback;
```
