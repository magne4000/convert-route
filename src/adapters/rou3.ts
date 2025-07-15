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
    catchAll: {
      greedy: true,
      name: match[1],
    },
  }))
  .match(/^:(.+)$/, (match) => ({
    catchAll: {
      greedy: false,
      name: match[1],
    },
  }));

export function fromRou3(path: string): RouteIR {
  return {
    pattern: path,
    params: mapper.exec(path),
  };
}

export function toRou3(route: RouteIR): string[] {
  let i = 0;
  const response = route.params.map((r) => {
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
