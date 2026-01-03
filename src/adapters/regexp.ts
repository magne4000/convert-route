import type { RouteIR } from "../types.js";

// Extracted from https://github.com/sindresorhus/escape-string-regexp
function escapeStringRegexp(string: string) {
  return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}

export function toRegexp(route: RouteIR): RegExp {
  const segments: string[] = [];
  for (const segment of route.pathname) {
    if (segment.catchAll) {
      const name = segment.catchAll.name ? `?<${segment.catchAll.name}>` : "";
      const optional = segment.optional ? "*" : "+";
      const greedy = segment.catchAll.greedy ? "." : "[^/]";
      segments.push(
        `${segment.optional ? "?" : ""}(${name}${greedy}${optional})`,
      );
    } else if (segment.optional) {
      segments.push(`?(?:${escapeStringRegexp(segment.value)})?`);
    } else {
      segments.push(`${escapeStringRegexp(segment.value)}`);
    }
  }
  return new RegExp(`^/${segments.join("/")}/?$`);
}
