# Request API
The request method is the root method for making http requests. Short method like get or post use it under the hood.

The method **options** and **response** are described by the following TypeScript interfaces:

```ts
export interface RequestOptions {
  /** Default: 0 */
  maxRedirections?: number;
  /** Default: { "user-agent": "httpie" } */
  headers?: IncomingHttpHeaders;
  body?: any;
  authorization?: string;
  // Could be dynamically computed depending on the provided URI.
  agent?: undici.Agent;
    // API limiter from a package like "p-ratelimit"
  limit?: InlineCallbackAction;
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

## error

Errors are triggered if the returned statusCode is equal or higher than 400. It can occur in case of error when reading the response body (for example an invalid JSON).

The triggered error is constructed as follows:

```ts
export function toError<T>(response: RequestResponse<T>) {
  const err = new Error(response.statusMessage) as Error & RequestResponse<T>;
  err.statusMessage = response.statusMessage;
  err.statusCode = response.statusCode;
  err.headers = response.headers;
  err.data = response.data;

  return err;
}
```

