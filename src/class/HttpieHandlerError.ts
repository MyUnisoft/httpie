/* eslint-disable max-classes-per-file */

// Import Third-party Dependencies
import { HttpieError, HttpieErrorOptions } from "./HttpieCommonError";
import { getDecompressionError, getFetchError, getParserError } from "../common/errors";

interface HttpieHandlerErrorOptions<T extends string = string> extends HttpieErrorOptions {
  /** @description original error */
  error?: Error;
  message: T;
}

// eslint-disable-next-line max-len
interface HttpieDecompressionErrorOptions extends HttpieHandlerErrorOptions<Parameters<typeof getDecompressionError>[0]["message"]> {
  /** @description original body as buffer */
  buffer: Buffer;
  /** @description encodings from 'content-encoding' header */
  encodings: string[];
}

// eslint-disable-next-line max-len
interface HttpieParserErrorOptions extends HttpieHandlerErrorOptions<Parameters<typeof getParserError>[0]["message"]> {
  /** @description content-type from 'content-type' header without params */
  contentType: string;
  /** @description original body as buffer */
  buffer: Buffer;
  /** @description body as string */
  text: string | null;
}

class HttpieHandlerError extends HttpieError {
  reason: Error | null;

  constructor(message: string, options: HttpieHandlerErrorOptions) {
    super(message, options);

    this.name = options.message;
    this.reason = options.error ?? null;
  }
}

export class HttpieFetchBodyError extends HttpieHandlerError {
  constructor(options: HttpieHandlerErrorOptions<Parameters<typeof getFetchError>[0]["message"]>, ...args) {
    super(getFetchError(options, ...args), options);
  }
}

export class HttpieDecompressionError extends HttpieHandlerError {
  buffer: Buffer;
  encodings: string[];

  constructor(options: HttpieDecompressionErrorOptions, ...args) {
    super(getDecompressionError(options, ...args), options);

    this.buffer = options.buffer;
    this.encodings = options.encodings;
  }
}

export class HttpieParserError extends HttpieHandlerError {
  contentType: string;
  buffer: Buffer;
  text: string | null;

  constructor(options: HttpieParserErrorOptions, ...args) {
    super(getParserError(options, ...args), options);

    this.buffer = options.buffer;
    this.contentType = options.contentType;
    this.text = options.text ?? null;
  }
}
