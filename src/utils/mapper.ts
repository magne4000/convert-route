import type { RouteParam } from "../types.js";

export type GetRouteParam = (
  match: RegExpMatchArray,
  segment: string,
  separator: string | null,
) => Omit<RouteParam, "value"> & { value?: string };

export class SegmentMapper {
  private mapping: [RegExp, GetRouteParam][] = [];

  constructor(private separator: string | RegExp = "/") {}

  match(pattern: RegExp, fn: GetRouteParam) {
    this.mapping.push([pattern, fn]);
    return this;
  }

  exec(path: string): RouteParam[] {
    let match: RegExpMatchArray | null = null;
    let previousSeparator: string | null = null;
    return path
      .split(this.separator)
      .map((segment) => {
        if (typeof segment === "undefined") {
          previousSeparator = "/";
          return false;
        }
        if (typeof this.separator !== "string") {
          if (this.separator.test(segment)) {
            previousSeparator = segment;
            return false;
          }
        }

        for (const [pattern, getParam] of this.mapping) {
          // biome-ignore lint/suspicious/noAssignInExpressions: ignore
          if ((match = segment.match(pattern)) !== null) {
            return {
              value: segment,
              ...getParam(match, segment, previousSeparator),
            };
          }
        }
        previousSeparator = "/";
        return {
          value: segment,
        };
      })
      .filter((x): x is RouteParam => Boolean(x));
  }
}
