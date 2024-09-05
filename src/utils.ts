/* eslint-disable no-redeclare */

// Import Node.js Dependencies
import { IncomingHttpHeaders } from "node:http";

// Import Internal Dependencies
import { RequestOptions, RequestResponse } from "./request";
import { HttpieError } from "./class/HttpieCommonError";
import { HttpieOnHttpError } from "./class/HttpieOnHttpError";

// CONSTANTS
const kDefaultUserAgent = "httpie";
const kDefaultEncodingCharset = "utf-8";
const kCharsetConversionTable = {
  "ISO-8859-1": "latin1"
};

export const DEFAULT_HEADER = { "user-agent": kDefaultUserAgent };

export function isAsyncIterable(value: any): boolean {
  return typeof value[Symbol.asyncIterator] === "function";
}

/**
 * @description Get a valid Node.js charset from the "content-type" http header.
 * @see https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings
 */
export function getEncodingCharset(charset = kDefaultEncodingCharset): BufferEncoding {
  if (Buffer.isEncoding(charset)) {
    return charset as BufferEncoding;
  }

  return charset in kCharsetConversionTable ? kCharsetConversionTable[charset] : "utf-8";
}

/**
 * @description Create a default plain Object headers that will contains a Set of default values like:
 * - User-agent
 * - Authorization
 */
export function createHeaders(options: Partial<Pick<RequestOptions, "headers" | "authorization">>): IncomingHttpHeaders {
  const headers = Object.assign({ ...DEFAULT_HEADER }, options.headers ?? {});

  if (options.authorization) {
    headers.Authorization = createAuthorizationHeader(options.authorization);
  }

  return headers;
}

export function isHttpieError(error: unknown): error is HttpieError {
  return error instanceof HttpieError;
}

export function isHTTPError<T extends RequestResponse<any> = RequestResponse<any>>(
  error: unknown
): error is HttpieOnHttpError<T> {
  return error instanceof HttpieOnHttpError;
}

export function createBody(body: undefined): undefined;
export function createBody(body: any, headers?: IncomingHttpHeaders): string | Buffer;

/**
 * @description Generate a proper body for Undici Client. This method was mainly created to automatically manage JSON content.
 */
export function createBody(body: any, headers: IncomingHttpHeaders = {}): string | Buffer | undefined {
  if (typeof body === "undefined") {
    return void 0;
  }
  if (isAsyncIterable(body)) {
    return body;
  }

  let finalBody = body;
  if (body instanceof URLSearchParams) {
    headers["content-type"] = "application/x-www-form-urlencoded";
    finalBody = body.toString();
  }
  else if (typeof body === "object" && !Buffer.isBuffer(body)) {
    headers["content-type"] = "application/json";
    finalBody = JSON.stringify(body);
  }
  headers["content-length"] = String(Buffer.byteLength(finalBody));

  return finalBody;
}

/**
 * @description Helpers to generate a Basic or Bearer token for the HTTP Authorization header.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization
 */
export function createAuthorizationHeader(authorizationHeaderValue: string): string {
  const isBasicAuthToken = authorizationHeaderValue.includes(":");

  return isBasicAuthToken ?
    `Basic ${Buffer.from(authorizationHeaderValue).toString("base64")}` :
    `Bearer ${authorizationHeaderValue}`;
}

export const env = process.env;

export function getCurrentEnv() {
  const currentEnv: string = (env.NODE_ENV ?? "dev").toLowerCase();

  if (currentEnv.startsWith("prod")) {
    return "prod";
  }
  else if (currentEnv.startsWith("staging") || currentEnv.startsWith("preprod")) {
    return "preprod";
  }

  return "dev";
}
