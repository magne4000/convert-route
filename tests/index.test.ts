import "urlpattern-polyfill";
import nextRouteMatcher from "next-route-matcher";
import { match as matchPtrv6 } from "path-to-regexpv6";
import { match as matchPtrv8 } from "path-to-regexpv8";
import { addRoute, createRouter, findRoute } from "rou3";
import { describe, expect, test } from "vitest";
import { fromNextFs } from "../src/adapters/next-fs.js";
import {
  fromPathToRegexpV6,
  toPathToRegexpV6,
} from "../src/adapters/path-to-regexp-v6.js";
import {
  fromPathToRegexpV8,
  toPathToRegexpV8,
} from "../src/adapters/path-to-regexp-v8.js";
import { fromRou3, toRou3 } from "../src/adapters/rou3.js";
import {
  fromURLPattern,
  toURLPatternInput,
} from "../src/adapters/urlpattern.js";
import type { RouteIR } from "../src/types.js";
import {
  type FixtureAdapters,
  type Route,
  routes,
  shouldMatch,
  shouldNotMatch,
} from "./fixtures.js";
import { toRegexp } from "../src/adapters/regexp.js";

function from(name: string) {
  switch (name) {
    case "rou3":
      return fromRou3;
    case "next-fs":
      return fromNextFs;
    case "path-to-regexp-v6":
      return fromPathToRegexpV6;
    case "path-to-regexp-v8":
      return fromPathToRegexpV8;
    case "urlpattern":
    case "urlpatterninit":
      return fromURLPattern;
    case "regexp":
      return null;
    default:
      throw new Error(`Unknown adapter: ${name}`);
  }
}

function to(
  name: keyof FixtureAdapters,
): null | ((route: RouteIR) => RegExp | string[]) {
  switch (name) {
    case "rou3":
      return toRou3;
    case "next-fs":
      return null;
    case "path-to-regexp-v6":
      return (route) => [toPathToRegexpV6(route)];
    case "path-to-regexp-v8":
      return (route) => [toPathToRegexpV8(route)];
    case "urlpattern":
      return (route) => {
        const input = toURLPatternInput(route);
        return [input.pathname];
      };
    case "urlpatterninit":
      return (route) => [toURLPatternInput(route)];
    case "regexp":
      return toRegexp;
    default:
      throw new Error(`Unknown adapter: ${name}`);
  }
}

function match(
  name: keyof FixtureAdapters,
  routes: string[] | RegExp[],
): (path: string) => boolean {
  switch (name) {
    case "rou3": {
      const router = createRouter();
      routes.forEach((route) => {
        addRoute(router, "GET", route as string, { payload: route });
      });
      return (path) => Boolean(findRoute(router, "GET", path));
    }
    case "next-fs": {
      const fn = nextRouteMatcher(routes as string[]);
      return (path) => Boolean(fn(path));
    }
    case "path-to-regexp-v6": {
      const fns = routes.map((route) => matchPtrv6(route as string));
      return (path) => {
        return fns.map((fn) => fn(path)).some(Boolean);
      };
    }
    case "path-to-regexp-v8": {
      const fns = routes.map((route) => matchPtrv8(route as string));
      return (path) => {
        return fns.map((fn) => fn(path)).some(Boolean);
      };
    }
    case "regexp": {
      const fns = routes.map((route) => (route as RegExp).exec.bind(route));
      return (path) => {
        return fns.map((fn) => fn(path)).some(Boolean);
      };
    }
    case "urlpattern":
    case "urlpatterninit": {
      const fns = routes.map((route) => {
        const pattern =
          route instanceof URLPattern ? route : new URLPattern(route as any);
        return (path: string) =>
          pattern.test({ pathname: path, baseURL: "http://localhost" });
      });
      return (path) => {
        return fns.map((fn) => fn(path)).some(Boolean);
      };
    }

    default:
      throw new Error(`Unknown adapter: ${name}`);
  }
}

describe.for(routes)("%s", (fixture) => {
  const entries = Object.entries(fixture) as [keyof FixtureAdapters, Route][];

  describe.for(entries)("$0", ([name1, route1]) => {
    const fromName1 = from(name1);
    if (fromName1) {
      const ir1 = route1.in.map((x) => fromName1(x as string));

      test.for(entries)("$0", ([name2, route2], context) => {
        const toName2 = to(name2);
        if (toName2 === null) {
          context.skip();
          return;
        }

        // route1 to route2
        const oneOf = ir1.flatMap<string | RegExp>((x) => toName2(x));
        expect(route2.out).toContainEqual(oneOf);
      });
    }

    test.for(
      fixture[shouldMatch],
    )(`${route1.in.join(",")} should match %s`, (path) => {
      expect(match(name1, route1.in)(path)).toBe(true);
    });

    test.for(
      fixture[shouldNotMatch],
    )(`${route1.in.join(",")} should not match %s`, (path) => {
      expect(match(name1, route1.in)(path)).toBe(false);
    });
  });
});
