import * as httpie from "../dist/index.js";
// import * as httpie from "@myunisoft/httpie";

{
  const { data } = await httpie.request<Buffer>("GET", "127.0.0.1", { mode: "raw" });
  console.log(data) // Buffer
}

{
  const { data } = await httpie.request<Buffer>("GET", "127.0.0.1", { mode: "decompress" });
  console.log(data) // Buffer
}

{
  const { data } = await httpie.request<{ key: "value" }>("GET", "127.0.0.1", { mode: "raw" });
  console.log(data) // [Object] { key: "value" }
}
