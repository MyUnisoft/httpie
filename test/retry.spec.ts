// Import Third-party Dependencies
import { FastifyInstance } from "fastify";

// Import Internal Dependencies
import { retry, get, policies } from "../src/index";

// Helpers and mock
import { createServer } from "./server/index";

let httpServer: FastifyInstance;
beforeAll(async() => {
  httpServer = await createServer("retry", 1337);
});

afterAll(async() => {
  await httpServer.close();
});

describe("retry (with default policy)", () => {
  it("should throw an Error because the number of retries has been exceeded", async() => {
    expect.assertions(1);

    try {
      await retry(() => {
        throw new Error("exceed");
      }, { factor: 1 });
    }
    catch (error) {
      expect(error.message).toStrictEqual("Exceeded the maximum number of allowed retries!");
    }
  });

  it("should succeed after one try", async() => {
    let count = 0;

    const { data, metrics } = await retry<string>(() => {
      count++;
      if (count === 1) {
        throw new Error("oops");
      }

      return "hello world!";
    });

    expect(data).toStrictEqual("hello world!");
    expect(metrics.attempt).toStrictEqual(1);
    expect(typeof metrics.elapsedTimeoutTime).toStrictEqual("number");
    expect(typeof metrics.executionTimestamp).toStrictEqual("number");
  });

  it("should be stopped with Node.js AbortController", async() => {
    expect.assertions(1);

    let count = 0;
    const controller = new AbortController();

    try {
      await retry(() => {
        count++;
        if (count <= 2) {
          throw new Error("oops");
        }
        controller.abort();

        throw new Error("oops");
      }, { forever: true, signal: controller.signal });
    }
    catch (error) {
      expect(error.message).toStrictEqual("Aborted");
    }
  });
});

describe("retry (with http policy)", () => {
  it("should throw an Error because the number of retries has been exceeded", async() => {
    expect.assertions(1);

    try {
      await retry(async() => get("/retry/internalerror"), { factor: 1, retries: 2 }, policies.httpcode());
    }
    catch (error) {
      expect(error.message).toStrictEqual("Exceeded the maximum number of allowed retries!");
    }
  });

  it("should return the http error because the code (501) is not supported by the policy", async() => {
    expect.assertions(1);

    try {
      await retry(async() => get("/retry/notimplemented"), { factor: 1, retries: 2 }, policies.httpcode());
    }
    catch (error) {
      expect(error.message).toStrictEqual("Not Implemented");
    }
  });

  it("should include code 501 and all other default port", async() => {
    expect.assertions(1);

    try {
      const policy = policies.httpcode(new Set([501]), true);

      await retry(async() => get("/retry/notimplemented"), { factor: 1, retries: 2 }, policy);
    }
    catch (error) {
      expect(error.message).toStrictEqual("Exceeded the maximum number of allowed retries!");
    }
  });
});
