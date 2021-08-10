# Agents

Agents are custom constructs that are used to describe internal and external services.

```js
import { agents } from "@myunisoft/httpie";

console.log(agents); // <- push a new agent in this Array
```

Those custom `agents` are described by the following TypeScript interface:
```ts
export interface CustomHttpAgent {
  customPath: string;
  domains: Set<string>;
  agent: Agent;
  prod: string;
  preprod: string;
  dev: string;
}
```

Example with a test custom agent:
```ts
export const test: CustomHttpAgent = {
  customPath: "test",
  domains: new Set([
    "test.domain.fr",
  ]),
  agent: new Agent({
    connections: 30
  }),
  prod: "",
  preprod: "",
  dev: "https://test.domain.fr"
};

// Note: push it to the package agents list
agents.push(test);
```

The **agent** property is an Undici Agent.
