import "urlpattern-polyfill";
import { match as matchPtrv6 } from "path-to-regexpv6";
import { match as matchPtrv8 } from "path-to-regexpv8";
import { addRoute, createRouter, findRoute } from "rou3";
import { describe, expect, type TestContext, test } from "vitest";
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
  rou3: (ir: IR, context: TestContext & object) => RouteIR | void;
  "path-to-regexp-v6": (
    ir: IR,
    context: TestContext & object,
  ) => RouteIR | void;
  "path-to-regexp-v8": (
    ir: IR,
    context: TestContext & object,
  ) => RouteIR | void;
  urlpattern: (ir: IR, context: TestContext & object) => RouteIR | void;
  urlpatterninit: (ir: IR, context: TestContext & object) => RouteIR | void;
  nextfs: (ir: IR, context: TestContext & object) => RouteIR | void;
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
    test("rou3", (context) => {
      const res = tests.rou3(ir, context);
      if (res) {
        expect(res).toEqual(ir);
      } else {
        expect.hasAssertions();
      }
    });
    test("path-to-regexp-v6", (context) => {
      const res = tests["path-to-regexp-v6"](ir, context);
      if (res) {
        expect(res).toEqual(ir);
      } else {
        expect.hasAssertions();
      }
    });
    test("path-to-regexp-v8", (context) => {
      const res = tests["path-to-regexp-v8"](ir, context);
      if (res) {
        expect(res).toEqual(ir);
      } else {
        expect.hasAssertions();
      }
    });
    test("nextfs", (context) => {
      const res = tests.nextfs(ir, context);
      if (res) {
        expect(res).toEqual(ir);
      } else {
        expect.hasAssertions();
      }
    });
    test("urlpattern", (context) => {
      const res = tests.urlpattern(ir, context);
      if (res) {
        expect(res).toEqual(ir);
      } else {
        expect.hasAssertions();
      }
    });
    test("urlpatterninit", (context) => {
      const res = tests.urlpatterninit(ir, context);
      if (res) {
        expect(res).toEqual(ir);
      } else {
        expect.hasAssertions();
      }
    });
  });
}

// Helper to test IR → Pattern with compile-time verification
function testIRToPattern(
  pattern: string,
  ir: RouteIR,
  matches: {
    shouldMatch: string[];
    shouldNotMatch: string[];
  },
  tests: IRToPatternTests,
): void {
  describe(pattern, () => {
    describe("rou3", () => {
      test("pattern", () => {
        tests.rou3(ir);
        expect.hasAssertions();
      });

      const routes = toRou3(ir);
      const router = createRouter();
      routes.forEach((route) => {
        addRoute(router, "GET", route, { payload: route });
      });

      test.for(matches.shouldMatch)("should match %s", (path) => {
        const route = findRoute(router, "GET", path);
        expect(route).toBeTruthy();
      });

      test.for(matches.shouldNotMatch)("should not match %s", (path) => {
        const route = findRoute(router, "GET", path);
        expect(route).toBeFalsy();
      });
    });

    describe("path-to-regexp-v6", () => {
      test("pattern", () => {
        tests["path-to-regexp-v6"](ir);
        expect.hasAssertions();
      });

      test.for(matches.shouldMatch)("should match %s", (path) => {
        const route = toPathToRegexpV6(ir);
        expect(matchPtrv6(route)(path)).toBeTruthy();
      });

      test.for(matches.shouldNotMatch)("should not match %s", (path) => {
        const route = toPathToRegexpV6(ir);
        expect(matchPtrv6(route)(path)).toBeFalsy();
      });
    });

    describe("path-to-regexp-v8", () => {
      test("pattern", () => {
        tests["path-to-regexp-v8"](ir);
        expect.hasAssertions();
      });

      test.for(matches.shouldMatch)("should match %s", (path) => {
        const route = toPathToRegexpV8(ir);
        expect(matchPtrv8(route)(path)).toBeTruthy();
      });

      test.for(matches.shouldNotMatch)("should not match %s", (path) => {
        const route = toPathToRegexpV8(ir);
        expect(matchPtrv8(route)(path)).toBeFalsy();
      });
    });

    describe("regexp", () => {
      test("pattern", () => {
        tests.regexp(ir);
        expect.hasAssertions();
      });

      test.for(matches.shouldMatch)("should match %s", (path) => {
        const route = toRegexp(ir);
        expect(route.exec(path)).toBeTruthy();
      });

      test.for(matches.shouldNotMatch)("should not match %s", (path) => {
        const route = toRegexp(ir);
        expect(route.exec(path)).toBeFalsy();
      });
    });

    describe("urlpattern", () => {
      test("pattern", () => {
        tests.urlpattern(ir);
        expect.hasAssertions();
      });

      test.for(matches.shouldMatch)("should match %s", (path) => {
        const route = toURLPattern(ir);
        expect(route.exec({ pathname: path })).toBeTruthy();
      });

      test.for(matches.shouldNotMatch)("should not match %s", (path) => {
        const route = toURLPattern(ir);
        expect(route.exec({ pathname: path })).toBeFalsy();
      });
    });

    describe("urlpatterninit", () => {
      test("pattern", () => {
        tests.urlpatterninit(ir);
        expect.hasAssertions();
      });

      test.for(matches.shouldMatch)("should match %s", (path) => {
        const route = toURLPatternInput(ir);
        expect(new URLPattern(route).exec({ pathname: path })).toBeTruthy();
      });

      test.for(matches.shouldNotMatch)("should not match %s", (path) => {
        const route = toURLPatternInput(ir);
        expect(new URLPattern(route).exec({ pathname: path })).toBeFalsy();
      });
    });
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
      nextfs: (_, context) => {
        context.skip("[[slug]] is not supported by Next.js");
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
      nextfs: (_, context) => {
        context.skip("[[slug]] is not supported by Next.js");
      },
    },
  );
});

describe("IR → Pattern (Generation Tests)", () => {
  testIRToPattern(
    "/",
    { pathname: [] },
    {
      shouldMatch: ["/"],
      shouldNotMatch: ["/a", "/a/b"],
    },
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
      shouldMatch: ["/foo", "/foo/"],
      shouldNotMatch: ["/", "/a", "/a/b", "/foo/a", "/foo/a/b"],
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
      shouldMatch: ["/foo/bar", "/foo/bar/"],
      shouldNotMatch: [
        "/",
        "/a",
        "/a/b",
        "/foo/a",
        "/foo/a/b",
        "/foo/bar/a",
        "/foo/bar/a/b",
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
      shouldMatch: ["/foo/a", "/foo/a/", "/foo/b"],
      shouldNotMatch: [
        "/",
        "/a",
        "/a/b",
        "/foo",
        "/foo/",
        "/foo/bar/a",
        "/foo/bar/a/b",
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
      shouldMatch: ["/foo", "/foo/", "/foo/a", "/foo/a/"],
      shouldNotMatch: ["/", "/a", "/a/b", "/foo/a/b", "/foo/a/b/c"],
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
      shouldMatch: [
        "/foo/a",
        "/foo/b",
        "/foo/a/b",
        "/foo/a/b/c",
        "/foo/a/b/c/",
      ],
      shouldNotMatch: ["/", "/a", "/a/b"],
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
      shouldMatch: [
        "/foo",
        "/foo/",
        "/foo/a",
        "/foo/a/",
        "/foo/a/b",
        "/foo/a/b/",
        "/foo/a/b/c/d/e/f",
      ],
      shouldNotMatch: ["/", "/a", "/a/b"],
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
      shouldMatch: ["/foo/bar", "/foo/bar/", "/foo/a/bar", "/foo/a/bar/"],
      shouldNotMatch: [
        "/",
        "/a",
        "/a/b",
        "/foo/a/b",
        "/foo/a/b/c",
        "/foo/bar/a",
        "/foo/bar/a/b",
        "/foo/a/bar/b",
        "/foo/a/b/bar/c",
        "/foo/a/bar/b/c",
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
      shouldMatch: ["/foo/a/bar/b", "/foo/c/bar/d/"],
      shouldNotMatch: [
        "/",
        "/a",
        "/a/b",
        "/foo/a",
        "/foo/a/b",
        "/foo//bar",
        "/foo/bar/b",
        "/foo/a/bar/b/c",
        "/foo/a/bar/b/c/d",
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
