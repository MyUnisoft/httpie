// Import Node.js Dependencies
import path from "node:path";
import fs from "node:fs";
import { Transform } from "node:stream";

// Import Third-party Dependencies
import fastify from "fastify";
import * as undici from "undici";

// Import Internal Dependencies
import { CustomHttpAgent, agents } from "../../src/agents";

// CONSTANTS
const kFixturesPath = path.join(__dirname, "..", "fixtures");

const toUpperCase = new Transform({
  transform(chunk, enc, next) {
    for (let id = 0; id < chunk.length; id++) {
      const char = chunk[id];
      chunk[id] = char < 97 || char > 122 ? char : char - 32;
    }

    this.push(chunk);
    next();
  }
});

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
  agents.add(serverAgent);

  server.get("/", async() => {
    return {
      uptime: process.uptime()
    };
  });

  server.get("/qs", async(request) => request.query);

  server.get("/home", (request, reply) => {
    reply.send(
      fs.createReadStream(path.join(kFixturesPath, "home.html"))
    );
  });

  server.get("/pipeline", (request, reply) => {
    reply.send(
      request.raw.pipe(toUpperCase)
    );
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

  server.get("/badEncoding", (request, reply) => {
    reply.header("content-encoding", "oui");
    reply.send("{ 'foo': bar }");
  });

  server.get("/pdf", (request, reply) => {
    reply.header("content-type", "application/pdf");
    reply.send("{ 'foo': bar }");
  });

  server.get("/text", (request, reply) => {
    reply.header("content-type", "text/anything");
    reply.send("text");
  });

  await server.listen({ port });

  return server;
}

