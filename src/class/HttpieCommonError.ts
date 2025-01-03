// Import Third-party Dependencies
import { IncomingHttpHeaders } from "undici/types/header";

type CommonResponseData = {
  statusCode: number;
  headers: IncomingHttpHeaders;
};

export interface HttpieErrorOptions {
  response: CommonResponseData;
}

export class HttpieError extends Error {
  headers: IncomingHttpHeaders;
  statusCode: number;

  constructor(message: string, options: HttpieErrorOptions) {
    super(message);

    this.statusCode = options.response.statusCode;
    this.headers = options.response.headers;
  }
}
