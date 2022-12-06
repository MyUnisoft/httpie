// Import Node.js Dependencies
import { IncomingHttpHeaders } from "http";
import { URLSearchParams } from "url";

// Import Third-party Dependencies
import * as undici from "undici";
import status from "statuses";

// Import Internal Dependencies
import * as Utils from "./utils";
import { computeURI } from "./agents";

export type HttpMethod = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";
export type InlineCallbackAction = <T>(fn: () => Promise<T>) => Promise<T>;

export interface ReqOptions {
  /** Default: 0 */
  maxRedirections?: number;
  /** Default: { "user-agent": "httpie" } */
  headers?: IncomingHttpHeaders;
  querystring?: string | URLSearchParams;
  body?: any;
  authorization?: string;
  // Could be dynamically computed depending on the provided URI.
  agent?: undici.Agent | undici.ProxyAgent | undici.MockAgent;
  // API limiter from a package like "p-ratelimit"
  limit?: InlineCallbackAction;
}

export interface RequestResponse<T> {
  data: T;
  headers: IncomingHttpHeaders;
  statusMessage: string;
  statusCode: number;
}

/**
 * @description httpie "like" request wrapper that use new Node.js http client undici under the hood.
 * @see https://github.com/nodejs/undici
 *
 * @example
 * const { statusCode, data } = await request("GET", "https://ws-dev.myunisoft.fr/ws_monitoring");
 * console.log(statusCode, data); // 200 "true"
 */
export async function request<T>(method: HttpMethod, uri: string | URL, options: ReqOptions = {}): Promise<RequestResponse<T>> {
  const { maxRedirections = 0 } = options;

  const computedURI = computeURI(uri);
  if (typeof options.querystring !== "undefined") {
    const qs = typeof options.querystring === "string" ? new URLSearchParams(options.querystring) : options.querystring;
    for (const [key, value] of qs.entries()) {
      computedURI.url.searchParams.set(key, value);
    }
  }

  const limit = options.limit ?? computedURI.limit ?? null;
  const dispatcher = options.agent ?? computedURI.agent ?? void 0;

  const headers = Utils.createHeaders({ headers: options.headers, authorization: options.authorization });
  const body = Utils.createBody(options.body, headers);

  const requestOptions = { method, headers, body, dispatcher, maxRedirections };
  const requestResponse = limit === null ?
    await undici.request(computedURI.url, requestOptions) :
    await limit(() => undici.request(computedURI.url, requestOptions));

  const statusCode = requestResponse.statusCode;
  const RequestResponse = {
    headers: requestResponse.headers,
    statusMessage: status.message[requestResponse.statusCode]!,
    statusCode,
    data: void 0 as any
  };

  const data = await Utils.parseUndiciResponse<T>(requestResponse);
  RequestResponse.data = data;

  if (statusCode >= 400) {
    throw Utils.toError(RequestResponse);
  }

  return RequestResponse;
}

export type RequestCallback = <T>(uri: string | URL, options?: ReqOptions) => Promise<RequestResponse<T>>;

export const get = request.bind(null, "GET") as RequestCallback;
export const post = request.bind(null, "POST") as RequestCallback;
export const put = request.bind(null, "PUT") as RequestCallback;
export const del = request.bind(null, "DELETE") as RequestCallback;
export const patch = request.bind(null, "PATCH") as RequestCallback;
