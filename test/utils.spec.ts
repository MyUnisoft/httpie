// Import Node.js Dependencies
import { IncomingHttpHeaders } from "http2";
import { gzipSync } from "zlib";
import stream from "stream";

// Import Internal Dependencies
import * as Utils from "../src/utils";

describe("isAsyncIterable", () => {
  it("should return false for synchronous iterable like an Array", () => {
    expect(Utils.isAsyncIterable([])).toStrictEqual(false);
  });

  it("should return false for synchronous iterable like a primitive string", () => {
    expect(Utils.isAsyncIterable("foobar")).toStrictEqual(false);
  });

  it("should return true for a Async Generator Function", () => {
    async function* foo() {
      yield "bar";
    }
    expect(Utils.isAsyncIterable(foo())).toStrictEqual(true);
  });
});

describe("getEncodingCharset", () => {
  it("should return 'utf-8' if no value is provided", () => {
    expect(Utils.getEncodingCharset()).toStrictEqual("utf-8");
  });

  it("should return 'utf-8' if the provided charset is not known", () => {
    expect(Utils.getEncodingCharset("bolekeole")).toStrictEqual("utf-8");
  });

  it("should return 'latin1' if the charset is equal to 'ISO-8859-1'", () => {
    expect(Utils.getEncodingCharset("ISO-8859-1")).toStrictEqual("latin1");
  });

  it("should return the charset unchanged (only if the charset is a valid BufferEncoding)", () => {
    expect(Utils.getEncodingCharset("ascii")).toStrictEqual("ascii");
  });
});

describe("createHeaders", () => {
  it("should return a plain object with 'user-agent' equal to 'httpie'", () => {
    const result = Utils.createHeaders({});

    expect(result).toEqual({ "user-agent": "httpie" });
  });

  it("should re-use provided headers plain object", () => {
    const result = Utils.createHeaders({
      headers: { foo: "bar" }
    });

    expect(result).toEqual({ foo: "bar", "user-agent": "httpie" });
  });

  it("should add authorization header (and override original property)", () => {
    const result = Utils.createHeaders({
      headers: {
        Authorization: "bar"
      },
      authorization: "foo"
    });

    expect(result).toEqual({ Authorization: "Bearer foo", "user-agent": "httpie" });
  });
});

describe("createBody", () => {
  it("should return 'undefined' when undefined is provided as body argument", () => {
    expect(Utils.createBody(undefined)).toStrictEqual(undefined);
  });

  it("should be able to prepare and stringify a JSON body", () => {
    const body = {
      foo: "bar"
    };
    const bodyStr = JSON.stringify(body);
    const headerRef: IncomingHttpHeaders = {};

    const result = Utils.createBody(body, headerRef);

    expect(result).toStrictEqual(bodyStr);
    expect(Object.keys(headerRef).length).toStrictEqual(2);
    expect(headerRef["content-type"]).toStrictEqual("application/json");
    expect(headerRef["content-length"]).toStrictEqual(String(Buffer.byteLength(bodyStr)));
  });

  it("should be able to prepare a FORM (URLEncoded) body", () => {
    const body = new URLSearchParams({
      foo: "bar"
    });
    const bodyStr = body.toString();
    const headerRef: IncomingHttpHeaders = {};

    const result = Utils.createBody(body, headerRef);

    expect(result).toStrictEqual(bodyStr);
    expect(Object.keys(headerRef).length).toStrictEqual(2);
    expect(headerRef["content-type"]).toStrictEqual("application/x-www-form-urlencoded");
    expect(headerRef["content-length"]).toStrictEqual(String(Buffer.byteLength(bodyStr)));
  });

  it("should be able to prepare a Buffer body", () => {
    const body = Buffer.from("hello world!");
    const headerRef: IncomingHttpHeaders = {};

    const result = Utils.createBody(body, headerRef);

    expect(result).toStrictEqual(body);
    expect(Object.keys(headerRef).length).toStrictEqual(1);
    expect(headerRef["content-length"]).toStrictEqual(String(Buffer.byteLength(body)));
  });

  it("should return the ReadableStream without any transformation", () => {
    const headerRef: IncomingHttpHeaders = {};
    const readStream = new stream.Readable();

    const result = Utils.createBody(readStream, headerRef);

    expect(result).toStrictEqual(readStream);
    expect(Object.keys(headerRef)).toHaveLength(0);
  });
});

describe("createAuthorizationHeader", () => {
  it("it should start with 'Bearer ' if the token is Bearer or empty string", () => {
    expect(Utils.createAuthorizationHeader("")).toStrictEqual("Bearer ");
    expect(Utils.createAuthorizationHeader("lol")).toStrictEqual("Bearer lol");
  });

  it("it should start with 'Basic ' for a Basic Authentication", () => {
    const result = Utils.createAuthorizationHeader("toto:lolo");
    const base64 = result.split(" ")[1];

    expect(result.startsWith("Basic ")).toBe(true);
    expect(Buffer.from(base64, "base64").toString("ascii")).toStrictEqual("toto:lolo");
  });
});

describe("toError", () => {
  it("it should create an Error with the properties of RequestResponse", () => {
    const reqResponse = {
      statusCode: 404,
      statusMessage: "Not Found",
      data: null,
      headers: {}
    };

    const error = Utils.toError(reqResponse);
    expect(error.name).toStrictEqual("Error");
    expect(error).toMatchObject(reqResponse);
  });
});

describe("parseUndiciResponse", () => {
  const defaultUndiciResponseMeta = {
    statusCode: 200,
    context: {},
    opaque: null,
    trailers: {}
  };

  it("should parse a JSON response with no errors", async() => {
    const payload = JSON.stringify({ foo: "bar" });
    const body: any = {
      text() {
        return Promise.resolve(payload);
      }
    };

    const data = await Utils.parseUndiciResponse<{ foo: string }>({
      ...defaultUndiciResponseMeta, body,
      headers: {
        "content-type": "application/json"
      }
    });

    expect(data).toMatchObject({ foo: "bar" });
  });

  it("should parse an invalid JSON response but still keep the body string in the Error", async() => {
    expect.assertions(1);

    const payload = "{\"foo\": bar}";
    const body: any = {
      text() {
        return Promise.resolve(payload);
      }
    };

    try {
      await Utils.parseUndiciResponse<{ foo: string }>({
        ...defaultUndiciResponseMeta, body,
        headers: {
          "content-type": "application/json"
        }
      });
    }
    catch (error) {
      expect(error.body).toStrictEqual(payload);
    }
  });

  it("should parse the response as a plain/text", async() => {
    const payload = "hello world!";
    const body: any = {
      text() {
        return Promise.resolve(payload);
      }
    };

    const data = await Utils.parseUndiciResponse<string>({
      ...defaultUndiciResponseMeta, body, headers: {}
    });

    expect(data).toStrictEqual(payload);
  });

  it("must unzip data when there is a 'content-encoding' header set with 'gzip' before to converting it to a string", async() => {
    const payload = "hello world!";
    const body: any = {
      async arrayBuffer() {
        return gzipSync(payload);
      }
    };
    const data = await Utils.parseUndiciResponse<string>({
      ...defaultUndiciResponseMeta, body, headers: {
        "content-encoding": "gzip"
      }
    });

    expect(data).toStrictEqual(payload);
  });

  it("must unzip data when there is a 'content-encoding' header set with 'gzip' before to converting it to JSON", async() => {
    const payload = { foo: "hello world!" };
    const body: any = {
      async arrayBuffer() {
        return gzipSync(JSON.stringify(payload));
      }
    };

    const data = await Utils.parseUndiciResponse<string>({
      ...defaultUndiciResponseMeta, body, headers: {
        "content-encoding": "gzip",
        "content-type": "application/json; charset=utf-8"
      }
    });

    expect(data).toStrictEqual(payload);
  });

  it("should not unzip data when 'content-encoding' header is not set", async() => {
    const payload = "hello world!";
    const buf = gzipSync(payload);
    const body: any = {
      text: () => buf.toString()
    };

    const data = await Utils.parseUndiciResponse<string>({
      ...defaultUndiciResponseMeta, body, headers: {}
    });

    expect(data).toStrictEqual(buf.toString());
  });
});

describe("getCurrentEnv", () => {
  afterAll(() => {
    Utils.env.NODE_ENV = "dev";
  });

  it("should return 'prod'", () => {
    Utils.env.NODE_ENV = "prod";
    expect(Utils.getCurrentEnv()).toStrictEqual("prod");
  });

  it("should return 'preprod'", () => {
    Utils.env.NODE_ENV = "staging";
    expect(Utils.getCurrentEnv()).toStrictEqual("preprod");

    Utils.env.NODE_ENV = "preprod";
    expect(Utils.getCurrentEnv()).toStrictEqual("preprod");
  });

  it("should return 'dev'", () => {
    Utils.env.NODE_ENV = "dev";
    expect(Utils.getCurrentEnv()).toStrictEqual("dev");

    Utils.env.NODE_ENV = "test";
    expect(Utils.getCurrentEnv()).toStrictEqual("dev");
  });

  it("should return 'dev' as default value", () => {
    delete Utils.env.NODE_ENV;
    expect(Utils.getCurrentEnv()).toStrictEqual("dev");
  });
});
