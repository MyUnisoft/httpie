// Import Internal Dependencies
import { windev } from "./helpers";
import * as Agents from "../src/agents";

// CONSTANTS
const kWindevMonitoringURL = "https://ws-dev.myunisoft.fr/ws_monitoring";

describe("agents", () => {
  it("should be an Array of CustomHttpAgent and must remain extensible", () => {
    expect(Agents.agents instanceof Set).toStrictEqual(true);

    expect(Object.isExtensible(Agents.agents)).toStrictEqual(true);
  });
});

describe("isAgentPathMatchingURI", () => {
  it("should compute the path because it start with '/windev'", () => {
    const result = Agents.isAgentPathMatchingURI("/windev/ws_monitoring", windev);
    expect(result?.href).toStrictEqual(kWindevMonitoringURL);

    // Same but without '/' at the beginning
    const result2 = Agents.isAgentPathMatchingURI("windev/ws_monitoring", windev);
    expect(result2?.href).toStrictEqual(kWindevMonitoringURL);
  });

  it("should not compute the path and return null instead", () => {
    const result = Agents.isAgentPathMatchingURI("/xd/ws_monitoring", windev);

    expect(result).toStrictEqual(null);
  });
});

describe("computeURIOnAllAgents", () => {
  it("should compute with windev agent", () => {
    const result = Agents.computeURIOnAllAgents("/windev/ws_monitoring");
    expect(result.url.href).toStrictEqual(kWindevMonitoringURL);
    expect(result.agent).toStrictEqual(windev.agent);
  });

  it("should return the given URI with no computation", () => {
    const result = Agents.computeURIOnAllAgents("https://www.google.fr/");
    expect(result.url.href).toStrictEqual("https://www.google.fr/");
    expect(result.agent).toStrictEqual(null);
  });

  it("should throw an Error if no computation because that's not a valid URI", () => {
    expect(() => Agents.computeURIOnAllAgents("/xdd/healthz")).toThrow();
  });
});

describe("detectAgentFromURI", () => {
  it("should detect windev agent with URI hostname", () => {
    const returnedAgent = Agents.detectAgentFromURI(new URL("https://ws-dev.myunisoft.fr"));

    expect(returnedAgent).toStrictEqual(windev);
  });

  it("should return null if hostname is not internaly known", () => {
    const returnedAgent = Agents.detectAgentFromURI(new URL("https://www.google.fr/"));

    expect(returnedAgent).toStrictEqual(null);
  });
});

describe("computeURI", () => {
  beforeEach(() => {
    Agents.URICache.clear();
  });

  it("should compute a windev URI (as string)", () => {
    const result = Agents.computeURI("GET", kWindevMonitoringURL);

    expect(result.url.href).toStrictEqual(kWindevMonitoringURL);
    expect(result.agent).toStrictEqual(windev.agent);

    expect(Agents.URICache.has("GET" + kWindevMonitoringURL)).toStrictEqual(true);
  });

  it("should compute a windev URI (as WHATWG URL)", () => {
    const localURL = new URL(kWindevMonitoringURL);
    const result = Agents.computeURI("POST", localURL);

    expect(result.url.href).toStrictEqual(kWindevMonitoringURL);
    expect(result.agent).toStrictEqual(windev.agent);

    expect(Agents.URICache.has("POST" + localURL.toString())).toStrictEqual(true);
  });

  it("should return cached entry", () => {
    Agents.URICache.set("GET" + kWindevMonitoringURL, true as any);
    const result = Agents.computeURI("GET", kWindevMonitoringURL) as unknown as boolean;

    expect(result).toStrictEqual(true);
  });

  it("should not return cached entry because method doesn't match", () => {
    Agents.URICache.set("POST" + kWindevMonitoringURL, true as any);
    const result = Agents.computeURI("GET", kWindevMonitoringURL);

    expect(result.url.href).toStrictEqual(kWindevMonitoringURL);
    expect(result.agent).toStrictEqual(windev.agent);

    expect(Agents.URICache.has("GET" + kWindevMonitoringURL)).toStrictEqual(true);
  });

  it("should compute an URL not related to any local agents", () => {
    const stringURL = "https://www.linkedin.com/feed/";
    const result = Agents.computeURI("GET", new URL("", stringURL));

    expect(result.url.href).toStrictEqual(stringURL);
    expect(result.agent).toStrictEqual(null);
    expect(result.limit).toStrictEqual(undefined);
  });
});
