export type RouteParam = {
  value: string; // Only set for non-catchAll segments
  optional?: boolean;
  catchAll?: {
    name?: string;
    greedy: boolean;
  };
};

export interface RouteIR {
  pathname: RouteParam[]; // Route segments
}
