import type { RouteIR } from "../types.js";
import { ConvertRouteError } from "../utils/error.js";
import { fromPathToRegexpV8, toPathToRegexpV8 } from "./path-to-regexp-v8.js";

function isDefault(s: string | undefined) {
  return !s || s === "*";
}

const unsupportedKeys = [
  "protocol",
  "hostname",
  "port",
  "username",
  "password",
  "search",
  "hash",
] satisfies (keyof URLPattern)[];

export function fromURLPattern<T extends URLPattern | URLPatternInput>(
  pattern: T,
): RouteIR<T> {
  let obj: URLPattern | URLPatternInit;
  if (typeof pattern === "string") {
    const URLPatternConstructor = getConstructor();
    obj = new URLPatternConstructor(pattern);
  } else {
    obj = pattern;
  }

  for (const prop of unsupportedKeys) {
    if (!isDefault(obj[prop])) {
      throw new ConvertRouteError(`'${prop}' is not yet supported`);
    }
  }
  if ("hasRegExpGroups" in obj && obj.hasRegExpGroups) {
    throw new ConvertRouteError(`RegExp groups are not yet supported`);
  }

  const pathname = obj.pathname ?? "*";

  // Convert URLPattern syntax to path-to-regexp-v8 syntax
  // URLPattern → path-to-regexp-v8:
  // /:param+  → /*param  (required multi-segment)
  // /:param*  → {/*param} (optional multi-segment)
  // /:param?  → {/:param} (optional single segment)
  let v8Pathname = pathname
    .replace(/:(\w+)\+/g, "/*$1") // :param+ → /*param
    .replace(/:(\w+)\*/g, "{/*$1}") // :param* → {/*param}
    .replace(/:(\w+)\?/g, "{/:$1}"); // :param? → {/:param}

  const ir = fromPathToRegexpV8(v8Pathname);
  return {
    pattern,
    params: ir.params,
  };
}

export function toURLPattern(route: RouteIR): URLPattern {
  const URLPatternConstructor = getConstructor();
  return new URLPatternConstructor(toURLPatternInput(route));
}

export function toURLPatternInput(route: RouteIR): { pathname: string } {
  // Convert path-to-regexp-v8 syntax to URLPattern syntax
  // path-to-regexp-v8 → URLPattern:
  // /*param  → /:param+  (required multi-segment)
  // {/*param} → /:param* (optional multi-segment)
  // {/:param} → /:param? (optional single segment)
  const v8Pathname = toPathToRegexpV8(route);
  const pathname = v8Pathname
    .replace(/\/\*(\w+)/g, "/:$1+") // /*param → /:param+
    .replace(/\{\/\*(\w+)\}/g, ":$1*") // {/*param} → :param*
    .replace(/\{\/:(\w+)\}/g, ":$1?"); // {/:param} → :param?

  return {
    pathname: pathname === "*" ? "/*" : pathname,
  };
}

function getConstructor() {
  const URLPatternConstructor: typeof URLPattern | undefined =
    // biome-ignore lint/suspicious/noExplicitAny: check
    (globalThis as any).URLPattern;

  if (!URLPatternConstructor) {
    throw new Error(`URLPattern is not supported`);
  }

  return URLPatternConstructor;
}

export interface URLPatternInit {
  protocol?: string;
  username?: string;
  password?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  baseURL?: string;
}

export type URLPatternInput = string | URLPatternInit;
