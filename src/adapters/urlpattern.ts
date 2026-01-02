import type { RouteIR } from "../types.js";
import { ConvertRouteError } from "../utils/error.js";
import { SegmentMapper } from "../utils/mapper.js";

function isDefault(s: string | undefined) {
  return !s || s === "*";
}

const unsupportedKeys = [
  "protocol",
  "hostname",
  "port",
  "username",
  "password",
  "search",
  "hash",
] satisfies (keyof URLPattern)[];

// URLPattern SegmentMapper
// Handles URLPattern-specific syntax:
// - :param   - required single segment
// - :param?  - optional single segment
// - :param+  - required multi-segment (one or more)
// - :param*  - optional multi-segment (zero or more)
const urlPatternMapper = new SegmentMapper()
  .match(/^:(\w+)\+$/, (match) => ({
    catchAll: {
      name: match[1],
      greedy: true,
    },
    optional: false,
  }))
  .match(/^:(\w+)\*$/, (match) => ({
    catchAll: {
      name: match[1],
      greedy: true,
    },
    optional: true,
  }))
  .match(/^:(\w+)\?$/, (match) => ({
    catchAll: {
      name: match[1],
      greedy: false,
    },
    optional: true,
  }))
  .match(/^:(\w+)$/, (match) => ({
    catchAll: {
      name: match[1],
      greedy: false,
    },
    optional: false,
  }))
  .match(/^.*$/, () => ({}));

export function fromURLPattern<T extends URLPattern | URLPatternInput>(
  pattern: T,
): RouteIR<T> {
  let obj: URLPattern | URLPatternInit;
  if (typeof pattern === "string") {
    const URLPatternConstructor = getConstructor();
    obj = new URLPatternConstructor(pattern);
  } else {
    obj = pattern;
  }

  for (const prop of unsupportedKeys) {
    if (!isDefault(obj[prop])) {
      throw new ConvertRouteError(`'${prop}' is not yet supported`);
    }
  }
  if ("hasRegExpGroups" in obj && obj.hasRegExpGroups) {
    throw new ConvertRouteError(`RegExp groups are not yet supported`);
  }

  const pathname = obj.pathname ?? "*";

  return {
    pattern,
    params: urlPatternMapper.exec(pathname),
  };
}

export function toURLPattern(route: RouteIR): URLPattern {
  const URLPatternConstructor = getConstructor();
  return new URLPatternConstructor(toURLPatternInput(route));
}

export function toURLPatternInput(route: RouteIR): { pathname: string } {
  let i = 0;
  if (route.params.length === 0) return { pathname: "/" };
  
  const pathname = route.params
    .map((r) => {
      if (r.catchAll?.greedy) {
        const name = r.catchAll.name || `_${++i}`;
        // Greedy catch-all: required (/:name+) or optional (/:name*)
        return r.optional ? `/:${name}*` : `/:${name}+`;
      }
      if (r.catchAll && !r.catchAll.greedy) {
        const name = r.catchAll.name || `_${++i}`;
        // Non-greedy (single segment): required (/:name) or optional (/:name?)
        return r.optional ? `/:${name}?` : `/:${name}`;
      }
      // Literal segment: never optional in URLPattern
      return `/${r.value}`;
    })
    .join("");

  return {
    pathname: pathname === "" || pathname === "*" ? "/*" : pathname,
  };
}

function getConstructor() {
  const URLPatternConstructor: typeof URLPattern | undefined =
    // biome-ignore lint/suspicious/noExplicitAny: check
    (globalThis as any).URLPattern;

  if (!URLPatternConstructor) {
    throw new Error(`URLPattern is not supported`);
  }

  return URLPatternConstructor;
}

export interface URLPatternInit {
  protocol?: string;
  username?: string;
  password?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  baseURL?: string;
}

export type URLPatternInput = string | URLPatternInit;
