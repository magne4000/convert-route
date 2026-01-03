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
    optional: false,
    catchAll: {
      name: match[1],
      greedy: true,
    },
  }))
  .match(/^\[([^\]]+)]$/, (match) => ({
    optional: false,
    catchAll: {
      name: match[1],
      greedy: false,
    },
  }));

/**
 * Create a RouteIR from a Next.js filesystem-style path.
 *
 * @param path - The filesystem route string using Next.js segment syntax (e.g., "users/[id]", "blog/[...slug]", or "docs/[[...rest]]")
 * @returns The RouteIR whose `pathname` is the mapped/normalized route representation derived from `path`
 */
export function fromNextFs(path: string): RouteIR {
  return {
    pathname: mapper.exec(path),
  };
}