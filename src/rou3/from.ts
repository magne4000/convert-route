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
