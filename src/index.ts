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
import { MockInterceptor } from "undici/types/mock-interceptor";

export * from "./request";
export * from "./stream";
export * from "./retry";
export * as policies from "./policies";
export { agents, computeURI, CustomHttpAgent } from "./agents";
export { DEFAULT_HEADER, isHTTPError, isHttpieError } from "./utils";

export * from "./class/undiciResponseHandler";

export {
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
  MockInterceptor,
  Interceptable,
  Client
};
