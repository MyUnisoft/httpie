// Import Node.js Dependencies
import { IncomingHttpHeaders } from "node:http";
import { URLSearchParams } from "node:url";

// Import Third-party Dependencies
import * as undici from "undici";
import { Result } from "@openally/result";
import status from "statuses";

// Import Internal Dependencies
import * as Utils from "./utils";
import { computeURI } from "./agents";
import { HttpieResponseHandler, ModeOfHttpieResponseHandler } from "./class/undiciResponseHandler";
import { HttpieOnHttpError } from "./class/HttpieOnHttpError";
import { HttpieError } from "./class/HttpieCommonError";
import { HttpieDecompressionError, HttpieFetchBodyError, HttpieParserError } from "./class/HttpieHandlerError";

export type WebDavMethod = "MKCOL" | "COPY" | "MOVE" | "LOCK" | "UNLOCK" | "PROPFIND" | "PROPPATCH";
export type HttpMethod = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH" ;
export type InlineCallbackAction = <T>(fn: () => Promise<T>) => Promise<T>;

export type RequestError<T> =
  Partial<HttpieOnHttpError<RequestResponse<T>>> &
  Partial<HttpieDecompressionError> &
  Partial<HttpieFetchBodyError> &
  Partial<HttpieParserError> &
  HttpieError;

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

/**
 * @description httpie "like" request wrapper that use new Node.js http client undici under the hood.
 * @see https://github.com/nodejs/undici
 *
 * @example
 * const { statusCode, data } = await request("GET", "https://ws.dev.myunisoft.tech/ws_monitoring");
 * console.log(statusCode, data); // 200 "true"
 */
export async function request<T>(
  method: HttpMethod | WebDavMethod,
  uri: string | URL,
  options: RequestOptions = {}
): Promise<RequestResponse<T>> {
  const { maxRedirections = 0 } = options;

  const computedURI = computeURI(method, uri);
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

  const requestOptions = { method: method as HttpMethod, headers, body, dispatcher, maxRedirections };
  const requestResponse = limit === null ?
    await undici.request(computedURI.url, requestOptions) :
    await limit(() => undici.request(computedURI.url, requestOptions));

  const statusCode = requestResponse.statusCode;
  const responseHandler = new HttpieResponseHandler(requestResponse);

  let data;
  if (options.mode === "parse" || !options.mode) {
    data = await responseHandler.getData<T>("parse");
  }
  else {
    data = await responseHandler.getData(options.mode);
  }

  const RequestResponse = {
    headers: requestResponse.headers,
    statusMessage: status.message[requestResponse.statusCode]!,
    statusCode,
    data
  };

  const shouldThrowOnHttpError = options.throwOnHttpError ?? true;
  if (shouldThrowOnHttpError && statusCode >= 400) {
    throw new HttpieOnHttpError(RequestResponse);
  }

  return RequestResponse;
}

export async function safeRequest<T, E>(
  method: HttpMethod | WebDavMethod,
  uri: string | URL,
  options: RequestOptions = {}
): Promise<Result<RequestResponse<T>, RequestError<E>>> {
  return Result.wrapAsync<RequestResponse<T>, RequestError<E>>(
    () => request(method, uri, options)
  );
}

export type RequestCallback = <T>(
  uri: string | URL, options?: RequestOptions
) => Promise<RequestResponse<T>>;
export type SafeRequestCallback = <T, E>(
  uri: string | URL, options?: RequestOptions
) => Promise<Result<RequestResponse<T>, RequestError<E>>>;

export const get = request.bind(null, "GET") as RequestCallback;
export const post = request.bind(null, "POST") as RequestCallback;
export const put = request.bind(null, "PUT") as RequestCallback;
export const del = request.bind(null, "DELETE") as RequestCallback;
export const patch = request.bind(null, "PATCH") as RequestCallback;

export const safeGet = safeRequest.bind(null, "GET") as SafeRequestCallback;
export const safePost = safeRequest.bind(null, "POST") as SafeRequestCallback;
export const safePut = safeRequest.bind(null, "PUT") as SafeRequestCallback;
export const safeDel = safeRequest.bind(null, "DELETE") as SafeRequestCallback;
export const safePatch = safeRequest.bind(null, "PATCH") as SafeRequestCallback;
