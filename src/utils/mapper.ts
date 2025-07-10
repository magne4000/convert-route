import type { RouteParam } from "../types.js";

export type GetRouteParam = (
  match: RegExpMatchArray,
  segment: string,
) => Omit<RouteParam, "value"> & { value?: string };

export class SegmentMapper {
  private mapping: [RegExp, GetRouteParam][] = [];

  match(pattern: RegExp, fn: GetRouteParam) {
    this.mapping.push([pattern, fn]);
    return this;
  }

  exec(path: string) {
    let match: RegExpMatchArray | null = null;
    return path.split("/").map((segment): RouteParam => {
      for (const [pattern, getParam] of this.mapping) {
        // biome-ignore lint/suspicious/noAssignInExpressions: ignore
        if ((match = segment.match(pattern)) !== null) {
          return {
            value: segment,
            ...getParam(match, segment),
          };
        }
      }
      return {
        value: segment,
      };
    });
  }
}
