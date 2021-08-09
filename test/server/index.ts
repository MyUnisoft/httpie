// Import Third-party Dependencies
import fastify from "fastify";
import * as undici from "undici";

// Import Internal Dependencies
import { CustomHttpAgent, agents } from "../../src/agents";

export async function createServer(customPath = "local", port = 3000) {
  const server = fastify({ logger: false });
  const serverAgent: CustomHttpAgent = {
    customPath,
    domains: new Set([
      `localhost:${port}`
    ]),
    agent: new undici.Agent({
      connections: 10
    }),
    prod: `http://localhost:${port}/`,
    preprod: `http://localhost:${port}/`,
    dev: `http://localhost:${port}/`
  };
  agents.push(serverAgent);

  server.get("/", async() => {
    return {
      uptime: process.uptime()
    };
  });

  server.get("/redirect", (request, reply) => {
    reply.redirect("/");
  });

  server.get("/jsonError", (request, reply) => {
    reply.type("application/json");
    reply.send("{ 'foo': bar }");
  });

  server.get("/notimplemented", (request, reply) => {
    reply.code(501);
    reply.send();
  });

  server.get("/internalerror", (request, reply) => {
    reply.code(500);
    reply.send();
  });

  await server.listen(port);

  return server;
}

