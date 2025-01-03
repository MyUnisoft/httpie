// Import Third-party Dependencies
import * as undici from "undici";

// Import Internal Dependencies
import { CustomHttpAgent, agents } from "../src/agents";

const windev: CustomHttpAgent = {
  customPath: "windev",
  domains: new Set([
    "ws.dev.myunisoft.tech"
  ]),
  agent: new undici.Agent({
    connections: 500
  }),
  prod: "https://ws.dev.myunisoft.tech",
  preprod: "https://ws.sta.myunisoft.tech",
  dev: "https://ws.dev.myunisoft.tech"
};
agents.add(windev);

export { windev };
