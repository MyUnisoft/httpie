// Import Third-party Dependencies
import {
  Agent,
  ProxyAgent,
  fetch,
  setGlobalDispatcher,
  getGlobalDispatcher,
  Headers,
  HeadersInit,
  FormData,
  File,
  BodyInit,
  BodyMixin,
  MockAgent,
  mockErrors,
  MockPool,
  Interceptable,
  Client
} from "undici";

export * from "./request";
export * from "./stream";
export * from "./retry";
export * as policies from "./policies";
export { agents, computeURI, type CustomHttpAgent } from "./agents";
export { DEFAULT_HEADER, isHTTPError, isHttpieError } from "./utils";
export { HttpieOnHttpError } from "./class/HttpieOnHttpError";
export * from "./class/undiciResponseHandler";

export {
  Agent,
  ProxyAgent,
  fetch,
  setGlobalDispatcher,
  getGlobalDispatcher,
  Headers,
  type HeadersInit,
  FormData,
  File,
  type BodyInit,
  BodyMixin,
  MockAgent,
  mockErrors,
  MockPool,
  type Interceptable,
  Client
};
