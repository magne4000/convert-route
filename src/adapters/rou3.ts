import type { RouteIR } from "../types.js";
import { ConvertRouteError } from "../utils/error.js";
import { join } from "../utils/join.js";
import { SegmentMapper } from "../utils/mapper.js";

// rou3 v0.12+ syntax, aligned with URLPattern.
// TODO support paths like "/path/get-:file.:ext"
const mapper = new SegmentMapper()
  .match(/^\*$/, (_, __, ___, index, array) => ({
    // `*` matches the rest of the path, `/` included. It is optional at the end of a route,
    // and needs at least one segment before more of it.
    optional: index === array.length - 1,
    catchAll: {
      greedy: true,
    },
  }))
  .match(/^\*\*$/, () => ({
    optional: true,
    catchAll: {
      greedy: true,
    },
  }))
  .match(/^\*\*:(.+)$/, (match) => ({
    optional: false,
    catchAll: {
      greedy: true,
      name: match[1],
    },
  }))
  .match(/^:(.+)\+$/, (match) => ({
    optional: false,
    catchAll: {
      greedy: true,
      name: match[1],
    },
  }))
  .match(/^:(.+)\*$/, (match) => ({
    optional: true,
    catchAll: {
      greedy: true,
      name: match[1],
    },
  }))
  .match(/^:(.+)\?$/, (match) => ({
    optional: true,
    catchAll: {
      greedy: false,
      name: match[1],
    },
  }))
  .match(/^:(.+)$/, (match) => ({
    optional: false,
    catchAll: {
      greedy: false,
      name: match[1],
    },
  }));

/**
 * Parse a rou3 path pattern (rou3 v0.12+ syntax) into a RouteIR containing a pathname representation.
 *
 * @param path - The path pattern in rou3 format, with segments like `:name`, `:name?`, `:name+`, `:name*`, `**`, `**:name` or `*`.
 * @returns A RouteIR whose `pathname` is the parsed array of segment descriptors representing the route.
 */
export function fromRou3(path: string): RouteIR {
  return {
    pathname: mapper.exec(path),
  };
}

/**
 * Serialize a RouteIR pathname into a rou3 path pattern (rou3 v0.12+ syntax).
 *
 * @param route - The RouteIR whose `pathname` array of segments will be serialized.
 * @returns An array holding the route in rou3 syntax. Greedy catch-alls become `"**:name"`, or `":name*"` (`"**"` when unnamed) if optional; other params become `":name"`, or `":name?"` if optional. Unnamed params get a `_<n>` name.
 * @throws ConvertRouteError - If the route has more than one greedy catch-all, which rou3 does not support.
 */
export function toRou3(route: RouteIR): string[] {
  if (route.pathname.filter((r) => r.catchAll?.greedy).length > 1) {
    throw new ConvertRouteError(
      "[rou3] A route can have only one greedy catch-all",
    );
  }
  let i = 0;
  const response = route.pathname.map((r) => {
    if (!r.catchAll) {
      return r.value;
    }
    if (r.catchAll.greedy && r.optional) {
      return r.catchAll.name ? `:${r.catchAll.name}*` : "**";
    }
    const name = r.catchAll.name || `_${++i}`;
    if (r.catchAll.greedy) {
      return `**:${name}`;
    }
    return r.optional ? `:${name}?` : `:${name}`;
  });
  return join(response);
}
