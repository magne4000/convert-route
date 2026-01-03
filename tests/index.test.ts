import "urlpattern-polyfill";
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
import { toRegexp } from "../src/adapters/regexp.js";
import { fromRou3, toRou3 } from "../src/adapters/rou3.js";
import {
  fromURLPattern,
  toURLPattern,
  toURLPatternInput,
} from "../src/adapters/urlpattern.js";
import type { RouteIR } from "../src/types.js";
import { join } from "../src/utils/join.js";

// Type-safe test helpers to ensure complete coverage
// For Pattern → IR: ALL 6 formats required
type PatternToIRTests<IR extends RouteIR> = {
  rou3: (ir: IR) => RouteIR | void;
  "path-to-regexp-v6": (ir: IR) => RouteIR | void;
  "path-to-regexp-v8": (ir: IR) => RouteIR | void;
  urlpattern: (ir: IR) => RouteIR | void;
  urlpatterninit: (ir: IR) => RouteIR | void;
  nextfs: (ir: IR) => RouteIR | void;
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
function testPatternToIR<const IR extends RouteIR>(
  pattern: string,
  ir: IR,
  tests: PatternToIRTests<IR>,
): void {
  describe(pattern, () => {
    test("rou3", () => {
      const res = tests.rou3(ir);
      if (res) {
        expect(res).toEqual(ir);
      } else {
        expect.hasAssertions();
      }
    });
    test("path-to-regexp-v6", () => {
      const res = tests["path-to-regexp-v6"](ir);
      if (res) {
        expect(res).toEqual(ir);
      } else {
        expect.hasAssertions();
      }
    });
    test("path-to-regexp-v8", () => {
      const res = tests["path-to-regexp-v8"](ir);
      if (res) {
        expect(res).toEqual(ir);
      } else {
        expect.hasAssertions();
      }
    });
    test("nextfs", () => {
      const res = tests.nextfs(ir);
      if (res) {
        expect(res).toEqual(ir);
      } else {
        expect.hasAssertions();
      }
    });
    test("urlpattern", () => {
      const res = tests.urlpattern(ir);
      if (res) {
        expect(res).toEqual(ir);
      } else {
        expect.hasAssertions();
      }
    });
    test("urlpatterninit", () => {
      const res = tests.urlpatterninit(ir);
      if (res) {
        expect(res).toEqual(ir);
      } else {
        expect.hasAssertions();
      }
    });
  });
}

// Helper to test IR → Pattern with compile-time verification
// FIXME also test match/no-match with actual routes
function testIRToPattern(
  pattern: string,
  ir: RouteIR,
  tests: IRToPatternTests,
): void {
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
  testPatternToIR(
    "/",
    { pathname: [] },
    {
      rou3: () => fromRou3("/"),
      "path-to-regexp-v6": () => fromPathToRegexpV6("/"),
      "path-to-regexp-v8": () => fromPathToRegexpV8("/"),
      urlpattern: () => fromURLPattern(new URLPattern({ pathname: "/{/}?" })),
      urlpatterninit: () => fromURLPattern({ pathname: "/{/}?" }),
      nextfs: () => fromNextFs("/"),
    },
  );

  testPatternToIR(
    "/foo",
    { pathname: [{ value: "foo", optional: false }] },
    {
      rou3: () => fromRou3("/foo"),
      "path-to-regexp-v6": () => fromPathToRegexpV6("/foo"),
      "path-to-regexp-v8": () => fromPathToRegexpV8("/foo"),
      urlpattern: () =>
        fromURLPattern(new URLPattern({ pathname: "/foo{/}?" })),
      urlpatterninit: () => fromURLPattern({ pathname: "/foo{/}?" }),
      nextfs: () => fromNextFs("/foo"),
    },
  );

  testPatternToIR(
    "/foo/bar",
    {
      pathname: [
        { value: "foo", optional: false },
        { value: "bar", optional: false },
      ],
    },
    {
      rou3: () => fromRou3("/foo/bar"),
      "path-to-regexp-v6": () => fromPathToRegexpV6("/foo/bar"),
      "path-to-regexp-v8": () => fromPathToRegexpV8("/foo/bar"),
      urlpattern: () =>
        fromURLPattern(new URLPattern({ pathname: "/foo/bar{/}?" })),
      urlpatterninit: () => fromURLPattern({ pathname: "/foo/bar{/}?" }),
      nextfs: () => fromNextFs("/foo/bar"),
    },
  );

  testPatternToIR(
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
      rou3: () => fromRou3("/foo/:id"),
      "path-to-regexp-v6": () => fromPathToRegexpV6("/foo/:id"),
      "path-to-regexp-v8": () => fromPathToRegexpV8("/foo/:id"),
      urlpattern: () =>
        fromURLPattern(new URLPattern({ pathname: "/foo/:id{/}?" })),
      urlpatterninit: () => fromURLPattern({ pathname: "/foo/:id{/}?" }),
      nextfs: () => fromNextFs("/foo/[id]"),
    },
  );

  testPatternToIR(
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
      rou3: () => fromRou3("/foo/:foo/bar/:bar"),
      "path-to-regexp-v6": () => fromPathToRegexpV6("/foo/:foo/bar/:bar"),
      "path-to-regexp-v8": () => fromPathToRegexpV8("/foo/:foo/bar/:bar"),
      urlpattern: () =>
        fromURLPattern(new URLPattern({ pathname: "/foo/:foo/bar/:bar{/}?" })),
      urlpatterninit: () =>
        fromURLPattern({ pathname: "/foo/:foo/bar/:bar{/}?" }),
      nextfs: () => fromNextFs("/foo/[foo]/bar/[bar]"),
    },
  );

  const fooNamedIr = {
    pathname: [
      { value: "foo", optional: false },
      {
        optional: true,
        catchAll: { greedy: false, name: "_1" },
      },
    ],
  };
  testPatternToIR(
    "/foo/*",
    {
      pathname: [
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { greedy: false },
        },
      ],
    },
    {
      rou3: () => fromRou3("/foo/*"),
      "path-to-regexp-v6": () => {
        // No unnamed capturing group support
        expect(fromPathToRegexpV6("/foo/:_1?")).toEqual(fooNamedIr);
      },
      "path-to-regexp-v8": () => {
        // No unnamed capturing group support
        expect(fromPathToRegexpV8("/foo{/:_1}")).toEqual(fooNamedIr);
      },
      urlpattern: () => {
        // No unnamed capturing group support
        expect(
          fromURLPattern(new URLPattern({ pathname: "/foo/:_1?{/}?" })),
        ).toEqual(fooNamedIr);
      },
      urlpatterninit: () => {
        // No unnamed capturing group support
        expect(fromURLPattern({ pathname: "/foo/:_1?{/}?" })).toEqual(
          fooNamedIr,
        );
      },
      nextfs: () => {
        // No unnamed capturing group support
        expect(fromNextFs("/foo/[[_1]]")).toEqual(fooNamedIr);
      },
    },
  );

  testPatternToIR(
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
      rou3: () => fromRou3("/foo/**:_1"),
      "path-to-regexp-v6": () => fromPathToRegexpV6("/foo/:_1+"),
      "path-to-regexp-v8": () => fromPathToRegexpV8("/foo/*_1"),
      urlpattern: () =>
        fromURLPattern(new URLPattern({ pathname: "/foo/:_1+{/}?" })),
      urlpatterninit: () => fromURLPattern({ pathname: "/foo/:_1+{/}?" }),
      nextfs: () => fromNextFs("/foo/[..._1]"),
    },
  );

  testPatternToIR(
    "/foo/**",
    {
      pathname: [
        { value: "foo", optional: false },
        {
          optional: true,
          catchAll: { greedy: true },
        },
      ],
    },
    {
      rou3: () => fromRou3("/foo/**"),
      "path-to-regexp-v6": () => fromPathToRegexpV6("/foo/(.*)"),
      "path-to-regexp-v8": () => {
        // No unnamed capturing group support
        expect(fromPathToRegexpV8("/foo{/*_1}")).toEqual({
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { greedy: true, name: "_1" },
            },
          ],
        });
      },
      urlpattern: () =>
        fromURLPattern(new URLPattern({ pathname: "/foo/*{/}?" })),
      urlpatterninit: () => fromURLPattern({ pathname: "/foo/*{/}?" }),
      nextfs: () => {
        // No unnamed capturing group support
        expect(fromNextFs("/foo/[[..._1]]")).toEqual({
          pathname: [
            { value: "foo", optional: false },
            {
              optional: true,
              catchAll: { greedy: true, name: "_1" },
            },
          ],
        });
      },
    },
  );

  testPatternToIR(
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
      rou3: () => fromRou3("/foo/*:_1/bar"),
      "path-to-regexp-v6": () => fromPathToRegexpV6("/foo/:_1?/bar"),
      "path-to-regexp-v8": () => fromPathToRegexpV8("/foo{/:_1}/bar"),
      urlpattern: () =>
        fromURLPattern(new URLPattern({ pathname: "/foo/:_1?/bar{/}?" })),
      urlpatterninit: () => fromURLPattern({ pathname: "/foo/:_1?/bar{/}?" }),
      nextfs: () => fromNextFs("/foo/[[_1]]/bar"),
    },
  );
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
        expect(toURLPattern(ir).pathname).toBe("/{/}?");
      },
      urlpatterninit: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/{/}?");
      },
    },
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
        expect(toURLPattern(ir).pathname).toBe("/foo{/}?");
      },
      urlpatterninit: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/foo{/}?");
      },
    },
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
        expect(toURLPattern(ir).pathname).toBe("/foo/bar{/}?");
      },
      urlpatterninit: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/foo/bar{/}?");
      },
    },
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
        expect(toURLPattern(ir).pathname).toBe("/foo/:id{/}?");
      },
      urlpatterninit: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:id{/}?");
      },
    },
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
        expect(toURLPattern(ir).pathname).toBe("/foo/:_1?{/}?");
      },
      urlpatterninit: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1?{/}?");
      },
    },
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
        expect(toURLPattern(ir).pathname).toBe("/foo/:_1+{/}?");
      },
      urlpatterninit: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1+{/}?");
      },
    },
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
        expect(toURLPattern(ir).pathname).toBe("/foo/:_1*{/}?");
      },
      urlpatterninit: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1*{/}?");
      },
    },
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
        expect(toURLPattern(ir).pathname).toBe("/foo/:_1?/bar{/}?");
      },
      urlpatterninit: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1?/bar{/}?");
      },
    },
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
        expect(toRegexp(ir).source).toBe(
          "^\\/foo\\/(?<foo>[^/]+)\\/bar\\/(?<bar>[^/]+)\\/?$",
        );
      },
      urlpattern: (ir) => {
        expect(toURLPattern(ir).pathname).toBe("/foo/:foo/bar/:bar{/}?");
      },
      urlpatterninit: (ir) => {
        expect(toURLPatternInput(ir).pathname).toBe("/foo/:foo/bar/:bar{/}?");
      },
    },
  );
});

describe("Helper Functions", () => {
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
