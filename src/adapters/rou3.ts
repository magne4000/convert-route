import type { RouteIR } from "../types.js";
import { join } from "../utils/join.js";
import { SegmentMapper } from "../utils/mapper.js";

// TODO support paths like "/path/get-:file.:ext"
const mapper = new SegmentMapper()
  .match(/^\*$/, (_, __, ___, index, array) => ({
    // only considered optional if it's the last segment
    optional: index === array.length - 1,
    catchAll: {
      greedy: false,
    },
  }))
  .match(/^\*\*$/, () => ({
    optional: true,
    catchAll: {
      greedy: true,
    },
  }))
  .match(/^\*:(.+)$/, (match) => ({
    optional: true,
    catchAll: {
      greedy: false,
      name: match[1],
    },
  }))
  .match(/^\*\*:(.+)$/, (match) => ({
    optional: false,
    catchAll: {
      greedy: true,
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
 * Parse a rou3-style path string into a RouteIR containing a pathname representation.
 *
 * @param path - The path string in rou3 format (e.g., segments like "*", "**", ":name", "**:name", optional markers).
 * @returns A RouteIR whose `pathname` is the parsed array of segment descriptors representing the route.
 */
export function fromRou3(path: string): RouteIR {
  return {
    pathname: mapper.exec(path),
  };
}

/**
 * Serialize a RouteIR pathname into rou3-style path segments.
 *
 * @param route - The RouteIR whose `pathname` array of segments will be serialized. Each segment may include `value`, `optional`, and `catchAll` (with `name` and `greedy`) properties that influence the output.
 * @returns An array of strings representing the route in rou3 syntax. Greedy named catch-alls become `"**:name"` (or `"**"` if optional), non-greedy named catch-alls become `":name"` (or, for an optional non-greedy last-segment, a two-part representation `[null, "*"]`), and literal segments are emitted as-is.
 */
export function toRou3(route: RouteIR): string[] {
  let i = 0;
  const response = route.pathname.map((r) => {
    if (r.catchAll?.greedy) {
      return !r.optional ? `**:${r.catchAll.name || `_${++i}`}` : "**";
    }
    if (r.catchAll && !r.catchAll.greedy) {
      // Optional parameters in rou3 are only supported if they are in the last segment.
      // If we found one in another segment, we must return a new route without this segment.
      return r.optional ? [null, `*`] : `:${r.catchAll.name || `_${++i}`}`;
    }
    return r.value;
  });
  return join(response);
}