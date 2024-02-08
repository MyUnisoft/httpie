import * as httpie from "../dist/index.js";
// import * as httpie from "@myunisoft/httpie";

// Should not throw
async() => {
  const { statusCode } = await httpie.request("GET", "127.0.0.1", { throwOnHttpError: false });
  console.log(statusCode) // 500
}

// Should throw
async() => {
  let statusCode;
  try {
    (statusCode = await httpie.request("GET", "127.0.0.1", { throwOnHttpError: true }));
  } catch (error) {
    console.log(statusCode) // undefined
    console.log(error.statusCode) // 500
  }
}
