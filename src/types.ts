export type RouteParam = { optional: boolean } & (
  | {
      value: string;
      catchAll?: never;
    }
  | {
      value?: never;
      catchAll: {
        name?: string;
        greedy: boolean;
      };
    }
);

export interface RouteIR {
  pathname: RouteParam[]; // Route segments
}
