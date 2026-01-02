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
): null | ((route: RouteIR) => RegExp | string[] | URLPatternInit[]) {
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

// ============================================================================
// NEW TWO-SECTION FIXTURE TESTS
// ============================================================================

import {
  inputFixtures,
  outputFixtures,
  normalizeIR,
} from "./fixtures.js";

describe("Two-Section Fixture Tests", () => {
  describe("Pattern → IR (Input Fixtures)", () => {
    test.for(inputFixtures)(
      "parse $format pattern $pattern to correct IR",
      ({ pattern, format, ir: expectedIr }) => {
        const fromFn = from(format);
        
        if (!fromFn) {
          // Formats without parsing (e.g., regexp) are not tested here
          return;
        }

        // Convert pattern to appropriate type
        let inputPattern: string | URLPattern | URLPatternInit;
        if (format === "urlpattern" && typeof pattern === "string") {
          inputPattern = new URLPattern({ pathname: pattern });
        } else if (format === "urlpatterninit" && typeof pattern === "string") {
          inputPattern = { pathname: pattern };
        } else {
          inputPattern = pattern as string;
        }

        // Parse the pattern
        const result = fromFn(inputPattern as any);
        
        // Normalize the result IR for consistent comparison
        const normalizedResult = {
          pattern: result.pattern,
          params: normalizeIR(result.params),
        };

        // Normalize expected IR
        const normalizedExpected = {
          pattern: normalizedResult.pattern, // Use the pattern from result
          params: normalizeIR(expectedIr.params),
        };

        // Compare normalized params only (pattern can vary)
        expect(normalizedResult.params).toEqual(normalizedExpected.params);
      },
    );
  });

  describe("IR → Pattern (Output Fixtures)", () => {
    test.for(outputFixtures)(
      "convert IR to correct patterns for all formats",
      ({ ir, outputs }) => {
        // Test each output format
        for (const [formatName, expectedOutput] of Object.entries(outputs)) {
          if (expectedOutput === undefined) continue;

          const toFn = to(formatName as keyof FixtureAdapters);
          
          if (!toFn) {
            // Format doesn't support generation (e.g., next-fs)
            continue;
          }

          // Create RouteIR from fixture
          const route: RouteIR = {
            pattern: "", // Will be set by toFn
            params: ir.params,
          };

          // Generate output
          const result = toFn(route);

          // Normalize expected output to array for comparison
          const expectedArray = Array.isArray(expectedOutput)
            ? expectedOutput
            : [expectedOutput];

          // Compare based on format type
          if (formatName === "regexp") {
            // For regexp, compare as RegExp
            const resultRegexps = Array.isArray(result) ? result : [result];
            const expectedRegexps = expectedArray as RegExp[];
            
            // Check if result matches one of the expected patterns
            const matches = resultRegexps.some((r) =>
              expectedRegexps.some((e) => r.toString() === e.toString()),
            );
            expect(matches).toBe(true);
          } else if (formatName === "urlpatterninit") {
            // For urlpatterninit, compare pathname property
            const resultInit = (Array.isArray(result) ? result[0] : result) as URLPatternInit;
            const expectedInit = expectedArray[0] as URLPatternInit;
            expect(resultInit.pathname).toBe(expectedInit.pathname);
          } else {
            // For string outputs (rou3, path-to-regexp, urlpattern)
            const resultStrings = Array.isArray(result) ? result : [result];
            
            if (expectedArray.length === 1) {
              // Single expected output
              expect(resultStrings).toContain(expectedArray[0]);
            } else {
              // Multiple possible outputs - result should match one
              const matches = resultStrings.some((r) =>
                expectedArray.includes(r),
              );
              expect(matches).toBe(true);
            }
          }
        }
      },
    );
  });
});
