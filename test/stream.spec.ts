// Import Third-party Dependencies
import { FastifyInstance } from "fastify";

// Import Node.js Dependencies
import { createWriteStream, createReadStream, existsSync, promises as fs } from "fs";
import path from "path";
import { pipeline } from "stream/promises";

// Import Internal Dependencies
import * as httpie from "../src/index";
import { createServer } from "./server/index";

// CONSTANTS
const kGithubURL = new URL("https://github.com/");
const kFixturesPath = path.join(__dirname, "fixtures");
const kDownloadPath = path.join(__dirname, "download");

let httpServer: FastifyInstance;
beforeAll(async() => {
  httpServer = await createServer("stream", 1338);
  await fs.mkdir(kDownloadPath, { recursive: true });
});

afterAll(async() => {
  await httpServer.close();
  await fs.rm(kDownloadPath, { force: true, recursive: true });
});

describe("stream", () => {
  it("should fetch a .tar.gz of a given github repository", async() => {
    const fileDestination = path.join(kDownloadPath, "i18n-main.tar.gz");
    const repositoryURL = new URL("NodeSecure/i18n/archive/main.tar.gz", kGithubURL);

    await httpie.stream("GET", repositoryURL, {
      headers: {
        "User-Agent": "httpie",
        "Accept-Encoding": "gzip, deflate"
      },
      maxRedirections: 1
    })(createWriteStream(fileDestination));

    expect(existsSync(fileDestination)).toStrictEqual(true);
  });

  it("should fetch the HTML home from the local fastify server", async() => {
    const fileDestination = path.join(kDownloadPath, "home.html");

    await httpie.stream("GET", "/stream/home")(createWriteStream(fileDestination));

    expect(existsSync(fileDestination)).toStrictEqual(true);
    const [contentA, contentB] = await Promise.all([
      fs.readFile(path.join(kFixturesPath, "home.html"), "utf-8"),
      fs.readFile(path.join(kDownloadPath, "home.html"), "utf-8")
    ]);

    expect(contentA).toStrictEqual(contentB);
  });
});

describe("pipeline", () => {
  it("should be able to pipeline (duplex stream)", async() => {
    const fixtureLocation = path.join(kFixturesPath, "lorem.txt");
    const fileDestination = path.join(kDownloadPath, "lorem.txt");

    await pipeline(
      createReadStream(fixtureLocation),
      httpie.pipeline("GET", "/stream/pipeline"),
      createWriteStream(fileDestination)
    );

    expect(existsSync(fileDestination)).toStrictEqual(true);
    const [contentA, contentB] = await Promise.all([
      fs.readFile(fixtureLocation, "utf-8"),
      fs.readFile(fileDestination, "utf-8")
    ]);

    expect(contentA.toUpperCase()).toStrictEqual(contentB);
  });
});
