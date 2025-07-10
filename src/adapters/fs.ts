import type { RouteIR } from "../types.js";
import { SegmentMapper } from "../utils/mapper.js";

// TODO Custom ignore patterns. For instance, Next.js ignores `pages` folder when constructing a route.
const mapper = new SegmentMapper()
  .match(/^\[\[\.\.\.([^\]]+)]]$/, (match) => ({
    optional: true,
    catchAll: {
      name: match[1],
      greedy: true,
    },
  }))
  .match(/^\[\[([^\]]+)]]$/, (match) => ({
    optional: true,
    catchAll: {
      name: match[1],
      greedy: false,
    },
  }))
  .match(/^\[\.\.\.([^\]]+)]$/, (match) => ({
    catchAll: {
      name: match[1],
      greedy: true,
    },
  }))
  .match(/^\[([^\]]+)]$/, (match) => ({
    catchAll: {
      name: match[1],
      greedy: false,
    },
  }));

export function fromFs(path: string): RouteIR {
  return {
    pattern: path,
    params: mapper.exec(path),
  };
}

export function toFs(route: RouteIR): string {
  let i = 0;
  return route.params
    .map((r) => {
      if (r.catchAll?.greedy) {
        const name = r.catchAll.name || `_${++i}`;
        return r.optional ? `[[...${name}]]` : `[...${name}]`;
      }
      if (r.catchAll && !r.catchAll.greedy) {
        const name = r.catchAll.name || `_${++i}`;
        return r.optional ? `[[${name}]]` : `[${name}]`;
      }
      return r.value;
    })
    .join("/");
}
