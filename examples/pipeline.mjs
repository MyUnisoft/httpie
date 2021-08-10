// Node.js Dependencies
import { pipeline } from "stream/promises";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Third-party Dependencies
import * as httpie from "../dist/index.js";
// import * as httpie from "@myunisoft/httpie";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));

await pipeline(
  fs.createReadStream(path.join(__dirname, "payload.json")),
  httpie.pipeline("POST", "https://jsonplaceholder.typicode.com/posts"),
  process.stdout
);
