// Import Node.js Dependencies
import { Duplex, Writable } from "stream";

// Import Third-party Dependencies
import * as undici from "undici";

// Import Internal Dependencies
import { ReqOptions, HttpMethod, WebDavMethod } from "./request";
import { computeURI } from "./agents";
import * as Utils from "./utils";

export type StreamOptions = Omit<ReqOptions, "limit">;

export function pipeline(
  method: HttpMethod | WebDavMethod,
  uri: string | URL,
  options: StreamOptions = {}
): Duplex {
  const { maxRedirections = 0 } = options;

  const computedURI = computeURI(uri);
  if (typeof options.querystring !== "undefined") {
    const qs = typeof options.querystring === "string" ? new URLSearchParams(options.querystring) : options.querystring;
    for (const [key, value] of qs.entries()) {
      computedURI.url.searchParams.set(key, value);
    }
  }

  const dispatcher = options.agent ?? computedURI.agent ?? void 0;
  const headers = Utils.createHeaders({ headers: options.headers, authorization: options.authorization });
  const body = Utils.createBody(options.body, headers);

  return undici.pipeline(computedURI.url, {
    method: method as HttpMethod, headers, body, dispatcher, maxRedirections
  }, ({ body }) => body);
}

export type WritableStreamCallback = (writable: Writable) => Promise<undici.Dispatcher.StreamData>;

export function stream(
  method: HttpMethod | WebDavMethod,
  uri: string | URL,
  options: StreamOptions = {}
): WritableStreamCallback {
  const { maxRedirections = 0 } = options;
  const computedURI = computeURI(uri);

  const dispatcher = options.agent ?? computedURI.agent ?? void 0;
  const headers = Utils.createHeaders({ headers: options.headers, authorization: options.authorization });
  const body = Utils.createBody(options.body, headers);

  return (writable: Writable) => undici
    .stream(
      computedURI.url,
      { method: method as HttpMethod, headers, body, dispatcher, maxRedirections },
      () => writable
    );
}
