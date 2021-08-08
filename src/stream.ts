// Import Node.js Dependencies
import { Duplex, Writable } from "stream";

// Import Third-party Dependencies
import * as undici from "undici";

// Import Internal Dependencies
import { ReqOptions } from "./request";
import { computeURI } from "./agents";
import * as Utils from "./utils";

export function pipeline(method: string, uri: string | URL, options: Omit<ReqOptions, "limit"> = {}): Duplex {
  const { maxRedirections = 0 } = options;
  const computedURI = computeURI(uri);

  const dispatcher = options.agent ?? computedURI.agent ?? void 0;
  const headers = Utils.createHeaders({ headers: options.headers, authorization: options.authorization });
  const body = Utils.createBody(options.body, headers);

  return undici.pipeline(computedURI.url, {
    method, headers, body, dispatcher, maxRedirections
  }, ({ body }) => body);
}

export type WritableStreamCallback = (writable: Writable) => Promise<undici.Dispatcher.StreamData>;

export function stream(method: string, uri: string | URL, options: Omit<ReqOptions, "limit"> = {}): WritableStreamCallback {
  const { maxRedirections = 0 } = options;
  const computedURI = computeURI(uri);

  const dispatcher = options.agent ?? computedURI.agent ?? void 0;
  const headers = Utils.createHeaders({ headers: options.headers, authorization: options.authorization });
  const body = Utils.createBody(options.body, headers);

  return (writable: Writable) => undici
    .stream(computedURI.url, { method, headers, body, dispatcher, maxRedirections }, () => writable);
}
