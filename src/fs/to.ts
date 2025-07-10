import type { RouteIR } from "../types.js";

export function toFs(route: RouteIR): string {
  let i = 0;
  return route.params
    .map((r) => {
      if (r.catchAll?.greedy) {
        const name = r.catchAll.name || `_${++i}`;
        return r.optional ? `[[...${name}]]` : `[...${name}]`;
      }
      if (r.catchAll && !r.catchAll.greedy) {
        const name = r.catchAll.name || `_${++i}`;
        return r.optional ? `[[${name}]]` : `[${name}]`;
      }
      return r.value;
    })
    .join("/");
}
