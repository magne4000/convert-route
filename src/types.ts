export type RouteParam = {
  value: string;
  optional?: boolean;
  catchAll?: {
    name?: string;
    greedy: boolean;
  };
};

export interface RouteIR<P = string> {
  pattern: P; // Original pattern as provided
  params: RouteParam[]; // Named parameters
}
