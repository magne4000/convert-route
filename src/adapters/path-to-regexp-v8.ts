import type { RouteIR } from "../types.js";
import { SegmentMapper } from "../utils/mapper.js";

function isOptional(segment: string, separator: string | null) {
  return segment.endsWith("}") && separator === "{/";
}

function stripValue(segment: string, separator: string | null) {
  return isOptional(segment, separator) ? segment.slice(0, -1) : segment;
}

const mapper = new SegmentMapper(/({\/)|\//)
  .match(/^\*(.+)$/, (match, segment, separator) => ({
    optional: isOptional(segment, separator),
    catchAll: {
      name: stripValue(match[1], separator),
      greedy: true,
    },
    value: stripValue(segment, separator),
  }))
  .match(/^:(.+)$/, (match, segment, separator) => ({
    optional: isOptional(segment, separator),
    catchAll: {
      name: stripValue(match[1], separator),
      greedy: false,
    },
    value: stripValue(segment, separator),
  }))
  .match(/^.*$/, (_match, segment, separator) => ({
    optional: isOptional(segment, separator),
    value: stripValue(segment, separator),
  }));

export function fromPathToRegexpV8(path: string): RouteIR {
  return {
    pattern: path,
    params: mapper.exec(path),
  };
}

export function toPathToRegexpV8(route: RouteIR): string {
  let i = 0;
  if (route.params.length === 0) return "/";
  return route.params
    .map((r) => {
      if (r.catchAll?.greedy) {
        const name = r.catchAll.name || `_${++i}`;
        return r.optional ? `{/*${name}}` : `/*${name}`;
      }
      if (r.catchAll && !r.catchAll.greedy) {
        const name = r.catchAll.name || `_${++i}`;
        return r.optional ? `{/:${name}}` : `/:${name}`;
      }
      return r.optional ? `{/${r.value}}` : `/${r.value}`;
    })
    .join("");
}
