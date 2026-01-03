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
    catchAll: {
      name: match[1],
      greedy: true,
    },
  }))
  .match(/^:(.+)$/, (match) => ({
    catchAll: {
      name: match[1],
      greedy: false,
    },
  }));

export function fromPathToRegexpV6(path: string): RouteIR {
  return {
    pathname: mapper.exec(path),
  };
}

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
