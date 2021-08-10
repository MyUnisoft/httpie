// Node.js Dependencies
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Third-party Dependencies
import * as httpie from "../dist/index.js";
// import * as httpie from "@myunisoft/httpie";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kGithubURL = new URL("https://github.com/");

const cursor = httpie.stream("GET", new URL("NodeSecure/i18n/archive/main.tar.gz", kGithubURL), {
  maxRedirections: 1
});
await cursor(fs.createWriteStream(path.join(__dirname, "archive.tar.gz")));
