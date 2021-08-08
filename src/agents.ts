// Import Third-party Dependencies
import { Agent } from "undici";
import LRU from "lru-cache";

// Import Internal Dependencies
import { InlineCallbackAction } from "./request";
import { getCurrentEnv } from "./utils";

// CONSTANTS
const kEnvName = getCurrentEnv();

/**
 * @see https://en.wikipedia.org/wiki/Page_replacement_algorithm
 */
export const URICache = new LRU<string | URL, computedUrlAndAgent>({
  max: 100,
  maxAge: 1_000 * 60 * 120
});

export interface computedUrlAndAgent {
  url: URL;
  agent: Agent | null;
  limit?: InlineCallbackAction;
}

/**
 * These are agents specifically designed to work with MyUnisoft.
 */
export interface CustomHttpAgent {
  customPath: string;
  domains: Set<string>;
  agent: Agent;
  prod: string;
  preprod: string;
  dev: string;
  limit?: InlineCallbackAction;
}

export const agents: CustomHttpAgent[] = [];

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
export function computeURI(uri: string | URL): computedUrlAndAgent {
  if (URICache.has(uri)) {
    return URICache.get(uri)!;
  }

  let response: computedUrlAndAgent;
  if (typeof uri === "string") {
    response = computeURIOnAllAgents(uri);
  }
  else {
    const agent = detectAgentFromURI(uri);

    response = { url: uri, agent: agent?.agent ?? null, limit: agent?.limit };
  }
  URICache.set(uri, response);

  return response;
}
