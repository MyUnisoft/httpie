// Import Internal Dependencies
import { HttpieError } from "./HttpieCommonError";
import { RequestResponse } from "../request";

/**
 * @description Class to generate an Error with all the required properties from the response.
 * We attach these to the error so that they can be retrieved by the developer in a Catch block.
 */
export class HttpieOnHttpError<T extends RequestResponse<any>> extends HttpieError {
  name = "HttpieOnHttpError";

  statusMessage: string;
  data: T["data"];

  constructor(response: T) {
    super(response.statusMessage, { response });

    this.statusMessage = response.statusMessage;
    this.data = response.data;
  }
}
