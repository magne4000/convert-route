export type RouteParam = {
  value: string;
  optional?: boolean;
  catchAll?: {
    name?: string;
    greedy: boolean;
  };
};

export type RouteIR = {
  pattern: string; // Original pattern as provided
  params: RouteParam[]; // Named parameters
};
