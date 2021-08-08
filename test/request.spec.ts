// Import Internal Dependencies
import { get, post, put, patch, del } from "../src/index";
import { windev } from "./helpers";

describe("http.get", () => {
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
    const { data } = await get<any>("https://yoda.myunisoft.fr:1407/api/v1/ipa/healthz");

    expect(Object.keys(data).sort()).toMatchObject(["status", "version", "description", "details"].sort());
  });

  it("should throw a 404 Not Found error because the path is not known", async() => {
    expect.assertions(4);

    try {
      await get<string>("/windev/hlkezcjcke");
    }
    catch (error) {
      expect(error.name).toStrictEqual("Error");
      expect(error.statusCode).toStrictEqual(404);
      expect(error.statusMessage).toStrictEqual("Not Found");
      expect(error.data).toMatchSnapshot();
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
