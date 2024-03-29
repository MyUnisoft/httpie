# ERRORS

All errors generated by Httpie failure inherit [`HttpieError`](../src/class/HttpieCommonError.ts).

```ts
interface HttpieError {
  headers: IncomingHttpHeaders;
  statusCode: number;
}
```

## Tools

### isHttpieError

The `isHttpieError` function can be used to find out weither the error is a `@myunisoft/httpie` or a `undici` error.
```ts
function isHttpieError(error: unknown): boolean;
```

Example:
```ts
import * as httpie from "@myunisoft/httpie";

try {
  await httpie.request("GET", "127.0.0.1");
}
catch (error) {
  if (httpie.isHttpieError(error)) {
    // This error inherits from HttpieError.
    console.log(Boolean(error.headers)) // true
    console.log(Boolean(error.statusCode)) // true
  }
  else {
    // This error can be of any error type.
    console.log(Boolean(error.headers)) // false
    console.log(Boolean(error.statusCode)) // false
  }
}
```

### isHTTPError

The `isHTTPError` function can be used to find out if it is an HTTP error.
```ts
function isHTTPError(error: unknown): boolean;
```

Example:
```ts
import * as httpie from "@myunisoft/httpie";

try {
  await httpie.request("GET", "127.0.0.1");
}
catch (error) {
  if (httpie.isHTTPError(error)) {
    console.log(Boolean(error.data)) // true
    console.log(Boolean(error.statusMessage)) // true
    console.log(Boolean(error.headers)) // true
    console.log(Boolean(error.statusCode)) // true
  }
  else {
    // This error can be of any error type.
    console.log(Boolean(error.data)) // false
    console.log(Boolean(error.statusMessage)) // false
  }
}
```

---

## HTTP errors 

If the `RequestOptions.throwOnHttpError` option is set to true, all HTTP responses with a status code higher than 400 will generate an `HttpieOnHttpError` error.

> [!NOTE] 
> Use [`isHTTPError`](#ishttperror) function to know if it is an HTTP error.

```ts
interface HttpieOnHttpError<T> {
  statusCode: number;
  statusMessage: string;
  headers: IncomingHttpHeaders;
  data: T;
}
```

## Failed to retrieve response body

```ts
interface HttpieFetchBodyError {
  statusCode: number;
  headers: IncomingHttpHeaders;
  message: string;
  /** @description original error */
  error?: Error;
}
```

## Failed to decompress response body

If the `RequestOptions.mode` option is set with `decompress` or `parse`, Httpie will try to decompress the response body based on the **content-encoding** header.

If Httpie fails to decompress the response body, an `HttpieDecompressionError` will be raised.

```ts
interface HttpieDecompressionError {
  statusCode: number;
  headers: IncomingHttpHeaders;
  message: string;
  /** @description original error */
  error?: Error;
  /** @description original body as buffer */
  buffer: Buffer;
  /** @description encodings from 'content-encoding' header */
  encodings: string[];
}
```

## Failed to parse response body

If the `RequestOptions.mode` option is set with `parse`, Httpie will try to parse the response body based on the **content-type** header.

If Httpie fails to parse the response body, an `HttpieParserError` will be raised.

```ts
interface HttpieParserError extends IHttpieHandlerError {
  statusCode: number;
  headers: IncomingHttpHeaders;
  message: string;
  /** @description original error */
  error?: Error;
  /** @description content-type from 'content-type' header without params */
  contentType: string;
  /** @description original body as buffer */
  buffer: Buffer;
  /** @description body as string */
  text: string | null;
}
```
