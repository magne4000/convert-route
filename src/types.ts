export type RouteParam =
  | {
      value: string;
      optional?: boolean;
    }
  | {
      optional?: boolean;
      catchAll?: {
        name?: string;
        greedy: boolean;
      };
    };

export interface RouteIR {
  pathname: RouteParam[]; // Route segments
}
