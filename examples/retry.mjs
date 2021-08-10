// Import Third-party Dependencies
import * as httpie from "../dist/index.js";
// import * as httpie from "@myunisoft/httpie";

const { data } = await httpie.retry(async() => {
  return await httpie.get("https://jsonplaceholder.typicode.com/posts");
}, { forever: true }, httpie.policies.httpcode());
console.log(data);
