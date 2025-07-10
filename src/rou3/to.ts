import type { RouteIR } from "../types.js";

export function toRou3(route: RouteIR): string {
  let i = 0;
  return route.params
    .map((r) => {
      if (r.catchAll?.greedy) {
        // greedy catchAll is always optional in rou3
        return r.catchAll.name ? `**:${r.catchAll.name}` : "**";
      }
      if (r.catchAll && !r.catchAll.greedy && !r.catchAll.name) {
        return r.optional ? `*` : `:_${++i}`;
      }
      if (r.catchAll && !r.catchAll.greedy && r.catchAll.name) {
        return r.optional ? `*:${r.catchAll.name}` : `:${r.catchAll.name}`;
      }
      return r.value;
    })
    .join("/");
}
