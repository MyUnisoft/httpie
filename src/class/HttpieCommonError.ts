// Import Third-party Dependencies
import { IncomingHttpHeaders } from "undici/types/header";

type CommonResponseData = {
  statusCode: number;
  headers: IncomingHttpHeaders;
}

export interface IHttpieErrorOptions {
  response: CommonResponseData;
}

export class HttpieError extends Error {
  headers: IncomingHttpHeaders;
  statusCode: number;

  constructor(message: string, options: IHttpieErrorOptions) {
    super(message);

    this.statusCode = options.response.statusCode;
    this.headers = options.response.headers;
  }
}
