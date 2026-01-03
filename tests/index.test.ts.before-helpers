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
function testIRToPattern(pattern: string, ir: RouteIR, tests: IRToPatternTests): void {
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
  describe("/", () => {
    test("rou3", () => {
      const result = fromRou3("/");
      expect(normalizeIR(result.params)).toEqual([]);
    });

    test("path-to-regexp-v8", () => {
      const result = fromPathToRegexpV8("/");
      expect(normalizeIR(result.params)).toEqual([]);
    });

    test("urlpattern", () => {
      const pattern = new URLPattern({ pathname: "/{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.params)).toEqual([]);
    });

    test("urlpatterninit", () => {
      const result = fromURLPattern({ pathname: "/{/}?" });
      expect(normalizeIR(result.params)).toEqual([]);
    });
  });

  describe("/foo", () => {
    test("rou3", () => {
      const result = fromRou3("/foo");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
      ]);
    });

    test("path-to-regexp-v8", () => {
      const result = fromPathToRegexpV8("/foo");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
      ]);
    });

    test("nextfs", () => {
      const result = fromNextFs("/foo");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
      ]);
    });
  });

  describe("/foo/bar", () => {
    test("rou3", () => {
      const result = fromRou3("/foo/bar");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        { value: "bar", optional: false },
      ]);
    });

    test("path-to-regexp-v8", () => {
      const result = fromPathToRegexpV8("/foo/bar");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        { value: "bar", optional: false },
      ]);
    });
  });

  describe("/foo/:id", () => {
    test("rou3", () => {
      const result = fromRou3("/foo/:id");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: ":id",
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ]);
    });

    test("path-to-regexp-v8", () => {
      const result = fromPathToRegexpV8("/foo/:id");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: ":id",
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ]);
    });

    test("urlpattern", () => {
      const pattern = new URLPattern({ pathname: "/foo/:id{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: ":id",
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ]);
    });

    test("urlpatterninit", () => {
      const result = fromURLPattern({ pathname: "/foo/:id{/}?" });
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: ":id",
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ]);
    });

    test("nextfs", () => {
      const result = fromNextFs("/foo/[id]");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: "[id]",
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ]);
    });
  });

  describe("/foo/:foo/bar/:bar", () => {
    test("rou3", () => {
      const result = fromRou3("/foo/:foo/bar/:bar");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: ":foo",
          optional: false,
          catchAll: { name: "foo", greedy: false },
        },
        { value: "bar", optional: false },
        {
          value: ":bar",
          optional: false,
          catchAll: { name: "bar", greedy: false },
        },
      ]);
    });

    test("path-to-regexp-v8", () => {
      const result = fromPathToRegexpV8("/foo/:foo/bar/:bar");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: ":foo",
          optional: false,
          catchAll: { name: "foo", greedy: false },
        },
        { value: "bar", optional: false },
        {
          value: ":bar",
          optional: false,
          catchAll: { name: "bar", greedy: false },
        },
      ]);
    });
  });

  describe("/foo/*", () => {
    test("rou3", () => {
      const result = fromRou3("/foo/*");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: ":_1",
          optional: true,
          catchAll: { name: "_1", greedy: false },
        },
      ]);
    });

    test("path-to-regexp-v8", () => {
      const result = fromPathToRegexpV8("/foo{/:_1}");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: ":_1",
          optional: true,
          catchAll: { name: "_1", greedy: false },
        },
      ]);
    });

    test("urlpattern", () => {
      const pattern = new URLPattern({ pathname: "/foo/:_1?{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: ":_1",
          optional: true,
          catchAll: { name: "_1", greedy: false },
        },
      ]);
    });
  });

  describe("/foo/**:_1", () => {
    test("rou3", () => {
      const result = fromRou3("/foo/**:_1");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: ":_1",
          optional: false,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    });

    test("path-to-regexp-v8", () => {
      const result = fromPathToRegexpV8("/foo/*_1");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: ":_1",
          optional: false,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    });

    test("urlpattern", () => {
      const pattern = new URLPattern({ pathname: "/foo/:_1+{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: ":_1",
          optional: false,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    });

    test("nextfs", () => {
      const result = fromNextFs("/foo/[..._1]");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: "[..._1]",
          optional: false,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    });
  });

  describe("/foo/**", () => {
    test("rou3", () => {
      const result = fromRou3("/foo/**");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: ":_1",
          optional: true,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    });

    test("path-to-regexp-v8", () => {
      const result = fromPathToRegexpV8("/foo{/*_1}");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: ":_1",
          optional: true,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    });

    test("urlpattern", () => {
      const pattern = new URLPattern({ pathname: "/foo/:_1*{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: ":_1",
          optional: true,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    });

    test("nextfs", () => {
      const result = fromNextFs("/foo/[[..._1]]");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: "[[..._1]]",
          optional: true,
          catchAll: { name: "_1", greedy: true },
        },
      ]);
    });
  });

  describe("/foo{/:_1}/bar", () => {
    test("path-to-regexp-v8", () => {
      const result = fromPathToRegexpV8("/foo{/:_1}/bar");
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: ":_1",
          optional: true,
          catchAll: { name: "_1", greedy: false },
        },
        { value: "bar", optional: false },
      ]);
    });

    test("urlpattern", () => {
      const pattern = new URLPattern({ pathname: "/foo/:_1?/bar{/}?" });
      const result = fromURLPattern(pattern);
      expect(normalizeIR(result.params)).toEqual([
        { value: "foo", optional: false },
        {
          value: ":_1",
          optional: true,
          catchAll: { name: "_1", greedy: false },
        },
        { value: "bar", optional: false },
      ]);
    });
  });
});

describe("IR → Pattern (Generation Tests)", () => {
  describe("/", () => {
    test("generates correctly for all formats", () => {
      const ir: RouteIR = { pattern: "", params: [] };
      
      expect(toRou3(ir)).toEqual(["/"]);
      expect(toPathToRegexpV6(ir)).toBe("/");
      expect(toPathToRegexpV8(ir)).toBe("/");
      expect(toRegexp(ir).source).toBe("^\\/\\/?$");
      expect(toURLPatternInput(ir).pathname).toBe("/{/}?");
    });
  });

  describe("/foo", () => {
    test("generates correctly for all formats", () => {
      const ir: RouteIR = {
        pattern: "",
        params: [{ value: "foo", optional: false }],
      };

      expect(toRou3(ir)).toEqual(["/foo"]);
      expect(toPathToRegexpV6(ir)).toBe("/foo");
      expect(toPathToRegexpV8(ir)).toBe("/foo");
      expect(toRegexp(ir).source).toBe("^\\/foo\\/?$");
      expect(toURLPatternInput(ir).pathname).toBe("/foo{/}?");
    });
  });

  describe("/foo/bar", () => {
    test("generates correctly for all formats", () => {
      const ir: RouteIR = {
        pattern: "",
        params: [
          { value: "foo", optional: false },
          { value: "bar", optional: false },
        ],
      };

      expect(toRou3(ir)).toEqual(["/foo/bar"]);
      expect(toPathToRegexpV6(ir)).toBe("/foo/bar");
      expect(toPathToRegexpV8(ir)).toBe("/foo/bar");
      expect(toRegexp(ir).source).toBe("^\\/foo\\/bar\\/?$");
      expect(toURLPatternInput(ir).pathname).toBe("/foo/bar{/}?");
    });
  });

  describe("/foo/:id", () => {
    test("generates: rou3:/foo/:id, ptr6:/foo/:id, ptr8:/foo/:id, urlpattern:/foo/:id", () => {
      const ir: RouteIR = {
        pattern: "",
        params: [
          { value: "foo", optional: false },
          {
            value: ":id",
            optional: false,
            catchAll: { name: "id", greedy: false },
          },
        ],
      };

      expect(toRou3(ir)).toEqual(["/foo/:id"]);
      expect(toPathToRegexpV6(ir)).toBe("/foo/:id");
      expect(toPathToRegexpV8(ir)).toBe("/foo/:id");
      expect(toRegexp(ir).source).toBe("^\\/foo\\/(?<id>[^\\/]+?)\\/?$");
      expect(toURLPatternInput(ir).pathname).toBe("/foo/:id{/}?");
    });
  });

  describe("/foo/*", () => {
    test("generates: rou3:/foo/*, ptr6:/foo/:_1?, ptr8:/foo{/:_1}, urlpattern:/foo/:_1?", () => {
      const ir: RouteIR = {
        pattern: "",
        params: [
          { value: "foo", optional: false },
          {
            value: ":_1",
            optional: true,
            catchAll: { name: "_1", greedy: false },
          },
        ],
      };

      expect(toRou3(ir)).toEqual(["/foo/*"]);
      expect(toPathToRegexpV6(ir)).toBe("/foo/:_1?");
      expect(toPathToRegexpV8(ir)).toBe("/foo{/:_1}");
      expect(toRegexp(ir).source).toBe("^\\/foo(?:\\/(?<_1>[^\\/]+?))?\\/?$");
      expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1?{/}?");
    });
  });

  describe("/foo/**:_1", () => {
    test("generates: rou3:/foo/**:_1, ptr6:/foo/:_1+, ptr8:/foo/*_1, urlpattern:/foo/:_1+", () => {
      const ir: RouteIR = {
        pattern: "",
        params: [
          { value: "foo", optional: false },
          {
            value: ":_1",
            optional: false,
            catchAll: { name: "_1", greedy: true },
          },
        ],
      };

      expect(toRou3(ir)).toEqual(["/foo/**:_1"]);
      expect(toPathToRegexpV6(ir)).toBe("/foo/:_1+");
      expect(toPathToRegexpV8(ir)).toBe("/foo/*_1");
      expect(toRegexp(ir).source).toBe("^\\/foo\\/(?<_1>.+?)\\/?$");
      expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1+{/}?");
    });
  });

  describe("/foo/**", () => {
    test("generates: rou3:/foo/**, ptr6:/foo/:_1*, ptr8:/foo{/*_1}, urlpattern:/foo/:_1*", () => {
      const ir: RouteIR = {
        pattern: "",
        params: [
          { value: "foo", optional: false },
          {
            value: ":_1",
            optional: true,
            catchAll: { name: "_1", greedy: true },
          },
        ],
      };

      expect(toRou3(ir)).toEqual(["/foo/**"]);
      expect(toPathToRegexpV6(ir)).toBe("/foo/:_1*");
      expect(toPathToRegexpV8(ir)).toBe("/foo{/*_1}");
      expect(toRegexp(ir).source).toBe("^\\/foo(?:\\/(?<_1>.+?))?\\/?$");
      expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1*{/}?");
    });
  });

  describe("/foo{/:_1}/bar", () => {
    test("generates optional segment in middle", () => {
      const ir: RouteIR = {
        pattern: "",
        params: [
          { value: "foo", optional: false },
          {
            value: ":_1",
            optional: true,
            catchAll: { name: "_1", greedy: false },
          },
          { value: "bar", optional: false },
        ],
      };

      expect(toPathToRegexpV6(ir)).toBe("/foo/:_1?/bar");
      expect(toPathToRegexpV8(ir)).toBe("/foo{/:_1}/bar");
      expect(toRegexp(ir).source).toBe("^\\/foo(?:\\/(?<_1>[^\\/]+?))?\/bar\\/?$");
      expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1?/bar{/}?");
    });
  });

  describe("/foo/:foo/bar/:bar", () => {
    test("generates multiple named params", () => {
      const ir: RouteIR = {
        pattern: "",
        params: [
          { value: "foo", optional: false },
          {
            value: ":foo",
            optional: false,
            catchAll: { name: "foo", greedy: false },
          },
          { value: "bar", optional: false },
          {
            value: ":bar",
            optional: false,
            catchAll: { name: "bar", greedy: false },
          },
        ],
      };

      expect(toRou3(ir)).toEqual(["/foo/:foo/bar/:bar"]);
      expect(toPathToRegexpV6(ir)).toBe("/foo/:foo/bar/:bar");
      expect(toPathToRegexpV8(ir)).toBe("/foo/:foo/bar/:bar");
      expect(toRegexp(ir).source).toBe("^\\/foo\\/(?<foo>[^\\/]+?)\\/bar\\/(?<bar>[^\\/]+?)\\/?$");
      expect(toURLPatternInput(ir).pathname).toBe("/foo/:foo/bar/:bar{/}?");
    });
  });
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
          value: ":id",
          catchAll: { name: "id", greedy: false },
        },
      ];
      const normalized = normalizeIR(params);
      expect(normalized).toEqual([
        {
          value: ":id",
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ]);
    });
  });

  describe("join", () => {
    test("joins single route", () => {
      expect(join(["/foo"])).toEqual(["/foo"]);
    });

    test("joins multiple routes", () => {
      expect(join(["/foo", "/bar"])).toEqual(["/foo", "/bar"]);
    });

    test("joins array of routes", () => {
      expect(join([["/foo", "/bar"]])).toEqual(["/foo", "/bar"]);
    });

    test("joins mixed single and array routes", () => {
      expect(join(["/foo", ["/bar", "/baz"]])).toEqual(["/foo", "/bar", "/baz"]);
    });

    test("handles null values", () => {
      expect(join([null, "/foo"])).toEqual(["/foo"]);
    });

    test("flattens nested arrays", () => {
      expect(join([["/foo"], ["/bar", "/baz"]])).toEqual(["/foo", "/bar", "/baz"]);
    });
  });
});
