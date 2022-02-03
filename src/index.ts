// Import Third-party Dependencies
import {
  Agent,
  fetch,
  setGlobalDispatcher,
  getGlobalDispatcher,
  MockAgent
} from "undici";

export * from "./request";
export * from "./stream";
export * from "./retry";
export * as policies from "./policies";
export { agents, CustomHttpAgent } from "./agents";
export { DEFAULT_HEADER } from "./utils";

export {
  Agent,
  fetch,
  setGlobalDispatcher,
  getGlobalDispatcher,
  MockAgent
};
