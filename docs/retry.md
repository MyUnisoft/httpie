# Retry API

Allows to restart http calls according to various criteria that we will call policies. By default there is two built-in policies:
- none (do not stop retry to append). **This is the default policy**.
- httpcode (allow to retry or fail on some http codes).

The httpcode by default retry on codes: `307`, `408`, `429`, `444`, `500`, `503`, `504`, `520`, `521`, `522`, `523`, `524`. However you can also choose to extend the list yourself:

```js
import * as httpie from "@myunisoft/httpie";

const policy = httpie.policies.httpcode(new Set([501]), true);
```

## Usage example

```js
import * as httpie from "@myunisoft/httpie";

const { data } = httpie.retry(async() => {
  return await httpie.get("https://jsonplaceholder.typicode.com/posts");
}, { factor: 1, forever: true }, httpie.policies.httpcode());
```

Retry options are described by the following interface:
```ts
export interface RetryOptions {
  retries?: number;
  minTimeout?: number;
  maxTimeout?: number;
  unref?: boolean;
  factor?: number;
  forever?: boolean;
  signal?: AbortSignal | null;
}
```

By default it will retry three times, with a minTimeout of `1_000` and a factor of `2`.

## Creating your own policy

A policy "callback" is described by the following interface
```ts
export type PolicyCallback = (error?: any) => boolean;
```

So it's pretty straightforward to create a new one. For example here this policy will throw if the error is an `AbortError`.

```js
export function abort(error) {
  return error.name === "AbortError";
}
```
