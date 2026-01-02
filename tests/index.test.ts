import "urlpattern-polyfill";
import type { RouteParam, RouteIR } from "../src/types.js";
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
  toURLPattern,
  toURLPatternInput,
} from "../src/adapters/urlpattern.js";
import { toRegexp } from "../src/adapters/regexp.js";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Normalize IR params to ensure consistent optional property and property order
function normalizeIR(params: RouteParam[]): RouteParam[] {
  return params.map((param) => {
    // Build normalized object with consistent property order
    const normalized: RouteParam = {
      value: param.value,
      optional: param.optional ?? false, // Always include, default to false
    };

    // Add catchAll if present, with consistent internal order
    if (param.catchAll) {
      normalized.catchAll = {
        name: param.catchAll.name,
        greedy: param.catchAll.greedy,
      };
    }

    return normalized;
  });
}

// ============================================================================
// PATTERN → IR TESTS (Input Fixtures)
// ============================================================================

describe("Pattern → IR (Parsing Tests)", () => {
  test("rou3: / → empty params", () => {
    const result = fromRou3("/");
    expect(normalizeIR(result.params)).toEqual([]);
  });

  test("path-to-regexp-v8: / → empty params", () => {
    const result = fromPathToRegexpV8("/");
    expect(normalizeIR(result.params)).toEqual([]);
  });

  test("rou3: /foo → single static segment", () => {
    const result = fromRou3("/foo");
    expect(normalizeIR(result.params)).toEqual([
      { value: "foo", optional: false },
    ]);
  });

  test("path-to-regexp-v8: /foo → single static segment", () => {
    const result = fromPathToRegexpV8("/foo");
    expect(normalizeIR(result.params)).toEqual([
      { value: "foo", optional: false },
    ]);
  });

  test("rou3: /foo/bar → two static segments", () => {
    const result = fromRou3("/foo/bar");
    expect(normalizeIR(result.params)).toEqual([
      { value: "foo", optional: false },
      { value: "bar", optional: false },
    ]);
  });

  test("rou3: /foo/:id → named parameter", () => {
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

  test("path-to-regexp-v8: /foo/:id → named parameter", () => {
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

  test("rou3: /foo/:foo/bar/:bar → multiple named parameters", () => {
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

  test("rou3: /foo/* → optional single segment wildcard", () => {
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

  test("path-to-regexp-v8: /foo{/:_1} → optional single segment", () => {
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

  test("rou3: /foo/**:_1 → required multi-segment (greedy)", () => {
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

  test("path-to-regexp-v8: /foo/*_1 → required multi-segment (greedy)", () => {
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

  test("rou3: /foo/** → optional multi-segment wildcard", () => {
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

  test("path-to-regexp-v8: /foo{/*_1} → optional multi-segment", () => {
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

  test("urlpattern: /foo/:id{/}? → named parameter with trailing slash", () => {
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

  test("urlpattern: /foo/:_1?{/}? → optional single segment", () => {
    const pattern = new URLPattern({ pathname: "/foo{/:_1}?{/}?" });
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

  test("urlpattern: /foo/:_1+{/}? → required multi-segment", () => {
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

  test("urlpattern: /foo/:_1*{/}? → optional multi-segment", () => {
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

  test("urlpatterninit: /foo/:id{/}? → named parameter", () => {
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

  test("path-to-regexp-v8: /foo{/:_1}/bar → optional segment in middle", () => {
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
});

// ============================================================================
// IR → PATTERN TESTS (Generation Tests)
// ============================================================================

describe("IR → Pattern (Generation Tests)", () => {
  test("empty params → / for all formats", () => {
    const ir: RouteIR = { pattern: "", params: [] };
    
    expect(toRou3(ir)).toContain("/");
    expect(toPathToRegexpV6(ir)).toBe("/");
    expect(toPathToRegexpV8(ir)).toBe("/");
    expect(toURLPatternInput(ir).pathname).toBe("/{/}?");
  });

  test("single static segment → /foo", () => {
    const ir: RouteIR = {
      pattern: "",
      params: [{ value: "foo", optional: false }],
    };

    expect(toRou3(ir)).toContain("/foo");
    expect(toPathToRegexpV6(ir)).toBe("/foo");
    expect(toPathToRegexpV8(ir)).toBe("/foo");
    expect(toURLPatternInput(ir).pathname).toBe("/foo{/}?");
  });

  test("two static segments → /foo/bar", () => {
    const ir: RouteIR = {
      pattern: "",
      params: [
        { value: "foo", optional: false },
        { value: "bar", optional: false },
      ],
    };

    expect(toRou3(ir)).toContain("/foo/bar");
    expect(toPathToRegexpV6(ir)).toBe("/foo/bar");
    expect(toPathToRegexpV8(ir)).toBe("/foo/bar");
    expect(toURLPatternInput(ir).pathname).toBe("/foo/bar{/}?");
  });

  test("named parameter → /foo/:id", () => {
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

    expect(toRou3(ir)).toContain("/foo/:id");
    expect(toPathToRegexpV6(ir)).toBe("/foo/:id");
    expect(toPathToRegexpV8(ir)).toBe("/foo/:id");
    expect(toURLPatternInput(ir).pathname).toBe("/foo/:id{/}?");
  });

  test("optional single segment → rou3:/foo/*, ptr8:/foo{/:_1}, urlpattern:/foo/:_1?", () => {
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

    const rou3Result = toRou3(ir);
    expect(rou3Result).toContain("/foo/*");

    expect(toPathToRegexpV6(ir)).toBe("/foo/:_1?");
    expect(toPathToRegexpV8(ir)).toBe("/foo{/:_1}");
    expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1?{/}?");
  });

  test("required greedy → rou3:/foo/**:_1, ptr8:/foo/*_1, urlpattern:/foo/:_1+", () => {
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

    const rou3Result = toRou3(ir);
    expect(rou3Result).toContain("/foo/**:_1");

    expect(toPathToRegexpV6(ir)).toBe("/foo/:_1+");
    expect(toPathToRegexpV8(ir)).toBe("/foo/*_1");
    expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1+{/}?");
  });

  test("optional greedy → rou3:/foo/**, ptr8:/foo{/*_1}, urlpattern:/foo/:_1*", () => {
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

    const rou3Result = toRou3(ir);
    expect(rou3Result).toContain("/foo/**");

    expect(toPathToRegexpV6(ir)).toBe("/foo/:_1*");
    expect(toPathToRegexpV8(ir)).toBe("/foo{/*_1}");
    expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1*{/}?");
  });

  test("optional segment in middle → /foo{/:_1}/bar", () => {
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
    expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1?/bar{/}?");
  });

  test("multiple named params → /foo/:foo/bar/:bar", () => {
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

    expect(toRou3(ir)).toContain("/foo/:foo/bar/:bar");
    expect(toPathToRegexpV6(ir)).toBe("/foo/:foo/bar/:bar");
    expect(toPathToRegexpV8(ir)).toBe("/foo/:foo/bar/:bar");
    expect(toURLPatternInput(ir).pathname).toBe("/foo/:foo/bar/:bar{/}?");
  });

  test("regexp generation for named param", () => {
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

    const regexps = toRegexp(ir);
    expect(regexps).toHaveLength(2);
    expect(regexps[0].toString()).toBe("/^\\/foo\\/([^/]+)\\/?$/");
    expect(regexps[1].toString()).toBe("/^\\/foo\\/(?<id>[^/]+)\\/?$/");
  });
});
