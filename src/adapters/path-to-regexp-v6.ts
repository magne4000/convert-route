import type { RouteIR } from "../types.js";
import { ConvertRouteError } from "../utils/error.js";
import { join } from "../utils/join.js";
import { SegmentMapper } from "../utils/mapper.js";

const mapper = new SegmentMapper()
  .match(/^\(\.\*\)$/, () => ({
    // Not 100% correct, as /a/(.*) will match /a/ but not /a,
    // but convert-route does not handle leading slashes as a special case
    optional: true,
    catchAll: {
      greedy: true,
    },
  }))
  .match(/^\(\.\+\)$/, () => ({
    optional: false,
    catchAll: {
      greedy: true,
    },
  }))
  .match(/\(.*\)/, () => {
    throw new ConvertRouteError(
      "[path-to-regexp-v6] Custom matching patterns are not supported",
    );
  })
  .match(/\{.*}/, () => {
    throw new ConvertRouteError(
      "[path-to-regexp-v6] Custom prefix and suffix are not supported",
    );
  })
  .match(/^:(.+)\?$/, (match) => ({
    optional: true,
    catchAll: {
      name: match[1],
      greedy: false,
    },
  }))
  .match(/^:(.+)\*$/, (match) => ({
    optional: true,
    catchAll: {
      name: match[1],
      greedy: true,
    },
  }))
  .match(/^:(.+)\+$/, (match) => ({
    optional: false,
    catchAll: {
      name: match[1],
      greedy: true,
    },
  }))
  .match(/^:(.+)$/, (match) => ({
    optional: false,
    catchAll: {
      name: match[1],
      greedy: false,
    },
  }));

/**
 * Convert a path-to-regexp v6 pattern string into a RouteIR pathname representation.
 *
 * @param path - The path-to-regexp v6 pattern to convert (e.g., "/users/:id", "/(.*)").
 * @returns A RouteIR object whose `pathname` is the parsed array of route segments
 */
export function fromPathToRegexpV6(path: string): RouteIR {
  return {
    pathname: mapper.exec(path),
  };
}

/**
 * Reconstructs a path-to-regexp v6-style path string from a RouteIR's pathname.
 *
 * Converts each pathname segment and its catchAll/optional metadata back into the corresponding
 * path-to-regexp token (e.g., named params with `?`, `*`, or `+`) and returns the joined path string.
 *
 * @param route - The RouteIR containing a `pathname` array of segments to convert
 * @returns The reconstructed path-to-regexp v6 path string
 */
export function toPathToRegexpV6(route: RouteIR): string {
  let i = 0;
  return join(
    route.pathname.map((r) => {
      if (r.catchAll?.greedy) {
        const name = r.catchAll.name || `_${++i}`;
        return r.optional ? `:${name}*` : `:${name}+`;
      }
      if (r.catchAll && !r.catchAll.greedy) {
        const name = r.catchAll.name || `_${++i}`;
        return r.optional ? `:${name}?` : `:${name}`;
      }
      return r.value;
    }),
  )[0];
}
