
// Import Node.js Dependencies
import { randomBytes } from "node:crypto";

// Import Third-party Dependencies
import { brotliCompressSync, deflateSync, gzipSync } from "zlib";

// Import Internal Dependencies
import { HttpieResponseHandler } from "../src/class/undiciResponseHandler";

function toArrayBuffer(buffer: Buffer) {
  const { byteOffset, byteLength } = buffer;

  return buffer.buffer.slice(byteOffset, byteOffset + byteLength);
}

describe("HttpieResponseHandler.getData", () => {
  it("should return the parsed payload by default", async() => {
    const payload = { foo: "bar" };
    const mockResponse = {
      body: { arrayBuffer: () => toArrayBuffer(Buffer.from(JSON.stringify(payload))) },
      headers: { "content-type": "application/json" }
    };
    const handler = new HttpieResponseHandler(mockResponse as any);
    const data = await handler.getData();

    expect(data).toMatchObject(payload);
  });
});

describe("HttpieResponseHandler.getData (mode: 'raw')", () => {
  it("should return the rawBuffer", async() => {
    const payload = Buffer.from(JSON.stringify({ foo: "bar" }));
    const mockResponse = {
      body: { arrayBuffer: () => toArrayBuffer(payload) },
      headers: { "content-type": "application/json" }
    };
    const handler = new HttpieResponseHandler(mockResponse as any);
    const data = await handler.getData("raw");

    expect(data).toMatchObject(payload);
  });

  it("should throw HttpieFetchBodyError", async() => {
    expect.assertions(4);

    const errMsg = "unexpected error";
    const mockResponse = {
      statusCode: 200,
      body: {
        arrayBuffer: () => {
          throw new Error(errMsg);
        }
      },
      headers: { "content-type": "application/json" }
    };
    const handler = new HttpieResponseHandler(mockResponse as any);
    try {
      await handler.getData();
    }
    catch (error: any) {
      expect(error.name).toStrictEqual("ResponseFetchError");
      expect(error.message)
        .toStrictEqual(`An unexpected error occurred while trying to retrieve the response body (reason: '${errMsg}').`);
      expect(error.statusCode).toStrictEqual(mockResponse.statusCode);
      expect(error.headers).toStrictEqual(mockResponse.headers);
    }
  });
});

describe("HttpieResponseHandler.getData (mode: 'decompress')", () => {
  it("must returns the original buffer when there is no 'content-encoding'", async() => {
    const buf = Buffer.from("hello world!");
    const mockResponse = {
      body: { arrayBuffer: () => toArrayBuffer(buf) },
      headers: {}
    };

    const handler = new HttpieResponseHandler(mockResponse as any);
    const data = await handler.getData("decompress");

    expect(data).toStrictEqual(buf);
  });

  it("must throw when the 'content-encoding' header is set with an unknown value", async() => {
    expect.assertions(6);

    const buf = Buffer.from("hello world!");
    const encoding = randomBytes(4).toString("hex");
    const mockResponse = {
      statusCode: 200,
      body: { arrayBuffer: () => toArrayBuffer(buf) },
      headers: { "content-encoding": encoding }
    };
    const handler = new HttpieResponseHandler(mockResponse as any);

    try {
      await handler.getData("decompress");
    }
    catch (error: any) {
      expect(error.message).toStrictEqual(`Unsupported encoding '${encoding}'.`);
      expect(error.buffer).toStrictEqual(buf);
      expect(error.encodings).toStrictEqual([encoding]);
      expect(error.name).toStrictEqual("DecompressionNotSupported");
      expect(error.statusCode).toStrictEqual(mockResponse.statusCode);
      expect(error.headers).toStrictEqual(mockResponse.headers);
    }
  });

  it("must throw when the 'content-encoding' header is a list that includes an unknown value", async() => {
    expect.assertions(6);

    const buf = Buffer.from("hello world!");
    const encoding = randomBytes(4).toString("hex");
    const mockResponse = {
      statusCode: 200,
      body: { arrayBuffer: () => toArrayBuffer(buf) },
      headers: { "content-encoding": [encoding] }
    };
    const handler = new HttpieResponseHandler(mockResponse as any);

    try {
      await handler.getData("decompress");
    }
    catch (error: any) {
      expect(error.message).toStrictEqual(`Unsupported encoding '${encoding}'.`);
      expect(error.buffer).toStrictEqual(buf);
      expect(error.encodings).toStrictEqual([encoding]);
      expect(error.name).toStrictEqual("DecompressionNotSupported");
      expect(error.statusCode).toStrictEqual(mockResponse.statusCode);
      expect(error.headers).toStrictEqual(mockResponse.headers);
    }
  });

  it(`must use 'gunzip' before to returning an uncompressed buffer
    when the 'content-encoding' header is set with 'gzip'`, async() => {
    const buf = Buffer.from("hello world!");
    const mockResponse = {
      body: { arrayBuffer: () => toArrayBuffer(gzipSync(buf)) },
      headers: { "content-encoding": "gzip" }
    };
    const handler = new HttpieResponseHandler(mockResponse as any);
    const data = await handler.getData("decompress");

    expect(data).toStrictEqual(buf);
  });

  it(`must use 'gunzip' before to returning an uncompressed buffer
    when the 'content-encoding' header is set with 'x-gzip'`, async() => {
    const buf = Buffer.from("hello world!");
    const mockResponse = {
      body: { arrayBuffer: () => toArrayBuffer(gzipSync(buf)) },
      headers: { "content-encoding": "x-gzip" }
    };
    const handler = new HttpieResponseHandler(mockResponse as any);
    const data = await handler.getData("decompress");

    expect(data).toStrictEqual(buf);
  });

  it(`must use 'brotliDecompress' before to returning an uncompressed buffer
    when the 'content-encoding' header is set with 'br'`, async() => {
    const buf = Buffer.from("hello world!");
    const mockResponse = {
      body: { arrayBuffer: () => toArrayBuffer(brotliCompressSync(buf)) },
      headers: { "content-encoding": "br" }
    };
    const handler = new HttpieResponseHandler(mockResponse as any);
    const data = await handler.getData("decompress");

    expect(data).toStrictEqual(buf);
  });

  it(`must use 'inflate' before to returning an uncompressed buffer
    when the 'content-encoding' header is set with 'deflate'`, async() => {
    const buf = Buffer.from("hello world!");
    const mockResponse = {
      body: { arrayBuffer: () => toArrayBuffer(deflateSync(buf)) },
      headers: { "content-encoding": "deflate" }
    };
    const handler = new HttpieResponseHandler(mockResponse as any);
    const data = await handler.getData("decompress");

    expect(data).toStrictEqual(buf);
  });

  it("must decompress in reverse order of the given encodings list when there are multiple compression types", async() => {
    const buf = Buffer.from("hello world!");
    const encodings = ["deflate", "gzip"];
    const mockResponse = {
      body: { arrayBuffer: () => toArrayBuffer(gzipSync(deflateSync(buf))) },
      headers: { "content-encoding": encodings }
    };
    const handler = new HttpieResponseHandler(mockResponse as any);
    const data = await handler.getData("decompress");

    expect(data).toStrictEqual(buf);
  });

  it("must decompress in reverse order of the given encodings string when there are multiple compression types", async() => {
    const buf = Buffer.from("hello world!");
    const encodings = "deflate, gzip";
    const mockResponse = {
      body: { arrayBuffer: () => toArrayBuffer(gzipSync(deflateSync(buf))) },
      headers: { "content-encoding": encodings }
    };
    const handler = new HttpieResponseHandler(mockResponse as any);
    const data = await handler.getData("decompress");

    expect(data).toStrictEqual(buf);
  });
});

describe("HttpieResponseHandler.getData (mode: 'parse')", () => {
  it("should parse a JSON response with no errors", async() => {
    const payload = { foo: "bar" };
    const mockResponse = {
      body: { arrayBuffer: () => toArrayBuffer(Buffer.from(JSON.stringify(payload))) },
      headers: { "content-type": "application/json" }
    };
    const handler = new HttpieResponseHandler(mockResponse as any);
    const data = await handler.getData("parse");

    expect(data).toMatchObject(payload);
  });

  it("should parse an invalid JSON response but still keep the request data in the Error", async() => {
    expect.assertions(5);

    const payload = "{\"foo\": bar}";
    const buf = Buffer.from("{\"foo\": bar}");

    const mockResponse = {
      statusCode: 200,
      body: { arrayBuffer: () => toArrayBuffer(Buffer.from(payload)) },
      headers: { "content-type": "application/json" }
    };
    const handler = new HttpieResponseHandler(mockResponse as any);
    try {
      await handler.getData("parse");
    }
    catch (error: any) {
      expect(error.text).toStrictEqual(payload);
      expect(error.buffer).toStrictEqual(buf);
      expect(error.name).toStrictEqual("ResponseParsingError");
      expect(error.statusCode).toStrictEqual(mockResponse.statusCode);
      expect(error.headers).toMatchObject(mockResponse.headers);
    }
  });

  it("should return the original buffer when there is no content-type", async() => {
    const payload = Buffer.from("hello world!");
    // const data = await HttpieResponseHandler.parseUndiciResponse<Buffer>(payload);

    const mockResponse = {
      body: { arrayBuffer: () => toArrayBuffer(payload) },
      headers: {}
    };
    const handler = new HttpieResponseHandler(mockResponse as any);
    const data = await handler.getData("parse");

    expect(data).toStrictEqual(payload);
  });

  it("must converting it to a string when the 'content-type' header starts with 'text/'", async() => {
    const payload = "hello world!";
    const mockResponse = {
      body: { arrayBuffer: () => toArrayBuffer(Buffer.from(payload)) },
      headers: { "content-type": "text/anything" }
    };
    const handler = new HttpieResponseHandler(mockResponse as any);
    const data = await handler.getData("parse");

    expect(data).toStrictEqual(payload);
  });

  it("must converting body to JSON when the 'content-type' header is set with 'application/json'", async() => {
    const payload = { foo: "hello world!" };

    const mockResponse = {
      body: { arrayBuffer: () => toArrayBuffer(Buffer.from(JSON.stringify(payload))) },
      headers: { "content-type": "application/json; charset=utf-8" }
    };
    const handler = new HttpieResponseHandler(mockResponse as any);
    const data = await handler.getData("parse");

    expect(data).toStrictEqual(payload);
  });

  it("must return the original buffer when 'content-type' header is set with 'application/pdf'", async() => {
    const buf = Buffer.from("hello world!");
    const mockResponse = {
      body: { arrayBuffer: () => toArrayBuffer(buf) },
      headers: { "content-type": "application/pdf" }
    };

    const handler = new HttpieResponseHandler(mockResponse as any);
    const data = await handler.getData("parse");

    expect(data).toStrictEqual(buf);
  });
});
