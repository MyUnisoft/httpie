/* eslint-disable max-lines */
// Import Third-Party Dependencies
import { Interceptable, MockAgent, setGlobalDispatcher } from "undici";

// Import Internal Dependencies
import { request } from "../src/request";
import { brotliCompress, deflate, gzip } from "zlib";
import { promisify } from "util";
import { isHTTPError, isHttpieError } from "../src";
import { randomInt } from "crypto";

// CONSTANTS
const kUrl = "http://test.com";
const kAsyncGzip = promisify(gzip);
const kAsyncBrotli = promisify(brotliCompress);
const kAsyncDeflate = promisify(deflate);

// VARS
let pool: Interceptable;

describe("Httpie.safeRequest", () => {
  beforeAll(() => {
    const mockAgent = new MockAgent();
    setGlobalDispatcher(mockAgent);
    mockAgent.disableNetConnect();

    pool = mockAgent.get(kUrl);
  });

  describe("with ThrowOnHttpError", () => {
    describe("GET", () => {
      it("should throw if the response status code is higher than 400", async() => {
        expect.assertions(4);

        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = randomInt(400, 503);
        const headers = { "content-type": "text/html" };
        const payload = Buffer.from("Body");

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path);
        }
        catch (error) {
          expect(isHTTPError(error)).toBeTruthy();
          expect(error.statusCode).toBe(statusCode);
          expect(error.data).toBe(payload.toString());
          expect(error.headers).toMatchObject(headers);
        }
      });

      it("should not throw if the response status code is lower than 400", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = randomInt(200, 399);
        const headers = { "content-type": "text/html" };
        const payload = Buffer.from("Body");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.statusCode).toBe(statusCode);
        expect(response.data).toBe(payload.toString());
        expect(response.headers).toMatchObject(headers);
      });
    });

    describe("POST", () => {
      it("should throw if the response status code is higher than 400", async() => {
        expect.assertions(4);

        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = randomInt(400, 503);
        const headers = { "content-type": "text/html" };
        const payload = Buffer.from("Body");

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path);
        }
        catch (error) {
          expect(isHTTPError(error)).toBeTruthy();
          expect(error.statusCode).toBe(statusCode);
          expect(error.data).toBe(payload.toString());
          expect(error.headers).toMatchObject(headers);
        }
      });

      it("should not throw if the response status code is lower than 400", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = randomInt(200, 399);
        const headers = { "content-type": "text/html" };
        const payload = Buffer.from("Body");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.statusCode).toBe(statusCode);
        expect(response.data).toBe(payload.toString());
        expect(response.headers).toMatchObject(headers);
      });
    });

    describe("PUT", () => {
      it("should throw if the response status code is higher than 400", async() => {
        expect.assertions(4);

        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = randomInt(400, 503);
        const headers = { "content-type": "text/html" };
        const payload = Buffer.from("Body");

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path);
        }
        catch (error) {
          expect(isHTTPError(error)).toBeTruthy();
          expect(error.statusCode).toBe(statusCode);
          expect(error.data).toBe(payload.toString());
          expect(error.headers).toMatchObject(headers);
        }
      });

      it("should not throw if the response status code is lower than 400", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = randomInt(200, 399);
        const headers = { "content-type": "text/html" };
        const payload = Buffer.from("Body");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.statusCode).toBe(statusCode);
        expect(response.data).toBe(payload.toString());
        expect(response.headers).toMatchObject(headers);
      });
    });

    describe("DELETE", () => {
      it("should throw if the response status code is higher than 400", async() => {
        expect.assertions(4);

        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = randomInt(400, 503);
        const headers = { "content-type": "text/html" };
        const payload = Buffer.from("Body");

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path);
        }
        catch (error) {
          expect(isHTTPError(error)).toBeTruthy();
          expect(error.statusCode).toBe(statusCode);
          expect(error.data).toBe(payload.toString());
          expect(error.headers).toMatchObject(headers);
        }
      });

      it("should not throw if the response status code is lower than 400", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = randomInt(200, 399);
        const headers = { "content-type": "text/html" };
        const payload = Buffer.from("Body");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.statusCode).toBe(statusCode);
        expect(response.data).toBe(payload.toString());
        expect(response.headers).toMatchObject(headers);
      });
    });
  });

  describe("without ThrowOnHttpError", () => {
    describe("GET", () => {
      it("should not throw if the response status code is higher than 400", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = randomInt(400, 503);
        const headers = { "content-type": "text/html" };
        const payload = Buffer.from("Body");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { throwOnHttpError: false });


        expect(response.statusCode).toBe(statusCode);
        expect(response.data).toBe(payload.toString());
        expect(response.headers).toMatchObject(headers);
      });

      it("should not throw if the response status code is lower than 400", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = randomInt(200, 399);
        const headers = { "content-type": "text/html" };
        const payload = Buffer.from("Body");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { throwOnHttpError: false });


        expect(response.statusCode).toBe(statusCode);
        expect(response.data).toBe(payload.toString());
        expect(response.headers).toMatchObject(headers);
      });
    });

    describe("POST", () => {
      it("should not throw if the response status code is higher than 400", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = randomInt(400, 503);
        const headers = { "content-type": "text/html" };
        const payload = Buffer.from("Body");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { throwOnHttpError: false });


        expect(response.statusCode).toBe(statusCode);
        expect(response.data).toBe(payload.toString());
        expect(response.headers).toMatchObject(headers);
      });

      it("should not throw if the response status code is lower than 400", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = randomInt(200, 399);
        const headers = { "content-type": "text/html" };
        const payload = Buffer.from("Body");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { throwOnHttpError: false });


        expect(response.statusCode).toBe(statusCode);
        expect(response.data).toBe(payload.toString());
        expect(response.headers).toMatchObject(headers);
      });
    });

    describe("PUT", () => {
      it("should not throw if the response status code is higher than 400", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = randomInt(400, 503);
        const headers = { "content-type": "text/html" };
        const payload = Buffer.from("Body");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { throwOnHttpError: false });


        expect(response.statusCode).toBe(statusCode);
        expect(response.data).toBe(payload.toString());
        expect(response.headers).toMatchObject(headers);
      });

      it("should not throw if the response status code is lower than 400", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = randomInt(200, 399);
        const headers = { "content-type": "text/html" };
        const payload = Buffer.from("Body");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { throwOnHttpError: false });


        expect(response.statusCode).toBe(statusCode);
        expect(response.data).toBe(payload.toString());
        expect(response.headers).toMatchObject(headers);
      });
    });

    describe("DELETE", () => {
      it("should not throw if the response status code is higher than 400", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = randomInt(400, 503);
        const headers = { "content-type": "text/html" };
        const payload = Buffer.from("Body");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { throwOnHttpError: false });


        expect(response.statusCode).toBe(statusCode);
        expect(response.data).toBe(payload.toString());
        expect(response.headers).toMatchObject(headers);
      });

      it("should not throw if the response status code is lower than 400", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = randomInt(200, 399);
        const headers = { "content-type": "text/html" };
        const payload = Buffer.from("Body");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { throwOnHttpError: false });


        expect(response.statusCode).toBe(statusCode);
        expect(response.data).toBe(payload.toString());
        expect(response.headers).toMatchObject(headers);
      });
    });
  });

  describe("PARSE mode (default)", () => {
    describe("GET", () => {
      it("should return a parsed response as text when 'content-type' header starts with 'text/'", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/klsmdkf" };
        const payload = "La data.";
        const buf = Buffer.from(payload);

        pool.intercept(target).reply(statusCode, buf, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(statusCode);
      });

      it("should return a parsed response as object when 'content-type' header is set with 'application/json'", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "application/json" };
        const payload = { my: "object" };
        const buf = Buffer.from(JSON.stringify(payload));

        pool.intercept(target).reply(statusCode, buf, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(statusCode);
      });

      it("should return a buffer when 'content-type' header is set with 'application/pdf'", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "application/pdf" };
        const payload = Buffer.from("mon pdf");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(Buffer.from(payload));
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(statusCode);
      });

      it("should return a buffer when 'content-type' header is set with unsupported value", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "application/msword" };
        const payload = Buffer.from(JSON.stringify({ my: "object" }));

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should throw when 'content-type' header is set with unsupported value", async() => {
        expect.assertions(5);

        const target = {
          method: "GET",
          path: "/test"
        };
        const statusCode = 200;
        const headers = { "content-type": "unknown" };
        const payload = Buffer.from(JSON.stringify({ my: "object" }));

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path);
        }
        catch (error) {
          expect(isHttpieError(error)).toBeTruthy();
          expect(error.message).toStrictEqual(
            "An unexpected error occurred when trying to parse the response body (reason: 'invalid media type')."
          );
          expect(error.buffer).toStrictEqual(payload);
          expect(error.headers).toMatchObject(headers);
          expect(error.statusCode).toBe(200);
        }
      });

      it("should throw when 'content-encoding' header is set with unsupported value", async() => {
        expect.assertions(5);

        const target = {
          method: "GET",
          path: "/test"
        };

        const payload = await kAsyncGzip("Mon document");
        const headers = { "content-encoding": "unknown" };
        const statusCode = 200;

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path);
        }
        catch (error) {
          expect(error.message).toStrictEqual("Unsupported encoding 'unknown'.");
          expect(error.buffer).toStrictEqual(payload);
          expect(error.headers).toMatchObject(headers);
          expect(error.statusCode).toBe(statusCode);
          expect(isHttpieError(error)).toBeTruthy();
        }
      });

      it("should decompress data when 'content-encoding' header is set with 'gzip'", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "gzip" };
        const payload = Buffer.from("Payload");
        const compressedPayload = await kAsyncGzip(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload.toString());
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(statusCode);
      });

      it("should decompress data when 'content-encoding' header is set with 'x-gzip'", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "x-gzip" };
        const payload = "Payload";
        const compressedPayload = await kAsyncGzip(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path);


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'br'", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "br" };
        const payload = "Payload";
        const compressedPayload = await kAsyncBrotli(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'deflate'", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "deflate" };
        const payload = "Payload";
        const compressedPayload = await kAsyncDeflate(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path);


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(200);
      });
    });

    describe("POST", () => {
      it("should return a parsed response as text when 'content-type' header starts with 'text/'", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/klsmdkf" };
        const payload = "La data.";
        const buf = Buffer.from(payload);

        pool.intercept(target).reply(statusCode, buf, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(statusCode);
      });

      it("should return a parsed response as object when 'content-type' header is set with 'application/json'", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "application/json" };
        const payload = { my: "object" };
        const buf = Buffer.from(JSON.stringify(payload));

        pool.intercept(target).reply(statusCode, buf, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(statusCode);
      });

      it("should return a buffer when 'content-type' header is set with 'application/pdf'", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "application/pdf" };
        const payload = Buffer.from("mon pdf");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(Buffer.from(payload));
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(statusCode);
      });

      it("should return a buffer when 'content-type' header is set with unsupported value", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "application/msword" };
        const payload = Buffer.from(JSON.stringify({ my: "object" }));

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should throw when 'content-type' header is set with unsupported value", async() => {
        expect.assertions(5);

        const target = {
          method: "POST",
          path: "/test"
        };
        const statusCode = 200;
        const headers = { "content-type": "unknown" };
        const payload = Buffer.from(JSON.stringify({ my: "object" }));

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path);
        }
        catch (error) {
          expect(isHttpieError(error)).toBeTruthy();
          expect(error.message).toStrictEqual(
            "An unexpected error occurred when trying to parse the response body (reason: 'invalid media type')."
          );
          expect(error.buffer).toStrictEqual(payload);
          expect(error.headers).toMatchObject(headers);
          expect(error.statusCode).toBe(200);
        }
      });

      it("should throw when 'content-encoding' header is set with unsupported value", async() => {
        expect.assertions(5);

        const target = {
          method: "POST",
          path: "/test"
        };

        const payload = await kAsyncGzip("Mon document");
        const headers = { "content-encoding": "unknown" };
        const statusCode = 200;

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path);
        }
        catch (error) {
          expect(error.message).toStrictEqual("Unsupported encoding 'unknown'.");
          expect(error.buffer).toStrictEqual(payload);
          expect(error.headers).toMatchObject(headers);
          expect(error.statusCode).toBe(statusCode);
          expect(isHttpieError(error)).toBeTruthy();
        }
      });

      it("should decompress data when 'content-encoding' header is set with 'gzip'", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "gzip" };
        const payload = Buffer.from("Payload");
        const compressedPayload = await kAsyncGzip(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload.toString());
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(statusCode);
      });

      it("should decompress data when 'content-encoding' header is set with 'x-gzip'", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "x-gzip" };
        const payload = "Payload";
        const compressedPayload = await kAsyncGzip(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path);


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'br'", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "br" };
        const payload = "Payload";
        const compressedPayload = await kAsyncBrotli(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'deflate'", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "deflate" };
        const payload = "Payload";
        const compressedPayload = await kAsyncDeflate(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path);


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(200);
      });
    });

    describe("PUT", () => {
      it("should return a parsed response as text when 'content-type' header starts with 'text/'", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/klsmdkf" };
        const payload = "La data.";
        const buf = Buffer.from(payload);

        pool.intercept(target).reply(statusCode, buf, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(statusCode);
      });

      it("should return a parsed response as object when 'content-type' header is set with 'application/json'", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "application/json" };
        const payload = { my: "object" };
        const buf = Buffer.from(JSON.stringify(payload));

        pool.intercept(target).reply(statusCode, buf, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(statusCode);
      });

      it("should return a buffer when 'content-type' header is set with 'application/pdf'", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "application/pdf" };
        const payload = Buffer.from("mon pdf");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(Buffer.from(payload));
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(statusCode);
      });

      it("should return a buffer when 'content-type' header is set with unsupported value", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "application/msword" };
        const payload = Buffer.from(JSON.stringify({ my: "object" }));

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should throw when 'content-type' header is set with unsupported value", async() => {
        expect.assertions(5);

        const target = {
          method: "PUT",
          path: "/test"
        };
        const statusCode = 200;
        const headers = { "content-type": "unknown" };
        const payload = Buffer.from(JSON.stringify({ my: "object" }));

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path);
        }
        catch (error) {
          expect(isHttpieError(error)).toBeTruthy();
          expect(error.message).toStrictEqual(
            "An unexpected error occurred when trying to parse the response body (reason: 'invalid media type')."
          );
          expect(error.buffer).toStrictEqual(payload);
          expect(error.headers).toMatchObject(headers);
          expect(error.statusCode).toBe(200);
        }
      });

      it("should throw when 'content-encoding' header is set with unsupported value", async() => {
        expect.assertions(5);

        const target = {
          method: "PUT",
          path: "/test"
        };

        const payload = await kAsyncGzip("Mon document");
        const headers = { "content-encoding": "unknown" };
        const statusCode = 200;

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path);
        }
        catch (error) {
          expect(error.message).toStrictEqual("Unsupported encoding 'unknown'.");
          expect(error.buffer).toStrictEqual(payload);
          expect(error.headers).toMatchObject(headers);
          expect(error.statusCode).toBe(statusCode);
          expect(isHttpieError(error)).toBeTruthy();
        }
      });

      it("should decompress data when 'content-encoding' header is set with 'gzip'", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "gzip" };
        const payload = Buffer.from("Payload");
        const compressedPayload = await kAsyncGzip(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload.toString());
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(statusCode);
      });

      it("should decompress data when 'content-encoding' header is set with 'x-gzip'", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "x-gzip" };
        const payload = "Payload";
        const compressedPayload = await kAsyncGzip(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path);


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'br'", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "br" };
        const payload = "Payload";
        const compressedPayload = await kAsyncBrotli(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'deflate'", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "deflate" };
        const payload = "Payload";
        const compressedPayload = await kAsyncDeflate(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path);


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(200);
      });
    });

    describe("DELETE", () => {
      it("should return a parsed response as text when 'content-type' header starts with 'text/'", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/klsmdkf" };
        const payload = "La data.";
        const buf = Buffer.from(payload);

        pool.intercept(target).reply(statusCode, buf, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(statusCode);
      });

      it("should return a parsed response as object when 'content-type' header is set with 'application/json'", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "application/json" };
        const payload = { my: "object" };
        const buf = Buffer.from(JSON.stringify(payload));

        pool.intercept(target).reply(statusCode, buf, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(statusCode);
      });

      it("should return a buffer when 'content-type' header is set with 'application/pdf'", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "application/pdf" };
        const payload = Buffer.from("mon pdf");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(Buffer.from(payload));
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(statusCode);
      });

      it("should return a buffer when 'content-type' header is set with unsupported value", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "application/msword" };
        const payload = Buffer.from(JSON.stringify({ my: "object" }));

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should throw when 'content-type' header is set with unsupported value", async() => {
        expect.assertions(5);

        const target = {
          method: "DELETE",
          path: "/test"
        };
        const statusCode = 200;
        const headers = { "content-type": "unknown" };
        const payload = Buffer.from(JSON.stringify({ my: "object" }));

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path);
        }
        catch (error) {
          expect(isHttpieError(error)).toBeTruthy();
          expect(error.message).toStrictEqual(
            "An unexpected error occurred when trying to parse the response body (reason: 'invalid media type')."
          );
          expect(error.buffer).toStrictEqual(payload);
          expect(error.headers).toMatchObject(headers);
          expect(error.statusCode).toBe(200);
        }
      });

      it("should throw when 'content-encoding' header is set with unsupported value", async() => {
        expect.assertions(5);

        const target = {
          method: "DELETE",
          path: "/test"
        };

        const payload = await kAsyncGzip("Mon document");
        const headers = { "content-encoding": "unknown" };
        const statusCode = 200;

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path);
        }
        catch (error) {
          expect(error.message).toStrictEqual("Unsupported encoding 'unknown'.");
          expect(error.buffer).toStrictEqual(payload);
          expect(error.headers).toMatchObject(headers);
          expect(error.statusCode).toBe(statusCode);
          expect(isHttpieError(error)).toBeTruthy();
        }
      });

      it("should decompress data when 'content-encoding' header is set with 'gzip'", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "gzip" };
        const payload = Buffer.from("Payload");
        const compressedPayload = await kAsyncGzip(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload.toString());
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(statusCode);
      });

      it("should decompress data when 'content-encoding' header is set with 'x-gzip'", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "x-gzip" };
        const payload = "Payload";
        const compressedPayload = await kAsyncGzip(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path);


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'br'", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "br" };
        const payload = "Payload";
        const compressedPayload = await kAsyncBrotli(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path);

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'deflate'", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "deflate" };
        const payload = "Payload";
        const compressedPayload = await kAsyncDeflate(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path);


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(200);
      });
    });
  });

  describe("DECOMPRESS mode", () => {
    describe("GET", () => {
      it("should return a buffer without parsing it even if 'content-type' header exists", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/klsmdkf" };
        const payload = Buffer.from("La data.");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should throw when 'content-encoding' header is set with unsupported value", async() => {
        expect.assertions(5);

        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-encoding": "unknown" };
        const payload = Buffer.from("Mon document");

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path, { mode: "decompress" });
        }
        catch (error) {
          expect(error.message).toStrictEqual("Unsupported encoding 'unknown'.");
          expect(error.buffer).toMatchObject(payload);
          expect(error.headers).toMatchObject(headers);
          expect(isHttpieError(error)).toBeTruthy();
          expect(error.statusCode).toBe(200);
        }
      });

      it("should throw when 'content-encoding' header is invalid", async() => {
        expect.assertions(8);

        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-encoding": "gzip" };
        const payload = await kAsyncBrotli("Mon document");

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path, { mode: "decompress" });
        }
        catch (error) {
          expect(error.reason).toBeTruthy();
          expect(error.message).toStrictEqual(
            "An unexpected error occurred when trying to decompress the response body (reason: 'incorrect header check')."
          );
          expect(error.buffer).toMatchObject(payload);
          expect(error.headers).toMatchObject(headers);
          expect(error.reason).toBeTruthy();
          expect(error.reason.message).toStrictEqual("incorrect header check");
          expect(isHttpieError(error)).toBeTruthy();
          expect(error.statusCode).toBe(200);
        }
      });

      it("should decompress data when 'content-encoding' header is set with 'gzip'", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "gzip" };
        const payload = Buffer.from("payload");
        const compressedPayload = await kAsyncGzip("payload");

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'x-gzip'", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "x-gzip" };
        const payload = Buffer.from("Payload");
        const compressedPayload = await kAsyncGzip(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'br'", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const payload = Buffer.from("Payload");
        const compressedPayload = await kAsyncBrotli(payload);
        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "br" };

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });
        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'deflate'", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const payload = Buffer.from("Payload");
        const compressedPayload = await kAsyncDeflate(payload);

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "deflate" };

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });
        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });
    });

    describe("POST", () => {
      it("should return a buffer without parsing it even if 'content-type' header exists", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/klsmdkf" };
        const payload = Buffer.from("La data.");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should throw when 'content-encoding' header is set with unsupported value", async() => {
        expect.assertions(5);

        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-encoding": "unknown" };
        const payload = Buffer.from("Mon document");

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path, { mode: "decompress" });
        }
        catch (error) {
          expect(error.message).toStrictEqual("Unsupported encoding 'unknown'.");
          expect(error.buffer).toMatchObject(payload);
          expect(error.headers).toMatchObject(headers);
          expect(isHttpieError(error)).toBeTruthy();
          expect(error.statusCode).toBe(200);
        }
      });

      it("should throw when 'content-encoding' header is invalid", async() => {
        expect.assertions(8);

        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-encoding": "gzip" };
        const payload = await kAsyncBrotli("Mon document");

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path, { mode: "decompress" });
        }
        catch (error) {
          expect(error.reason).toBeTruthy();
          expect(error.message).toStrictEqual(
            "An unexpected error occurred when trying to decompress the response body (reason: 'incorrect header check')."
          );
          expect(error.buffer).toMatchObject(payload);
          expect(error.headers).toMatchObject(headers);
          expect(error.reason).toBeTruthy();
          expect(error.reason.message).toStrictEqual("incorrect header check");
          expect(isHttpieError(error)).toBeTruthy();
          expect(error.statusCode).toBe(200);
        }
      });

      it("should decompress data when 'content-encoding' header is set with 'gzip'", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "gzip" };
        const payload = Buffer.from("payload");
        const compressedPayload = await kAsyncGzip("payload");

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'x-gzip'", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "x-gzip" };
        const payload = Buffer.from("Payload");
        const compressedPayload = await kAsyncGzip(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'br'", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const payload = Buffer.from("Payload");
        const compressedPayload = await kAsyncBrotli(payload);
        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "br" };

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });
        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'deflate'", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const payload = Buffer.from("Payload");
        const compressedPayload = await kAsyncDeflate(payload);

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "deflate" };

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });
        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });
    });

    describe("PUT", () => {
      it("should return a buffer without parsing it even if 'content-type' header exists", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/klsmdkf" };
        const payload = Buffer.from("La data.");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should throw when 'content-encoding' header is set with unsupported value", async() => {
        expect.assertions(5);

        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-encoding": "unknown" };
        const payload = Buffer.from("Mon document");

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path, { mode: "decompress" });
        }
        catch (error) {
          expect(error.message).toStrictEqual("Unsupported encoding 'unknown'.");
          expect(error.buffer).toMatchObject(payload);
          expect(error.headers).toMatchObject(headers);
          expect(isHttpieError(error)).toBeTruthy();
          expect(error.statusCode).toBe(200);
        }
      });

      it("should throw when 'content-encoding' header is invalid", async() => {
        expect.assertions(8);

        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-encoding": "gzip" };
        const payload = await kAsyncBrotli("Mon document");

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path, { mode: "decompress" });
        }
        catch (error) {
          expect(error.reason).toBeTruthy();
          expect(error.message).toStrictEqual(
            "An unexpected error occurred when trying to decompress the response body (reason: 'incorrect header check')."
          );
          expect(error.buffer).toMatchObject(payload);
          expect(error.headers).toMatchObject(headers);
          expect(error.reason).toBeTruthy();
          expect(error.reason.message).toStrictEqual("incorrect header check");
          expect(isHttpieError(error)).toBeTruthy();
          expect(error.statusCode).toBe(200);
        }
      });

      it("should decompress data when 'content-encoding' header is set with 'gzip'", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "gzip" };
        const payload = Buffer.from("payload");
        const compressedPayload = await kAsyncGzip("payload");

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'x-gzip'", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "x-gzip" };
        const payload = Buffer.from("Payload");
        const compressedPayload = await kAsyncGzip(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'br'", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const payload = Buffer.from("Payload");
        const compressedPayload = await kAsyncBrotli(payload);
        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "br" };

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });
        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'deflate'", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const payload = Buffer.from("Payload");
        const compressedPayload = await kAsyncDeflate(payload);

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "deflate" };

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });
        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });
    });

    describe("DELETE", () => {
      it("should return a buffer without parsing it even if 'content-type' header exists", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/klsmdkf" };
        const payload = Buffer.from("La data.");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should throw when 'content-encoding' header is set with unsupported value", async() => {
        expect.assertions(5);

        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-encoding": "unknown" };
        const payload = Buffer.from("Mon document");

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path, { mode: "decompress" });
        }
        catch (error) {
          expect(error.message).toStrictEqual("Unsupported encoding 'unknown'.");
          expect(error.buffer).toMatchObject(payload);
          expect(error.headers).toMatchObject(headers);
          expect(isHttpieError(error)).toBeTruthy();
          expect(error.statusCode).toBe(200);
        }
      });

      it("should throw when 'content-encoding' header is invalid", async() => {
        expect.assertions(8);

        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-encoding": "gzip" };
        const payload = await kAsyncBrotli("Mon document");

        pool.intercept(target).reply(statusCode, payload, { headers });

        try {
          await request(target.method as any, kUrl + target.path, { mode: "decompress" });
        }
        catch (error) {
          expect(error.reason).toBeTruthy();
          expect(error.message).toStrictEqual(
            "An unexpected error occurred when trying to decompress the response body (reason: 'incorrect header check')."
          );
          expect(error.buffer).toMatchObject(payload);
          expect(error.headers).toMatchObject(headers);
          expect(error.reason).toBeTruthy();
          expect(error.reason.message).toStrictEqual("incorrect header check");
          expect(isHttpieError(error)).toBeTruthy();
          expect(error.statusCode).toBe(200);
        }
      });

      it("should decompress data when 'content-encoding' header is set with 'gzip'", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "gzip" };
        const payload = Buffer.from("payload");
        const compressedPayload = await kAsyncGzip("payload");

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'x-gzip'", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "x-gzip" };
        const payload = Buffer.from("Payload");
        const compressedPayload = await kAsyncGzip(payload);

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'br'", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const payload = Buffer.from("Payload");
        const compressedPayload = await kAsyncBrotli(payload);
        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "br" };

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });
        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });

      it("should decompress data when 'content-encoding' header is set with 'deflate'", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const payload = Buffer.from("Payload");
        const compressedPayload = await kAsyncDeflate(payload);

        const statusCode = 200;
        const headers = { "content-type": "text/html", "content-encoding": "deflate" };

        pool.intercept(target).reply(statusCode, compressedPayload, { headers });
        const response = await request(target.method as any, kUrl + target.path, { mode: "decompress" });


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
      });
    });
  });

  describe("RAW mode", () => {
    describe("GET", () => {
      it("should return a buffer without parsing it even if 'content-type' header exists", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/klsmdkf" };
        const payload = Buffer.from("payload");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { mode: "raw" });

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(200);
      });

      it("should return a buffer without decompress it even if 'content-encoding' header exists", async() => {
        const target = {
          method: "GET",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-encoding": "gzip" };
        const payload = await kAsyncGzip("Doc");

        pool.intercept(target).reply(statusCode, payload, { headers });


        const response = await request(target.method as any, kUrl + target.path, { mode: "raw" });


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(200);
      });
    });

    describe("POST", () => {
      it("should return a buffer without parsing it even if 'content-type' header exists", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/klsmdkf" };
        const payload = Buffer.from("payload");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { mode: "raw" });

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(200);
      });

      it("should return a buffer without decompress it even if 'content-encoding' header exists", async() => {
        const target = {
          method: "POST",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-encoding": "gzip" };
        const payload = await kAsyncGzip("Doc");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { mode: "raw" });

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(200);
      });
    });

    describe("PUT", () => {
      it("should return a buffer without parsing it even if 'content-type' header exists", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/klsmdkf" };
        const payload = Buffer.from("payload");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { mode: "raw" });

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(200);
      });

      it("should return a buffer without decompress it even if 'content-encoding' header exists", async() => {
        const target = {
          method: "PUT",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-encoding": "gzip" };
        const payload = await kAsyncGzip("Doc");

        pool.intercept(target).reply(statusCode, payload, { headers });


        const response = await request(target.method as any, kUrl + target.path, { mode: "raw" });


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(200);
      });
    });

    describe("DELETE", () => {
      it("should return a buffer without parsing it even if 'content-type' header exists", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-type": "text/klsmdkf" };
        const payload = Buffer.from("payload");

        pool.intercept(target).reply(statusCode, payload, { headers });

        const response = await request(target.method as any, kUrl + target.path, { mode: "raw" });

        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(200);
      });

      it("should return a buffer without decompress it even if 'content-encoding' header exists", async() => {
        const target = {
          method: "DELETE",
          path: "/test"
        };

        const statusCode = 200;
        const headers = { "content-encoding": "gzip" };
        const payload = await kAsyncGzip("Doc");

        pool.intercept(target).reply(statusCode, payload, { headers });


        const response = await request(target.method as any, kUrl + target.path, { mode: "raw" });


        expect(response.data).toStrictEqual(payload);
        expect(response.headers).toMatchObject(headers);
        expect(response.statusCode).toBe(200);
      });
    });
  });
});
