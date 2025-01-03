// Import Third-party Dependencies
import { FastifyInstance } from "fastify";

// Import Internal Dependencies
import { get, post, put, patch, del, safeGet } from "../src/index";

// Helpers and mock
import { createServer } from "./server/index";
import { windev } from "./helpers";

let httpServer: FastifyInstance;
beforeAll(async() => {
  httpServer = await createServer();
});

afterAll(async() => {
  await httpServer.close();
});

describe("http.get", () => {
  it("should GET uptime from local fastify server", async() => {
    const { data } = await get<{ uptime: number }>("/local/");

    expect("uptime" in data).toStrictEqual(true);
    expect(typeof data.uptime).toStrictEqual("number");
  });

  it("should GET query parameters provided to fastify", async() => {
    const { data } = await get<{ name: string }>("/local/qs", {
      querystring: new URLSearchParams({
        name: "foobar"
      })
    });

    expect("name" in data).toStrictEqual(true);
    expect(data.name).toStrictEqual("foobar");
  });

  it("should GET uptime by following an HTTP redirection from local fastify server", async() => {
    const { data } = await get<{ uptime: number }>("/local/redirect", { maxRedirections: 1 });

    expect("uptime" in data).toStrictEqual(true);
    expect(typeof data.uptime).toStrictEqual("number");
  });

  it("should GET uptime through a limit function handler from local fastify server", async() => {
    let executed = false;
    // eslint-disable-next-line func-style
    const limit = (callback) => {
      executed = true;

      return callback();
    };
    const { data } = await get<{ uptime: number }>("/local/", { limit });

    expect("uptime" in data).toStrictEqual(true);
    expect(typeof data.uptime).toStrictEqual("number");
    expect(executed).toStrictEqual(true);
  });

  it("should GET response from windev ws-monitoring endpoint (without Agent)", async() => {
    const { data } = await get<string>("/windev/ws_monitoring");

    expect(data).toStrictEqual(true);
  });

  it("should GET response from windev ws-monitoring endpoint (with Agent)", async() => {
    const { data } = await get<string>("/windev/ws_monitoring", {
      agent: windev.agent
    });

    expect(data).toStrictEqual(true);
  });

  it("should GET json response from node.js health endpoint", async() => {
    const { data } = await get<any>("https://app.dev.myunisoft.tech/api/v1/ipa/healthz");

    expect(Object.keys(data).sort()).toMatchObject([
      "status", "version", "description", "checks"
    ].sort());
  });

  it("should throw a 404 Not Found error because the path is not known", async() => {
    expect.assertions(4);

    try {
      await get<string>("/windev/hlkezcjcke");
    }
    catch (error) {
      expect(error.name).toStrictEqual("HttpieOnHttpError");
      expect(error.statusCode).toStrictEqual(404);
      expect(error.statusMessage).toStrictEqual("Not Found");
      expect(error.data).toMatchSnapshot();
    }
  });

  it("should throw a 'HttpieParserError' with jsonError endpoint from local fastify server", async() => {
    expect.assertions(4);

    const expectedPayload = "{ 'foo': bar }";
    try {
      await get<string>("/local/jsonError");
    }
    catch (error) {
      expect(error.name).toStrictEqual("ResponseParsingError");
      expect(error.reason.name).toStrictEqual("SyntaxError");
      expect(error.text).toStrictEqual(expectedPayload);
      expect(error.buffer).toStrictEqual(Buffer.from(expectedPayload));
    }
  });
});

/**
 * @see https://jsonplaceholder.typicode.com/guide/
 */
describe("http.post", () => {
  it("should POST data on jsonplaceholder API", async() => {
    const body = {
      title: "foo",
      body: "bar",
      userId: 1
    };

    const { data } = await post<typeof body & { userId: number }>("https://jsonplaceholder.typicode.com/posts", { body });
    expect(typeof data.userId).toStrictEqual("number");
    expect(data).toMatchObject(body);
  });
});


describe("http.put", () => {
  it("should PUT data on jsonplaceholder API", async() => {
    const body = {
      id: 1,
      title: "foo",
      body: "bar",
      userId: 1
    };

    const { data } = await put<typeof body & { userId: number }>("https://jsonplaceholder.typicode.com/posts/1", { body });
    expect(data).toEqual(body);
  });
});

describe("http.patch", () => {
  it("should PATCH data on jsonplaceholder API", async() => {
    const body = {
      id: 1,
      title: "foo",
      userId: 1
    };

    const { data } = await patch<typeof body & { userId: number }>("https://jsonplaceholder.typicode.com/posts/1", {
      body: { title: "foo" }
    });
    expect(data).toMatchObject(body);
  });
});

describe("http.del", () => {
  it("should DELETE data on jsonplaceholder API", async() => {
    const { statusCode } = await del<any>("https://jsonplaceholder.typicode.com/posts/1", {
      body: { title: "foo" }
    });
    expect(statusCode).toStrictEqual(200);
  });
});

describe("http.safeGet", () => {
  it("should GET uptime from local fastify server", async() => {
    const result = await safeGet<{ uptime: number }, any>("/local/");

    expect(result.ok).toStrictEqual(true);
    const { data } = result.unwrap();
    expect("uptime" in data).toStrictEqual(true);
    expect(typeof data.uptime).toStrictEqual("number");
  });

  it("should throw a 404 Not Found error because the path is not known", async() => {
    const result = await safeGet<string, any>("/windev/hlkezcjcke");
    expect(result.err).toStrictEqual(true);

    if (result.err) {
      const error = result.val;
      console.log(error);

      expect(error.name).toStrictEqual("HttpieOnHttpError");
      expect(error.statusCode).toStrictEqual(404);
      expect(error.statusMessage).toStrictEqual("Not Found");
      expect(error.data).toMatchSnapshot();
    }
  });
});
