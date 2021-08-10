// Import Third-party Dependencies
import { pRateLimit } from "p-ratelimit";
import * as httpie from "../dist/index.js";
// import * as httpie from "@myunisoft/httpie";

// Note: limit can also be provided to an Agent!
const limit = pRateLimit({
  interval: 1_000,
  rate: 10,
  concurrency: 2
});

const { data } = await httpie.get("https://jsonplaceholder.typicode.com/posts", {
  // Provide the limit callback as an options here
  limit
});
console.log(data);
