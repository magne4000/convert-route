import type { RouteIR } from "../types.js";
import { SegmentMapper } from "../utils/mapper.js";

// TODO Custom ignore patterns. For instance, Next.js ignores `pages` folder when constructing a route.
const mapper = new SegmentMapper()
  .match(/^\[\[\.\.\.([^\]]+)]]$/, (match) => ({
    optional: true,
    catchAll: {
      name: match.groups![0],
      greedy: true,
    },
  }))
  .match(/^\[\[([^\]]+)]]$/, (match) => ({
    optional: true,
    catchAll: {
      name: match.groups![0],
      greedy: false,
    },
  }))
  .match(/^\[\.\.\.([^\]]+)]$/, (match) => ({
    catchAll: {
      name: match.groups![0],
      greedy: true,
    },
  }))
  .match(/^\[([^\]]+)]$/, (match) => ({
    catchAll: {
      name: match.groups![0],
      greedy: false,
    },
  }));

export function fromFs(path: string): RouteIR {
  return {
    pattern: path,
    params: mapper.exec(path),
  };
}
