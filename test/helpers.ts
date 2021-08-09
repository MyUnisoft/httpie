// Import Third-party Dependencies
import * as undici from "undici";

// Import Internal Dependencies
import { CustomHttpAgent, agents } from "../src/agents";

const windev: CustomHttpAgent = {
  customPath: "windev",
  domains: new Set([
    "ws-dev.myunisoft.fr"
  ]),
  agent: new undici.Agent({
    connections: 500
  }),
  prod: "https://ws-dev.myunisoft.fr",
  preprod: "https://ws-dev.myunisoft.fr",
  dev: "https://ws-dev.myunisoft.fr"
};
agents.push(windev);

export { windev };
