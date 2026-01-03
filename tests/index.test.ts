import "urlpattern-polyfill";
import type { RouteParam, RouteIR } from "../src/types.js";
import { describe, expect, test } from "vitest";
import { fromPathToRegexpV6, toPathToRegexpV6 } from "../src/adapters/path-to-regexp-v6.js";
import {
  fromPathToRegexpV8,
  toPathToRegexpV8,
} from "../src/adapters/path-to-regexp-v8.js";
import { fromRou3, toRou3 } from "../src/adapters/rou3.js";
import {
  fromURLPattern,
  toURLPatternInput,
} from "../src/adapters/urlpattern.js";
import { toRegexp } from "../src/adapters/regexp.js";
import { fromNextFs } from "../src/adapters/next-fs.js";
import { join } from "../src/utils/join.js";

function normalizeIR(params: RouteParam[]): RouteParam[] {
  return params.map((param) => {
    const normalized: RouteParam = {
      value: param.value,
      optional: param.optional ?? false,
    };

    if (param.catchAll) {
      normalized.catchAll = {
        name: param.catchAll.name,
        greedy: param.catchAll.greedy,
      };
    }

    return normalized;
  });
}

// Type-safe test helpers to ensure complete coverage
// For Pattern → IR: ALL 6 formats required (including path-to-regexp-v6!)
type PatternToIRTests = {
  rou3: () => void;
  "path-to-regexp-v6": () => void;
  "path-to-regexp-v8": () => void;
  urlpattern: () => void;
  urlpatterninit: () => void;
  nextfs: () => void;
};

// For IR → Pattern: ALL 6 formats required
type IRToPatternTests = {
  rou3: () => void;
  "path-to-regexp-v6": () => void;
  "path-to-regexp-v8": () => void;
  regexp: () => void;
  urlpattern: () => void;
  urlpatterninit: () => void;
};

// Helper to test Pattern → IR with compile-time verification
function testPatternToIR(pattern: string, tests: PatternToIRTests): void {
  describe(pattern, () => {
    test("rou3", tests.rou3);
    test("path-to-regexp-v6", tests["path-to-regexp-v6"]);
    test("path-to-regexp-v8", tests["path-to-regexp-v8"]);
    test("urlpattern", tests.urlpattern);
    test("urlpatterninit", tests.urlpatterninit);
    test("nextfs", tests.nextfs);
  });
}

// Helper to test IR → Pattern with compile-time verification
function testIRToPattern(pattern: string, _ir: RouteIR, tests: IRToPatternTests): void {
  describe(pattern, () => {
    test("rou3", tests.rou3);
    test("path-to-regexp-v6", tests["path-to-regexp-v6"]);
    test("path-to-regexp-v8", tests["path-to-regexp-v8"]);
    test("regexp", tests.regexp);
    test("urlpattern", tests.urlpattern);
    test("urlpatterninit", tests.urlpatterninit);
  });
}

describe("Pattern → IR (Parsing Tests)", () => {
  testPatternToIR("/", {
    rou3: () => {
      const result = fromRou3("/");
      expect(normalizeIR(result.pathname)).toEqual([]);
    },
    "path-to-regexp-v6": () => {
      const result = fromPathToRegexpV6("/");
      expect(normalizeIR(result.pathname)).toEqual([]);
    },
    "path-to-regexp-v8": () => {
      const result = fromPathToRegexpV8("/");
      expect(normalizeIR(result.pathname)).toEqual([]);
    },
    urlpattern: () => {
      const pattern = new URLPattern({ pathname: "/{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.pathname)).toEqual([]);
    },
    urlpatterninit: () => {
      const result = fromURLPattern({ pathname: "/{/}?" });
      expect(normalizeIR(result.pathname)).toEqual([]);
    },
    nextfs: () => {
      const result = fromNextFs("/");
      expect(normalizeIR(result.pathname)).toEqual([]);
    },
  });

  testPatternToIR("/foo", {
    rou3: () => {
      const result = fromRou3("/foo");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
      ]);
    },
    "path-to-regexp-v6": () => {
      const result = fromPathToRegexpV6("/foo");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
      ]);
    },
    "path-to-regexp-v8": () => {
      const result = fromPathToRegexpV8("/foo");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
      ]);
    },
    urlpattern: () => {
      const pattern = new URLPattern({ pathname: "/foo{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
      ]);
    },
    urlpatterninit: () => {
      const result = fromURLPattern({ pathname: "/foo{/}?" });
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
      ]);
    },
    nextfs: () => {
      const result = fromNextFs("/foo");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
      ]);
    },
  });

  testPatternToIR("/foo/bar", {
    rou3: () => {
      const result = fromRou3("/foo/bar");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        { value: "bar", optional: false },
      ]);
    },
    "path-to-regexp-v6": () => {
      const result = fromPathToRegexpV6("/foo/bar");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        { value: "bar", optional: false },
      ]);
    },
    "path-to-regexp-v8": () => {
      const result = fromPathToRegexpV8("/foo/bar");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        { value: "bar", optional: false },
      ]);
    },
    urlpattern: () => {
      const pattern = new URLPattern({ pathname: "/foo/bar{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        { value: "bar", optional: false },
      ]);
    },
    urlpatterninit: () => {
      const result = fromURLPattern({ pathname: "/foo/bar{/}?" });
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        { value: "bar", optional: false },
      ]);
    },
    nextfs: () => {
      const result = fromNextFs("/foo/bar");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        { value: "bar", optional: false },
      ]);
    },
  });

  testPatternToIR("/foo/:id", {
    rou3: () => {
      const result = fromRou3("/foo/:id");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ]);
    },
    "path-to-regexp-v6": () => {
      const result = fromPathToRegexpV6("/foo/:id");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ]);
    },
    "path-to-regexp-v8": () => {
      const result = fromPathToRegexpV8("/foo/:id");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ]);
    },
    urlpattern: () => {
      const pattern = new URLPattern({ pathname: "/foo/:id{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ]);
    },
    urlpatterninit: () => {
      const result = fromURLPattern({ pathname: "/foo/:id{/}?" });
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ]);
    },
    nextfs: () => {
      const result = fromNextFs("/foo/[id]");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ]);
    },
  });

  testPatternToIR("/foo/:foo/bar/:bar", {
    rou3: () => {
      const result = fromRou3("/foo/:foo/bar/:bar");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "foo", greedy: false },
        },
        { value: "bar", optional: false },
        {
          optional: false,
          catchAll: { name: "bar", greedy: false },
        },
      ]);
    },
    "path-to-regexp-v6": () => {
      const result = fromPathToRegexpV6("/foo/:foo/bar/:bar");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "foo", greedy: false },
        },
        { value: "bar", optional: false },
        {
          optional: false,
          catchAll: { name: "bar", greedy: false },
        },
      ]);
    },
    "path-to-regexp-v8": () => {
      const result = fromPathToRegexpV8("/foo/:foo/bar/:bar");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "foo", greedy: false },
        },
        { value: "bar", optional: false },
        {
          optional: false,
          catchAll: { name: "bar", greedy: false },
        },
      ]);
    },
    urlpattern: () => {
      const pattern = new URLPattern({ pathname: "/foo/:foo/bar/:bar{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "foo", greedy: false },
        },
        { value: "bar", optional: false },
        {
          optional: false,
          catchAll: { name: "bar", greedy: false },
        },
      ]);
    },
    urlpatterninit: () => {
      const result = fromURLPattern({ pathname: "/foo/:foo/bar/:bar{/}?" });
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "foo", greedy: false },
        },
        { value: "bar", optional: false },
        {
          optional: false,
          catchAll: { name: "bar", greedy: false },
        },
      ]);
    },
    nextfs: () => {
      const result = fromNextFs("/foo/[foo]/bar/[bar]");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "foo", greedy: false },
        },
        { value: "bar", optional: false },
        {
          optional: false,
          catchAll: { name: "bar", greedy: false },
        },
      ]);
    },
  });

  testPatternToIR("/foo/*", {
    rou3: () => {
      const result = fromRou3("/foo/*");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { greedy: false },
        },
      ]);
    },
    "path-to-regexp-v6": () => {
      const result = fromPathToRegexpV6("/foo/:_1?");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: false },
        },
      ]);
    },
    "path-to-regexp-v8": () => {
      const result = fromPathToRegexpV8("/foo{/:_1}");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: false },
        },
      ]);
    },
    urlpattern: () => {
      const pattern = new URLPattern({ pathname: "/foo/:_1?{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: false },
        },
      ]);
    },
    urlpatterninit: () => {
      const result = fromURLPattern({ pathname: "/foo/:_1?{/}?" });
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: false },
        },
      ]);
    },
    nextfs: () => {
      const result = fromNextFs("/foo/[[slug]]");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "slug", greedy: false },
        },
      ]);
    },
  });

  testPatternToIR("/foo/**:_1", {
    rou3: () => {
      const result = fromRou3("/foo/**:_1");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    },
    "path-to-regexp-v6": () => {
      const result = fromPathToRegexpV6("/foo/:_1+");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    },
    "path-to-regexp-v8": () => {
      const result = fromPathToRegexpV8("/foo/*_1");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    },
    urlpattern: () => {
      const pattern = new URLPattern({ pathname: "/foo/:_1+{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    },
    urlpatterninit: () => {
      const result = fromURLPattern({ pathname: "/foo/:_1+{/}?" });
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    },
    nextfs: () => {
      const result = fromNextFs("/foo/[...slug]");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "slug", greedy: true },
        },
      ]);
    },
  });

  testPatternToIR("/foo/**", {
    rou3: () => {
      const result = fromRou3("/foo/**");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { greedy: true },
        },
      ]);
    },
    "path-to-regexp-v6": () => {
      const result = fromPathToRegexpV6("/foo/:_1*");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    },
    "path-to-regexp-v8": () => {
      const result = fromPathToRegexpV8("/foo{/*_1}");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    },
    urlpattern: () => {
      const pattern = new URLPattern({ pathname: "/foo/:_1*{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    },
    urlpatterninit: () => {
      const result = fromURLPattern({ pathname: "/foo/:_1*{/}?" });
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    },
    nextfs: () => {
      const result = fromNextFs("/foo/[[..._1]]");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    },
  });

  testPatternToIR("/foo{/:_1}/bar", {
    rou3: () => {
      const result = fromRou3("/foo/*/bar");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { greedy: false },
        },
        { value: "bar", optional: false },
      ]);
    },
    "path-to-regexp-v6": () => {
      const result = fromPathToRegexpV6("/foo/:_1?/bar");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: false },
        },
        { value: "bar", optional: false },
      ]);
    },
    "path-to-regexp-v8": () => {
      const result = fromPathToRegexpV8("/foo{/:_1}/bar");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: false },
        },
        { value: "bar", optional: false },
      ]);
    },
    urlpattern: () => {
      const pattern = new URLPattern({ pathname: "/foo/:_1?/bar{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: false },
        },
        { value: "bar", optional: false },
      ]);
    },
    urlpatterninit: () => {
      const result = fromURLPattern({ pathname: "/foo/:_1?/bar{/}?" });
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: false },
        },
        { value: "bar", optional: false },
      ]);
    },
    nextfs: () => {
      const result = fromNextFs("/foo/[[slug]]/bar");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "slug", greedy: false },
        },
        { value: "bar", optional: false },
      ]);
    },
  });
});

describe("IR → Pattern (Generation Tests)", () => {
  testIRToPattern(
    "/",
    { pathname: [] },
    {
      rou3: () => {
        const ir: RouteIR = { pathname: [] };
        expect(toRou3(ir)).toEqual(["/"]);
      },
      "path-to-regexp-v6": () => {
        const ir: RouteIR = { pathname: [] };
        expect(toPathToRegexpV6(ir)).toBe("/");
      },
      "path-to-regexp-v8": () => {
        const ir: RouteIR = { pathname: [] };
        expect(toPathToRegexpV8(ir)).toBe("/");
      },
      regexp: () => {
        const ir: RouteIR = { pathname: [] };
        expect(toRegexp(ir).source).toBe("^\\/\\/?$");
      },
      urlpattern: () => {
        const ir: RouteIR = { pathname: [] };
        expect(toURLPatternInput(ir).pathname).toBe("/{/}?");
      },
      urlpatterninit: () => {
        const ir: RouteIR = { pathname: [] };
        expect(toURLPatternInput(ir).pathname).toBe("/{/}?");
      },
    }
  );

  testIRToPattern(
    "/foo",
    {
      pathname: [{ value: "foo", optional: false }],
    },
    {
      rou3: () => {
        const ir: RouteIR = {
          pathname: [{ value: "foo", optional: false }],
        };
        expect(toRou3(ir)).toEqual(["/foo"]);
      },
      "path-to-regexp-v6": () => {
        const ir: RouteIR = {
          pathname: [{ value: "foo", optional: false }],
        };
        expect(toPathToRegexpV6(ir)).toBe("/foo");
      },
      "path-to-regexp-v8": () => {
        const ir: RouteIR = {
          pathname: [{ value: "foo", optional: false }],
        };
        expect(toPathToRegexpV8(ir)).toBe("/foo");
      },
      regexp: () => {
        const ir: RouteIR = {
          pathname: [{ value: "foo", optional: false }],
        };
        expect(toRegexp(ir).source).toBe("^\\/foo\\/?$");
      },
      urlpattern: () => {
        const ir: RouteIR = {
          pathname: [{ value: "foo", optional: false }],
        };
        expect(toURLPatternInput(ir).pathname).toBe("/foo{/}?");
      },
      urlpatterninit: () => {
        const ir: RouteIR = {
          pathname: [{ value: "foo", optional: false }],
        };
        expect(toURLPatternInput(ir).pathname).toBe("/foo{/}?");
      },
    }
  );

  testIRToPattern(
    "/foo/bar",
    {
      pathname: [
        { value: "foo", optional: false },
        { value: "bar", optional: false },
      ],
    },
    {
      rou3: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            { value: "bar", optional: false },
          ],
        };
        expect(toRou3(ir)).toEqual(["/foo/bar"]);
      },
      "path-to-regexp-v6": () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            { value: "bar", optional: false },
          ],
        };
        expect(toPathToRegexpV6(ir)).toBe("/foo/bar");
      },
      "path-to-regexp-v8": () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            { value: "bar", optional: false },
          ],
        };
        expect(toPathToRegexpV8(ir)).toBe("/foo/bar");
      },
      regexp: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            { value: "bar", optional: false },
          ],
        };
        expect(toRegexp(ir).source).toBe("^\\/foo\\/bar\\/?$");
      },
      urlpattern: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            { value: "bar", optional: false },
          ],
        };
        expect(toURLPatternInput(ir).pathname).toBe("/foo/bar{/}?");
      },
      urlpatterninit: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            { value: "bar", optional: false },
          ],
        };
        expect(toURLPatternInput(ir).pathname).toBe("/foo/bar{/}?");
      },
    }
  );

  testIRToPattern(
    "/foo/:id",
    {
      pathname: [
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ],
    },
    {
      rou3: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "id", greedy: false },
            },
          ],
        };
        expect(toRou3(ir)).toEqual(["/foo/:id"]);
      },
      "path-to-regexp-v6": () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "id", greedy: false },
            },
          ],
        };
        expect(toPathToRegexpV6(ir)).toBe("/foo/:id");
      },
      "path-to-regexp-v8": () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "id", greedy: false },
            },
          ],
        };
        expect(toPathToRegexpV8(ir)).toBe("/foo/:id");
      },
      regexp: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "id", greedy: false },
            },
          ],
        };
        expect(toRegexp(ir).source).toBe("^\\/foo\\/(?<id>[^/]+)\\/?$");
      },
      urlpattern: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "id", greedy: false },
            },
          ],
        };
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:id{/}?");
      },
      urlpatterninit: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "id", greedy: false },
            },
          ],
        };
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:id{/}?");
      },
    }
  );

  testIRToPattern(
    "/foo/*",
    {
      pathname: [
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: false },
        },
      ],
    },
    {
      rou3: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: false },
            },
          ],
        };
        expect(toRou3(ir)).toEqual(["/foo/*"]);
      },
      "path-to-regexp-v6": () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: false },
            },
          ],
        };
        expect(toPathToRegexpV6(ir)).toBe("/foo/:_1?");
      },
      "path-to-regexp-v8": () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: false },
            },
          ],
        };
        expect(toPathToRegexpV8(ir)).toBe("/foo{/:_1}");
      },
      regexp: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: false },
            },
          ],
        };
        expect(toRegexp(ir).source).toBe("^\\/foo\\/?(?<_1>[^/]*)\\/?$");
      },
      urlpattern: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: false },
            },
          ],
        };
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1?{/}?");
      },
      urlpatterninit: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: false },
            },
          ],
        };
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1?{/}?");
      },
    }
  );

  testIRToPattern(
    "/foo/**:_1",
    {
      pathname: [
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "_1", greedy: true },
        },
      ],
    },
    {
      rou3: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "_1", greedy: true },
            },
          ],
        };
        expect(toRou3(ir)).toEqual(["/foo/**:_1"]);
      },
      "path-to-regexp-v6": () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "_1", greedy: true },
            },
          ],
        };
        expect(toPathToRegexpV6(ir)).toBe("/foo/:_1+");
      },
      "path-to-regexp-v8": () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "_1", greedy: true },
            },
          ],
        };
        expect(toPathToRegexpV8(ir)).toBe("/foo/*_1");
      },
      regexp: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "_1", greedy: true },
            },
          ],
        };
        expect(toRegexp(ir).source).toBe("^\\/foo\\/(?<_1>.+)\\/?$");
      },
      urlpattern: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "_1", greedy: true },
            },
          ],
        };
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1+{/}?");
      },
      urlpatterninit: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "_1", greedy: true },
            },
          ],
        };
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1+{/}?");
      },
    }
  );

  testIRToPattern(
    "/foo/**",
    {
      pathname: [
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: true },
        },
      ],
    },
    {
      rou3: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: true },
            },
          ],
        };
        expect(toRou3(ir)).toEqual(["/foo/**"]);
      },
      "path-to-regexp-v6": () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: true },
            },
          ],
        };
        expect(toPathToRegexpV6(ir)).toBe("/foo/:_1*");
      },
      "path-to-regexp-v8": () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: true },
            },
          ],
        };
        expect(toPathToRegexpV8(ir)).toBe("/foo{/*_1}");
      },
      regexp: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: true },
            },
          ],
        };
        expect(toRegexp(ir).source).toBe("^\\/foo\\/?(?<_1>.*)\\/?$");
      },
      urlpattern: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: true },
            },
          ],
        };
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1*{/}?");
      },
      urlpatterninit: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: true },
            },
          ],
        };
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1*{/}?");
      },
    }
  );

  testIRToPattern(
    "/foo{/:_1}/bar",
    {
      pathname: [
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: false },
        },
        { value: "bar", optional: false },
      ],
    },
    {
      rou3: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: false },
            },
            { value: "bar", optional: false },
          ],
        };
        expect(toRou3(ir)).toEqual(["/foo/bar", "/foo/*/bar"]);
      },
      "path-to-regexp-v6": () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: false },
            },
            { value: "bar", optional: false },
          ],
        };
        expect(toPathToRegexpV6(ir)).toBe("/foo/:_1?/bar");
      },
      "path-to-regexp-v8": () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: false },
            },
            { value: "bar", optional: false },
          ],
        };
        expect(toPathToRegexpV8(ir)).toBe("/foo{/:_1}/bar");
      },
      regexp: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: false },
            },
            { value: "bar", optional: false },
          ],
        };
        expect(toRegexp(ir).source).toBe("^\\/foo\\/?(?<_1>[^/]*)\\/bar\\/?$");
      },
      urlpattern: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: false },
            },
            { value: "bar", optional: false },
          ],
        };
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1?/bar{/}?");
      },
      urlpatterninit: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { name: "_1", greedy: false },
            },
            { value: "bar", optional: false },
          ],
        };
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1?/bar{/}?");
      },
    }
  );

  testIRToPattern(
    "/foo/:foo/bar/:bar",
    {
      pathname: [
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "foo", greedy: false },
        },
        { value: "bar", optional: false },
        {
          optional: false,
          catchAll: { name: "bar", greedy: false },
        },
      ],
    },
    {
      rou3: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "foo", greedy: false },
            },
            { value: "bar", optional: false },
            {
              optional: false,
              catchAll: { name: "bar", greedy: false },
            },
          ],
        };
        expect(toRou3(ir)).toEqual(["/foo/:foo/bar/:bar"]);
      },
      "path-to-regexp-v6": () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "foo", greedy: false },
            },
            { value: "bar", optional: false },
            {
              optional: false,
              catchAll: { name: "bar", greedy: false },
            },
          ],
        };
        expect(toPathToRegexpV6(ir)).toBe("/foo/:foo/bar/:bar");
      },
      "path-to-regexp-v8": () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "foo", greedy: false },
            },
            { value: "bar", optional: false },
            {
              optional: false,
              catchAll: { name: "bar", greedy: false },
            },
          ],
        };
        expect(toPathToRegexpV8(ir)).toBe("/foo/:foo/bar/:bar");
      },
      regexp: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "foo", greedy: false },
            },
            { value: "bar", optional: false },
            {
              optional: false,
              catchAll: { name: "bar", greedy: false },
            },
          ],
        };
        expect(toRegexp(ir).source).toBe("^\\/foo\\/(?<foo>[^/]+)\\/bar\\/(?<bar>[^/]+)\\/?$");
      },
      urlpattern: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "foo", greedy: false },
            },
            { value: "bar", optional: false },
            {
              optional: false,
              catchAll: { name: "bar", greedy: false },
            },
          ],
        };
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:foo/bar/:bar{/}?");
      },
      urlpatterninit: () => {
        const ir: RouteIR = {
          pathname: [
            { value: "foo", optional: false },
            {
              optional: false,
              catchAll: { name: "foo", greedy: false },
            },
            { value: "bar", optional: false },
            {
              optional: false,
              catchAll: { name: "bar", greedy: false },
            },
          ],
        };
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:foo/bar/:bar{/}?");
      },
    }
  );
});

describe("Helper Functions", () => {
  describe("normalizeIR", () => {
    test("adds missing optional property", () => {
      const params: RouteParam[] = [{ value: "foo" }];
      const normalized = normalizeIR(params);
      expect(normalized).toEqual([{ value: "foo", optional: false }]);
    });

    test("preserves existing optional property", () => {
      const params: RouteParam[] = [{ value: "foo", optional: true }];
      const normalized = normalizeIR(params);
      expect(normalized).toEqual([{ value: "foo", optional: true }]);
    });

    test("normalizes catchAll structure", () => {
      const params: RouteParam[] = [
        {
          catchAll: { name: "id", greedy: false },
        },
      ];
      const normalized = normalizeIR(params);
      expect(normalized).toEqual([
        {
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ]);
    });
  });

  describe("join", () => {
    test("joins single route", () => {
      expect(join(["foo"])).toEqual(["/foo"]);
    });

    test("joins multiple routes", () => {
      expect(join(["foo", "bar"])).toEqual(["/foo/bar"]);
    });

    test("joins array of routes", () => {
      expect(join([["foo", "bar"]])).toEqual(["/foo", "/bar"]);
    });

    test("joins mixed single and array routes", () => {
      expect(join(["foo", ["bar", "baz"]])).toEqual(["/foo/bar", "/foo/baz"]);
    });

    test("handles null values", () => {
      expect(join([null, "foo"])).toEqual(["/foo"]);
    });

    test("flattens nested arrays", () => {
      expect(join([["foo"], ["bar", "baz"]])).toEqual(["/foo/bar", "/foo/baz"]);
    });
  });
});
