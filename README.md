
<p align="center"><h1 align="center">
  Httpie
</h1>

<p align="center">
  A modern and light Node.js http client 🐢🚀.
</p>

<p align="center">
    <a href="https://github.com/MyUnisoft/httpie">
      <img src="https://img.shields.io/github/package-json/v/MyUnisoft/httpie?style=flat-square" alt="npm version">
    </a>
    <a href="https://github.com/MyUnisoft/httpie">
      <img src="https://img.shields.io/github/license/MyUnisoft/httpie?style=flat-square" alt="license">
    </a>
    <a href="https://api.securityscorecards.dev/projects/github.com/MyUnisoft/httpie">
      <img src="https://api.securityscorecards.dev/projects/github.com/MyUnisoft/httpie/badge" alt="ossf scorecard">
    </a>
    <a href="https://github.com/MyUnisoft/httpie/actions?query=workflow%3A%22Node.js+CI%22">
      <img src="https://img.shields.io/github/actions/workflow/status/MyUnisoft/httpie/node.js.yml" alt="github ci workflow">
    </a>
    <a href="https://github.com/MyUnisoft/httpie">
      <img src="https://img.shields.io/github/languages/code-size/MyUnisoft/httpie?style=flat-square" alt="size">
    </a>
</p>

## 📢 About

The package is inspired by lukeed [httpie](https://github.com/lukeed/httpie) (The use is relatively similar). This package use new Node.js http client [undici](https://github.com/nodejs/undici) under the hood.

## 🔬 Features

- Automatically handles JSON requests and responses.
- Includes aliases for common HTTP verbs: `get`, `post`, `put`, `patch`, and `del`.
- Able to automatically detect domains and paths to assign the right Agent (use a LRU cache to avoid repetitive computation).
- Allows to use an accurate rate-limiter like `p-ratelimit` with the `limit` option.
- Built-in retry mechanism with **custom policies**.
- Safe error handling with Rust-like [Result](https://github.com/OpenAlly/npm-packages/tree/main/src/result).

Thanks to undici:

- Support [HTTP redirections](https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections) with the `maxRedirections` argument.
- Implement high-level API for undici **stream** and **pipeline** method.
- High performance (see [benchmarks](https://undici.nodejs.org/#/?id=benchmarks)).
- Work well with **newest** Node.js API [AbortController](https://nodejs.org/dist/latest-v16.x/docs/api/globals.html#globals_class_abortcontroller) to cancel http request.

Light with seriously maintained dependencies:

![](./docs/images/nodesecure.PNG)

## 🚧 Requirements
- [Node.js](https://nodejs.org/en/) version 18 or higher

## 🚀 Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @myunisoft/httpie
# or
$ yarn add @myunisoft/httpie
```

## 📚 Usage example

The MyUnisoft httpie client is very similar to lukeed httpie http client.

```js
import * as httpie from "@myunisoft/httpie";

try {
  const { data } = await httpie.get("https://jsonplaceholder.typicode.com/posts");
  console.log(data);
  
  const response = await httpie.post("https://jsonplaceholder.typicode.com/posts", {
    body: {
      title: "foo",
      body: "bar",
      userId: 1
    }
  });

  console.log(response.statusCode);
  console.log(response.statusMessage);
  console.log(response.data);
}
catch (error) {
  console.log(error.message);
  console.log(error.statusCode);
  console.log(error.headers);
  console.log(error.data);
}
```

Since v2.0.0 you can also use the `safe` prefix API to get a `Promise<Result<T, E>>`

```ts
import * as httpie from "@myunisoft/httpie";

const response = (await httpie.safePost("https://jsonplaceholder.typicode.com/posts", {
  body: {
    title: "foo",
    body: "bar",
    userId: 1
  }
}))
  .map((response) => response.data)
  .mapErr((error) => new Error("a message here!", { cause: error.data }));
  .unwrap();
```

> 👀 For more examples of use please look at the root folder **examples**.

## 📜 API

- [Request API](./docs/request.md)
- [Retry API](./docs/retry.md)
- [Work and manage Agents](./docs/agents.md)


## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/thomas-gentilhomme/"><img src="https://avatars.githubusercontent.com/u/4438263?v=4?s=100" width="100px;" alt="Gentilhomme"/><br /><sub><b>Gentilhomme</b></sub></a><br /><a href="https://github.com/MyUnisoft/httpie/commits?author=fraxken" title="Code">💻</a> <a href="https://github.com/MyUnisoft/httpie/commits?author=fraxken" title="Documentation">📖</a> <a href="https://github.com/MyUnisoft/httpie/pulls?q=is%3Apr+reviewed-by%3Afraxken" title="Reviewed Pull Requests">👀</a> <a href="#security-fraxken" title="Security">🛡️</a> <a href="https://github.com/MyUnisoft/httpie/issues?q=author%3Afraxken" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/PierreDemailly"><img src="https://avatars.githubusercontent.com/u/39910767?v=4?s=100" width="100px;" alt="PierreDemailly"/><br /><sub><b>PierreDemailly</b></sub></a><br /><a href="https://github.com/MyUnisoft/httpie/commits?author=PierreDemailly" title="Code">💻</a> <a href="https://github.com/MyUnisoft/httpie/commits?author=PierreDemailly" title="Tests">⚠️</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License
MIT
