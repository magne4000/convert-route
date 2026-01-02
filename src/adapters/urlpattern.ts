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
  return {
    pattern,
    // The syntax for patterns is based on the path-to-regexp JavaScript library.
    params: fromPathToRegexpV8(obj.pathname ?? "*").params,
  };
}

export function toURLPattern(route: RouteIR): URLPattern {
  const URLPatternConstructor = getConstructor();
  return new URLPatternConstructor(toURLPatternInput(route));
}

export function toURLPatternInput(route: RouteIR): { pathname: string } {
  const pathname = toPathToRegexpV8(route);

  return {
    pathname,
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
