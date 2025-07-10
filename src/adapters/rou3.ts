import type { RouteIR } from "../types.js";
import { SegmentMapper } from "../utils/mapper.js";

const mapper = new SegmentMapper()
  .match(/^\*$/, () => ({
    optional: true,
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
      name: match.groups![0],
    },
  }))
  .match(/^\*\*:(.+)$/, (match) => ({
    optional: true,
    catchAll: {
      greedy: true,
      name: match.groups![0],
    },
  }))
  .match(/^:(.+)$/, (match) => ({
    catchAll: {
      greedy: false,
      name: match.groups![0],
    },
  }));

export function fromRou3(path: string): RouteIR {
  return {
    pattern: path,
    params: mapper.exec(path),
  };
}

export function toRou3(route: RouteIR): string {
  let i = 0;
  return route.params
    .map((r) => {
      if (r.catchAll?.greedy) {
        // greedy catchAll is always optional in rou3
        return r.catchAll.name ? `**:${r.catchAll.name}` : "**";
      }
      if (r.catchAll && !r.catchAll.greedy && !r.catchAll.name) {
        return r.optional ? `*` : `:_${++i}`;
      }
      if (r.catchAll && !r.catchAll.greedy && r.catchAll.name) {
        return r.optional ? `*:${r.catchAll.name}` : `:${r.catchAll.name}`;
      }
      return r.value;
    })
    .join("/");
}
