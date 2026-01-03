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
  rou3: (ir: RouteIR) => void;
  "path-to-regexp-v6": (ir: RouteIR) => void;
  "path-to-regexp-v8": (ir: RouteIR) => void;
  regexp: (ir: RouteIR) => void;
  urlpattern: (ir: RouteIR) => void;
  urlpatterninit: (ir: RouteIR) => void;
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
function testIRToPattern(pattern: string, ir: RouteIR, tests: IRToPatternTests): void {
  describe(pattern, () => {
    test("rou3", () => tests.rou3(ir));
    test("path-to-regexp-v6", () => tests["path-to-regexp-v6"](ir));
    test("path-to-regexp-v8", () => tests["path-to-regexp-v8"](ir));
    test("regexp", () => tests.regexp(ir));
    test("urlpattern", () => tests.urlpattern(ir));
    test("urlpatterninit", () => tests.urlpatterninit(ir));
  });
}

describe("Pattern → IR (Parsing Tests)", () => {
  testPatternToIR("/", {
    rou3: (ir) => {
      const result = fromRou3("/");
      expect(normalizeIR(result.pathname)).toEqual([]);
    },
    "path-to-regexp-v6": (ir) => {
      const result = fromPathToRegexpV6("/");
      expect(normalizeIR(result.pathname)).toEqual([]);
    },
    "path-to-regexp-v8": (ir) => {
      const result = fromPathToRegexpV8("/");
      expect(normalizeIR(result.pathname)).toEqual([]);
    },
    urlpattern: (ir) => {
      const pattern = new URLPattern({ pathname: "/{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.pathname)).toEqual([]);
    },
    urlpatterninit: (ir) => {
      const result = fromURLPattern({ pathname: "/{/}?" });
      expect(normalizeIR(result.pathname)).toEqual([]);
    },
    nextfs: () => {
      const result = fromNextFs("/");
      expect(normalizeIR(result.pathname)).toEqual([]);
    },
  });

  testPatternToIR("/foo", {
    rou3: (ir) => {
      const result = fromRou3("/foo");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
      ]);
    },
    "path-to-regexp-v6": (ir) => {
      const result = fromPathToRegexpV6("/foo");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
      ]);
    },
    "path-to-regexp-v8": (ir) => {
      const result = fromPathToRegexpV8("/foo");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
      ]);
    },
    urlpattern: (ir) => {
      const pattern = new URLPattern({ pathname: "/foo{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
      ]);
    },
    urlpatterninit: (ir) => {
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
    rou3: (ir) => {
      const result = fromRou3("/foo/bar");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        { value: "bar", optional: false },
      ]);
    },
    "path-to-regexp-v6": (ir) => {
      const result = fromPathToRegexpV6("/foo/bar");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        { value: "bar", optional: false },
      ]);
    },
    "path-to-regexp-v8": (ir) => {
      const result = fromPathToRegexpV8("/foo/bar");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        { value: "bar", optional: false },
      ]);
    },
    urlpattern: (ir) => {
      const pattern = new URLPattern({ pathname: "/foo/bar{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        { value: "bar", optional: false },
      ]);
    },
    urlpatterninit: (ir) => {
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

  const irPathname_foo_id: RouteParam[] = [
    { value: "foo", optional: false },
    {
      optional: false,
      catchAll: { name: "id", greedy: false },
    },
  ];
  
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
    "path-to-regexp-v6": (ir) => {
      const result = fromPathToRegexpV6("/foo/:id");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ]);
    },
    "path-to-regexp-v8": (ir) => {
      const result = fromPathToRegexpV8("/foo/:id");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ]);
    },
    urlpattern: (ir) => {
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
    urlpatterninit: (ir) => {
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

    const irPathname_foo_foo_bar_bar: RouteParam[] = [
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
      ];
  
testPatternToIR("/foo/:foo/bar/:bar", {
    rou3: (ir) => {
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
    "path-to-regexp-v6": (ir) => {
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
    "path-to-regexp-v8": (ir) => {
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
    urlpattern: (ir) => {
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
    urlpatterninit: (ir) => {
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

    const irPathname_foo_star: RouteParam[] = [
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { greedy: false },
        },
      ];
  
testPatternToIR("/foo/*", {
    rou3: (ir) => {
      const result = fromRou3("/foo/*");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { greedy: false },
        },
      ]);
    },
    "path-to-regexp-v6": (ir) => {
      const result = fromPathToRegexpV6("/foo/:_1?");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: false },
        },
      ]);
    },
    "path-to-regexp-v8": (ir) => {
      const result = fromPathToRegexpV8("/foo{/:_1}");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: false },
        },
      ]);
    },
    urlpattern: (ir) => {
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
    urlpatterninit: (ir) => {
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

    const irPathname_foo_starstar_1: RouteParam[] = [
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "_1", greedy: true },
        },
      ];
  
testPatternToIR("/foo/**:_1", {
    rou3: (ir) => {
      const result = fromRou3("/foo/**:_1");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    },
    "path-to-regexp-v6": (ir) => {
      const result = fromPathToRegexpV6("/foo/:_1+");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    },
    "path-to-regexp-v8": (ir) => {
      const result = fromPathToRegexpV8("/foo/*_1");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    },
    urlpattern: (ir) => {
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
    urlpatterninit: (ir) => {
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

    const irPathname_foo_starstar: RouteParam[] = [
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { greedy: true },
        },
      ];
  
testPatternToIR("/foo/**", {
    rou3: (ir) => {
      const result = fromRou3("/foo/**");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { greedy: true },
        },
      ]);
    },
    "path-to-regexp-v6": (ir) => {
      const result = fromPathToRegexpV6("/foo/:_1*");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    },
    "path-to-regexp-v8": (ir) => {
      const result = fromPathToRegexpV8("/foo{/*_1}");
      expect(normalizeIR(result.pathname)).toEqual([
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    },
    urlpattern: (ir) => {
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
    urlpatterninit: (ir) => {
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

    const irPathname_foo__1_bar: RouteParam[] = [
        { value: "foo", optional: false },
        {
          optional: false,
          catchAll: { greedy: false },
        },
        { value: "bar", optional: false },
      ];
  
testPatternToIR("/foo{/:_1}/bar", {
    rou3: (ir) => {
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
    "path-to-regexp-v6": (ir) => {
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
    "path-to-regexp-v8": (ir) => {
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
    urlpattern: (ir) => {
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
    urlpatterninit: (ir) => {
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
      rou3: (ir) => {
        expect(toRou3(ir)).toEqual(["/"]);
      },
      "path-to-regexp-v6": (ir) => {
        expect(toPathToRegexpV6(ir)).toBe("/");
      },
      "path-to-regexp-v8": (ir) => {
        expect(toPathToRegexpV8(ir)).toBe("/");
      },
      regexp: (ir) => {
        expect(toRegexp(ir).source).toBe("^\\/\\/?$");
      },
      urlpattern: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/{/}?");
      },
      urlpatterninit: (ir) => {
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
      rou3: (ir) => {
        expect(toRou3(ir)).toEqual(["/foo"]);
      },
      "path-to-regexp-v6": (ir) => {
        expect(toPathToRegexpV6(ir)).toBe("/foo");
      },
      "path-to-regexp-v8": (ir) => {
        expect(toPathToRegexpV8(ir)).toBe("/foo");
      },
      regexp: (ir) => {
        expect(toRegexp(ir).source).toBe("^\\/foo\\/?$");
      },
      urlpattern: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/foo{/}?");
      },
      urlpatterninit: (ir) => {
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
      rou3: (ir) => {
        expect(toRou3(ir)).toEqual(["/foo/bar"]);
      },
      "path-to-regexp-v6": (ir) => {
        expect(toPathToRegexpV6(ir)).toBe("/foo/bar");
      },
      "path-to-regexp-v8": (ir) => {
        expect(toPathToRegexpV8(ir)).toBe("/foo/bar");
      },
      regexp: (ir) => {
        expect(toRegexp(ir).source).toBe("^\\/foo\\/bar\\/?$");
      },
      urlpattern: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/foo/bar{/}?");
      },
      urlpatterninit: (ir) => {
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
      rou3: (ir) => {
        expect(toRou3(ir)).toEqual(["/foo/:id"]);
      },
      "path-to-regexp-v6": (ir) => {
        expect(toPathToRegexpV6(ir)).toBe("/foo/:id");
      },
      "path-to-regexp-v8": (ir) => {
        expect(toPathToRegexpV8(ir)).toBe("/foo/:id");
      },
      regexp: (ir) => {
        expect(toRegexp(ir).source).toBe("^\\/foo\\/(?<id>[^/]+)\\/?$");
      },
      urlpattern: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:id{/}?");
      },
      urlpatterninit: (ir) => {
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
      rou3: (ir) => {
        expect(toRou3(ir)).toEqual(["/foo/*"]);
      },
      "path-to-regexp-v6": (ir) => {
        expect(toPathToRegexpV6(ir)).toBe("/foo/:_1?");
      },
      "path-to-regexp-v8": (ir) => {
        expect(toPathToRegexpV8(ir)).toBe("/foo{/:_1}");
      },
      regexp: (ir) => {
        expect(toRegexp(ir).source).toBe("^\\/foo\\/?(?<_1>[^/]*)\\/?$");
      },
      urlpattern: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1?{/}?");
      },
      urlpatterninit: (ir) => {
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
      rou3: (ir) => {
        expect(toRou3(ir)).toEqual(["/foo/**:_1"]);
      },
      "path-to-regexp-v6": (ir) => {
        expect(toPathToRegexpV6(ir)).toBe("/foo/:_1+");
      },
      "path-to-regexp-v8": (ir) => {
        expect(toPathToRegexpV8(ir)).toBe("/foo/*_1");
      },
      regexp: (ir) => {
        expect(toRegexp(ir).source).toBe("^\\/foo\\/(?<_1>.+)\\/?$");
      },
      urlpattern: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1+{/}?");
      },
      urlpatterninit: (ir) => {
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
      rou3: (ir) => {
        expect(toRou3(ir)).toEqual(["/foo/**"]);
      },
      "path-to-regexp-v6": (ir) => {
        expect(toPathToRegexpV6(ir)).toBe("/foo/:_1*");
      },
      "path-to-regexp-v8": (ir) => {
        expect(toPathToRegexpV8(ir)).toBe("/foo{/*_1}");
      },
      regexp: (ir) => {
        expect(toRegexp(ir).source).toBe("^\\/foo\\/?(?<_1>.*)\\/?$");
      },
      urlpattern: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1*{/}?");
      },
      urlpatterninit: (ir) => {
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
      rou3: (ir) => {
        expect(toRou3(ir)).toEqual(["/foo/bar", "/foo/*/bar"]);
      },
      "path-to-regexp-v6": (ir) => {
        expect(toPathToRegexpV6(ir)).toBe("/foo/:_1?/bar");
      },
      "path-to-regexp-v8": (ir) => {
        expect(toPathToRegexpV8(ir)).toBe("/foo{/:_1}/bar");
      },
      regexp: (ir) => {
        expect(toRegexp(ir).source).toBe("^\\/foo\\/?(?<_1>[^/]*)\\/bar\\/?$");
      },
      urlpattern: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1?/bar{/}?");
      },
      urlpatterninit: (ir) => {
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
      rou3: (ir) => {
        expect(toRou3(ir)).toEqual(["/foo/:foo/bar/:bar"]);
      },
      "path-to-regexp-v6": (ir) => {
        expect(toPathToRegexpV6(ir)).toBe("/foo/:foo/bar/:bar");
      },
      "path-to-regexp-v8": (ir) => {
        expect(toPathToRegexpV8(ir)).toBe("/foo/:foo/bar/:bar");
      },
      regexp: (ir) => {
        expect(toRegexp(ir).source).toBe("^\\/foo\\/(?<foo>[^/]+)\\/bar\\/(?<bar>[^/]+)\\/?$");
      },
      urlpattern: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:foo/bar/:bar{/}?");
      },
      urlpatterninit: (ir) => {
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
