// Import Internal Dependencies
import { retry } from "../src/index";

describe("retry (with default policy)", () => {
  it("should throw an Error because the number of retries has been exceeded", async() => {
    expect.assertions(1);

    try {
      await retry(() => {
        throw new Error("exceed");
      });
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
