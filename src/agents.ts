// Import Third-party Dependencies
import { Agent, ProxyAgent, MockAgent } from "undici";
import { LRUCache } from "lru-cache";

// Import Internal Dependencies
import { InlineCallbackAction, HttpMethod, WebDavMethod } from "./request";
import { getCurrentEnv } from "./utils";

// CONSTANTS
const kEnvName = getCurrentEnv();

/**
 * @see https://en.wikipedia.org/wiki/Page_replacement_algorithm
 */
export const URICache = new LRUCache<string | URL, computedUrlAndAgent>({
  max: 100,
  ttl: 1_000 * 60 * 120
});

export interface computedUrlAndAgent {
  url: URL;
  agent: Agent | ProxyAgent | MockAgent | null;
  limit?: InlineCallbackAction;
}

/**
 * These are agents specifically designed to work with MyUnisoft.
 */
export interface CustomHttpAgent {
  customPath: string;
  domains: Set<string>;
  agent: Agent | ProxyAgent | MockAgent;
  prod: string;
  preprod: string;
  dev: string;
  limit?: InlineCallbackAction;
}

export const agents: Set<CustomHttpAgent> = new Set();

/**
 * @description Detect if a given string URI is matching a given Agent custom path.
 *
 * @example
 * const URI = computeAgentPath("/windev/ws_monitoring", windev);
 * assert.strictEqual(URI, "https://ws-dev.myunisoft.fr/ws_monitoring");
 */
export function isAgentPathMatchingURI(uri: string, agent: CustomHttpAgent): URL | null {
  // Note: we want to match both '/path/xxx...' and 'path/xxx...'
  const localCustomPath = uri.charAt(0) === "/" ? `/${agent.customPath}` : agent.customPath;

  return uri.startsWith(localCustomPath) ?
    new URL(uri.slice(localCustomPath.length), agent[kEnvName]) :
    null;
}

/**
 * @description Compute a given string URI to the local list of agents.
 */
export function computeURIOnAllAgents(uri: string): computedUrlAndAgent {
  for (const agent of agents) {
    const url = isAgentPathMatchingURI(uri, agent);

    if (url !== null) {
      return { url, agent: agent.agent, limit: agent.limit };
    }
  }
  const url = new URL(uri);
  const agent = detectAgentFromURI(url);

  return {
    url, agent: agent?.agent ?? null, limit: agent?.limit
  };
}

/**
 * @description Seek correspondence with local agents through the URI hostname
 * @see https://nodejs.org/api/url.html#url_url_hostname
 *
 * @example
 * detectAgentFromURI("https://ws-dev.myunisoft.fr/ws_monitoring"); // windev agent
 * detectAgentFromURI("https://www.google.fr/"); // null
 */
export function detectAgentFromURI(uri: URL): CustomHttpAgent | null {
  const hostname = uri.hostname;

  for (const agent of agents) {
    if (agent.domains.has(hostname)) {
      return agent;
    }
  }

  return null;
}

/**
 * @description Compute a given URI (format string or WHATWG URL) and return a fully build URL and paired agent.
 * Under the hood it use a LRU cache
 */
export function computeURI(
  method: HttpMethod | WebDavMethod,
  uri: string | URL
): computedUrlAndAgent {
  const uriStr = method.toUpperCase() + uri.toString();
  if (URICache.has(uriStr)) {
    return URICache.get(uriStr)!;
  }

  let response: computedUrlAndAgent;
  if (typeof uri === "string") {
    response = computeURIOnAllAgents(uri);
  }
  else {
    const agent = detectAgentFromURI(uri);

    response = { url: uri, agent: agent?.agent ?? null, limit: agent?.limit };
  }
  URICache.set(uriStr, response);

  return response;
}
