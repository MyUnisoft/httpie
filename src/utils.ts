/* eslint-disable no-redeclare */

// Import Node.js Dependencies
import { IncomingHttpHeaders } from "http";

// Import Third-party Dependencies
import * as contentType from "content-type";
import { Dispatcher } from "undici";

// Import Internal Dependencies
import { RequestResponse, ReqOptions } from "./request";

// CONSTANTS
const kDefaultMimeType = "text/plain";
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
 * @description Parse Undici ResponseData (the body is a Node.js Readable Stream).
 * If the response as a content type equal to 'application/json' we automatically parse it with JSON.parse().
 */
export async function parseUndiciResponse<T>(response: Dispatcher.ResponseData): Promise<T | string> {
  const { type, parameters } = contentType.parse(
    response.headers["content-type"] ?? kDefaultMimeType
  );
  response.body.setEncoding(getEncodingCharset(parameters.charset));

  // Reading the Node.js Stream with the AsyncIterable interface.
  let body = "";
  for await (const data of response.body) {
    body += data;
  }

  try {
    return type === "application/json" ? JSON.parse(body) : body;
  }
  catch (error) {
    // Note: Even in case of an error we want to be able to recover the body that caused the JSON parsing error.
    error.body = body;

    throw error;
  }
}

/**
 * @description Create a default plain Object headers that will contains a Set of default values like:
 * - User-agent
 * - Authorization
 */
export function createHeaders(options: Partial<Pick<ReqOptions, "headers" | "authorization">>): IncomingHttpHeaders {
  const headers = Object.assign(options.headers ?? {}, DEFAULT_HEADER);
  if (options.authorization) {
    headers.Authorization = createAuthorizationHeader(options.authorization);
  }

  return headers;
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
 * @description Helpers function to generate an Error with all the required properties from the response.
 * We attach them to the error so that they can be retrieved by the developer in a Catch block.
 */
export function toError<T>(response: RequestResponse<T>) {
  const err = new Error(response.statusMessage) as Error & RequestResponse<T>;
  err.statusMessage = response.statusMessage;
  err.statusCode = response.statusCode;
  err.headers = response.headers;
  err.data = response.data;

  return err;
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

