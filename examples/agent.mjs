import * as httpie from "../dist/index.js";

const yoda = {
  customPath: "yoda",
  domains: new Set([
    "app.dev.myunisoft.tech"
  ]),
  agent: new httpie.Agent({
    connections: 500
  }),

  // Work by reading the NODE_ENV var.
  prod: "",
  preprod: "",
  dev: "https://app.dev.myunisoft.tech"
};
httpie.agents.add(yoda);

const { data } = await httpie.get("/api/v1/ipa/healthz");
console.log(data);
