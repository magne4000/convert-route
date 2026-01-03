import type { RouteIR } from "../types.js";
import { SegmentMapper } from "../utils/mapper.js";

// TODO Custom ignore patterns. For instance, ignore Next.js `pages` folder when constructing a route.
const mapper = new SegmentMapper()
  .match(/^\[\[\.\.\.([^\]]+)]]$/, (match) => ({
    optional: true,
    catchAll: {
      name: match[1],
      greedy: true,
    },
  }))
  .match(/^\[\.\.\.([^\]]+)]$/, (match) => ({
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
  .match(/^\[([^\]]+)]$/, (match) => ({
    catchAll: {
      name: match[1],
      greedy: false,
    },
  }));

export function fromNextFs(path: string): RouteIR {
  return {
    pathname: mapper.exec(path),
  };
}
