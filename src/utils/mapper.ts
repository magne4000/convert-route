import type { RouteParam } from "../types.js";

export type GetRouteParam = (
  match: RegExpMatchArray,
  segment: string,
  separator: string,
  index: number,
  array: unknown[],
) => Omit<RouteParam, "value"> & { value?: string };

function* iterateWithSeparator(segments: string[]) {
  for (let i = 0; i < segments.length; i += 2) {
    yield [segments[i], segments[i + 1]] as const;
  }
}

export class SegmentMapper {
  private mapping: [RegExp, GetRouteParam][] = [];

  constructor(private separator: RegExp = /(\/)/) {}

  match(pattern: RegExp, fn: GetRouteParam) {
    this.mapping.push([pattern, fn]);
    return this;
  }

  exec(path: string): RouteParam[] {
    let match: RegExpMatchArray | null = null;
    let sliced = path.split(this.separator);
    if (sliced[0] === "") {
      sliced = sliced.slice(1);
    }
    if (sliced[sliced.length - 1] === "") {
      sliced = sliced.slice(0, -1);
    }
    sliced = sliced.filter(Boolean);
    if (sliced.length === 1) {
      // sliced == ['/']
      return [];
    }
    return Array.from(iterateWithSeparator(sliced)).map(
      ([separator, segment], index, array) => {
        for (const [pattern, getParam] of this.mapping) {
          // biome-ignore lint/suspicious/noAssignInExpressions: ignore
          if ((match = segment.match(pattern)) !== null) {
            return {
              value: segment,
              ...getParam(match, segment, separator, index, array),
            };
          }
        }
        return {
          value: segment,
        };
      },
    );
  }
}
