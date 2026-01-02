import "urlpattern-polyfill";
import type { RouteParam } from "../src/types.js";

export const shouldMatch = Symbol.for("shouldMatch");
export const shouldNotMatch = Symbol.for("shouldNotMatch");

// Normalize IR params to ensure consistent optional property and property order
export function normalizeIR(params: RouteParam[]): RouteParam[] {
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

// New fixture types for two-section architecture
export interface InputFixture {
  pattern: string | RegExp | URLPattern | URLPatternInit;
  format: "rou3" | "next-fs" | "path-to-regexp-v6" | "path-to-regexp-v8" | "urlpattern" | "urlpatterninit";
  ir: { params: RouteParam[] }; // Normalized IR
}

export interface OutputFixture {
  ir: { params: RouteParam[] }; // Normalized IR
  outputs: {
    rou3?: string | string[];
    "next-fs"?: string | string[];
    "path-to-regexp-v6"?: string | string[];
    "path-to-regexp-v8"?: string | string[];
    regexp?: RegExp | RegExp[];
    urlpattern?: string | string[] | URLPattern | URLPattern[];
    urlpatterninit?: URLPatternInit | URLPatternInit[];
  };
}

interface MatchTestFixture {
  [shouldMatch]: string[];
  [shouldNotMatch]: string[];
}

// Legacy types (to be removed after migration)
type FixtureRouteValue = string | RegExp | URLPattern | URLPatternInit;
type FixtureInValue = FixtureRouteValue | Route;

export interface FixtureAdapters {
  rou3: FixtureInValue;
  "next-fs"?: FixtureInValue;
  "path-to-regexp-v6": FixtureInValue;
  "path-to-regexp-v8": FixtureInValue;
  regexp: FixtureInValue;
  urlpattern: FixtureInValue;
  urlpatterninit: FixtureInValue;
}

interface WithSymbols {
  [shouldMatch]: string[];
  [shouldNotMatch]: string[];
}

export interface Route {
  in: FixtureRouteValue[];
  out: FixtureRouteValue[][];
}

type ResolvedFixture = {
  [K in keyof FixtureAdapters]: Route;
} & WithSymbols & {
    toString(): string;
  };

export const routes = prepare([
  {
    rou3: "/",
    "next-fs": "/",
    "path-to-regexp-v6": "/",
    "path-to-regexp-v8": "/",
    regexp: /^\/\/?$/,
    urlpattern: new URLPattern({ pathname: "/{/}?" }),
    urlpatterninit: { pathname: "/{/}?" },
    [shouldMatch]: ["/"],
    [shouldNotMatch]: ["/a", "/a/b"],
  },
  {
    rou3: "/foo",
    "next-fs": "/foo",
    "path-to-regexp-v6": "/foo",
    "path-to-regexp-v8": "/foo",
    regexp: /^\/foo\/?$/,
    urlpattern: new URLPattern({ pathname: "/foo{/}?" }),
    urlpatterninit: { pathname: "/foo{/}?" },
    [shouldMatch]: ["/foo"],
    [shouldNotMatch]: ["/a", "/a/b", "/foo/a", "/foo/a/b"],
  },
  {
    rou3: "/foo/bar",
    "next-fs": "/foo/bar",
    "path-to-regexp-v6": "/foo/bar",
    "path-to-regexp-v8": "/foo/bar",
    regexp: /^\/foo\/bar\/?$/,
    urlpattern: new URLPattern({ pathname: "/foo/bar{/}?" }),
    urlpatterninit: { pathname: "/foo/bar{/}?" },
    [shouldMatch]: ["/foo/bar"],
    [shouldNotMatch]: [
      "/a",
      "/a/b",
      "/foo/a",
      "/foo/a/b",
      "/foo/bar/a",
      "/foo/bar/a/b",
    ],
  },
  {
    rou3: "/foo/:id",
    "next-fs": "/foo/[id]",
    "path-to-regexp-v6": "/foo/:id",
    "path-to-regexp-v8": "/foo/:id",
    regexp: /^\/foo\/(?<id>[^/]+)\/?$/,
    urlpattern: new URLPattern({ pathname: "/foo/:id{/}?" }),
    urlpatterninit: { pathname: "/foo/:id{/}?" },
    [shouldMatch]: ["/foo/a", "/foo/b"],
    [shouldNotMatch]: [
      "/a",
      "/a/b",
      "/foo",
      "/foo/",
      "/foo/bar/a",
      "/foo/bar/a/b",
    ],
  },
  {
    rou3: "/foo/:foo/bar/:bar",
    "next-fs": "/foo/[foo]/bar/[bar]",
    "path-to-regexp-v6": "/foo/:foo/bar/:bar",
    "path-to-regexp-v8": "/foo/:foo/bar/:bar",
    regexp: /^\/foo\/(?<foo>[^/]+)\/bar\/(?<bar>[^/]+)\/?$/,
    urlpattern: new URLPattern({ pathname: "/foo/:foo/bar/:bar{/}?" }),
    urlpatterninit: { pathname: "/foo/:foo/bar/:bar{/}?" },
    [shouldMatch]: ["/foo/a/bar/b"],
    [shouldNotMatch]: [
      "/a",
      "/a/b",
      "/foo/a",
      "/foo/a/b",
      "/foo/bar/b",
      "/foo/a/bar/b/c",
      "/foo/a/bar/b/c/d",
    ],
  },
  {
    rou3: "/foo/*",
    "path-to-regexp-v6": "/foo/:_1?",
    "path-to-regexp-v8": "/foo{/:_1}",
    regexp: {
      in: [/^\/foo\/?([^/]*)\/?$/],
      out: [[/^\/foo\/?([^/]*)\/?$/], [/^\/foo\/?(?<_1>[^/]*)\/?$/]],
    },
    urlpattern: new URLPattern({ pathname: "/foo{/:_1}?{/}?" }),
    urlpatterninit: { pathname: "/foo/:_1?{/}?" },
    [shouldMatch]: ["/foo", "/foo/", "/foo/a"],
    [shouldNotMatch]: ["/a", "/a/b", "/foo/a/b", "/foo/a/b/c"],
  },
  {
    rou3: "/foo/**:_1",
    "next-fs": "/foo/[..._1]",
    "path-to-regexp-v6": {
      in: ["/foo/(.+)"],
      out: [["/foo/:_1+"]],
    },
    "path-to-regexp-v8": "/foo/*_1",
    regexp: {
      in: [/^\/foo\/(.+)\/?$/],
      out: [[/^\/foo\/(.+)\/?$/], [/^\/foo\/(?<_1>.+)\/?$/]],
    },
    urlpattern: new URLPattern({ pathname: "/foo/:_1+{/}?" }),
    urlpatterninit: { pathname: "/foo/:_1+{/}?" },
    [shouldMatch]: ["/foo/a", "/foo/b", "/foo/a/b", "/foo/a/b/c"],
    [shouldNotMatch]: ["/a", "/a/b"],
  },
  {
    rou3: "/foo/*",
    "path-to-regexp-v6": {
      in: ["/foo/:foo?"],
      out: [["/foo/:foo?"], ["/foo/:_1?"]],
    },
    "path-to-regexp-v8": {
      in: ["/foo{/:foo}"],
      out: [["/foo{/:foo}"], ["/foo{/:_1}"]],
    },
    regexp: {
      in: [/^\/foo\/?(?<foo>[^/]*)\/?$/],
      out: [[/^\/foo\/?(?<foo>[^/]*)\/?$/], [/^\/foo\/?([^/]*)\/?$/]],
    },
    urlpattern: {
      in: [new URLPattern({ pathname: "/foo{/:foo}?{/}?" })],
      out: [["/foo/:foo?{/}?"], ["/foo/:_1?{/}?"]],
    },
    urlpatterninit: {
      in: [{ pathname: "/foo{/:foo}?{/}?" }],
      out: [[{ pathname: "/foo/:foo?{/}?" }], [{ pathname: "/foo/:_1?{/}?" }]],
    },
    [shouldMatch]: ["/foo", "/foo/", "/foo/a"],
    [shouldNotMatch]: ["/a", "/a/b", "/foo/a/b", "/foo/a/b/c"],
  },
  {
    rou3: "/foo/**",
    "next-fs": "/foo/[[..._1]]",
    "path-to-regexp-v6": "/foo/:_1*",
    "path-to-regexp-v8": "/foo{/*_1}",
    regexp: {
      in: [/^\/foo\/?(?<_1>.*)\/?$/],
      out: [[/^\/foo\/?(?<_1>.*)\/?$/], [/^\/foo\/?(.*)\/?$/]],
    },
    urlpattern: {
      in: [new URLPattern({ pathname: "/foo/:_1*{/}?" })],
      out: [["/foo/:_1*{/}?"]],
    },
    urlpatterninit: {
      in: [{ pathname: "/foo/:_1*{/}?" }],
      out: [[{ pathname: "/foo/:_1*{/}?" }]],
    },
    [shouldMatch]: [
      "/foo",
      "/foo/",
      "/foo/a",
      "/foo/a/",
      "/foo/a/b",
      "/foo/a/b/",
      "/foo/a/b/c/d/e/f",
    ],
    [shouldNotMatch]: ["/a", "/a/b"],
  },
  {
    rou3: "/foo/**:foo",
    "next-fs": "/foo/[...foo]",
    "path-to-regexp-v6": "/foo/:foo+",
    "path-to-regexp-v8": "/foo/*foo",
    regexp: /^\/foo\/(?<foo>.+)\/?$/,
    urlpattern: {
      in: [new URLPattern({ pathname: "/foo/:foo+{/}?" })],
      out: [["/foo/:foo+{/}?"], ["/foo/:_1+{/}?"]],
    },
    urlpatterninit: {
      in: [{ pathname: "/foo/:foo+{/}?" }],
      out: [[{ pathname: "/foo/:foo+{/}?" }], [{ pathname: "/foo/:_1+{/}?" }]],
    },
    [shouldMatch]: [
      "/foo/a",
      "/foo/a/",
      "/foo/a/b",
      "/foo/a/b/",
      "/foo/a/b/c/d/e/f",
    ],
    [shouldNotMatch]: ["/a", "/a/b", "/foo", "/foo/"],
  },
  {
    rou3: {
      in: ["/foo/bar", "/foo/*/bar"],
      out: [
        ["/foo/bar", "/foo/*/bar"],
        ["/foo/bar", "/foo/:_1/bar"],
      ],
    },
    "path-to-regexp-v6": {
      in: ["/foo/:_1?/bar"],
      out: [["/foo/:_1?/bar"], ["/foo/bar", "/foo/:_1/bar"]],
    },
    "path-to-regexp-v8": {
      in: ["/foo{/:_1}/bar"],
      out: [["/foo{/:_1}/bar"], ["/foo/bar", "/foo/:_1/bar"]],
    },
    regexp: {
      in: [/^\/foo\/?(?<_1>[^/]*)\/bar\/?$/],
      out: [
        [/^\/foo\/?(?<_1>[^/]*)\/bar\/?$/],
        [/^\/foo\/bar\/?$/, /^\/foo\/([^/]+)\/bar\/?$/],
      ],
    },
    urlpattern: {
      in: [new URLPattern({ pathname: "/foo{/:_1}?/bar{/}?" })],
      out: [["/foo/:_1?/bar{/}?"], ["/foo/bar{/}?", "/foo/:_1/bar{/}?"]],
    },
    urlpatterninit: {
      in: [{ pathname: "/foo{/:_1}?/bar{/}?" }],
      out: [[{ pathname: "/foo/:_1?/bar{/}?" }], ["/foo/bar{/}?", "/foo/:_1/bar{/}?"]],
    },
    [shouldMatch]: ["/foo/bar", "/foo/bar/", "/foo/a/bar", "/foo/a/bar/"],
    [shouldNotMatch]: [
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
    rou3: {
      in: ["/foo/bar/**:rest", "/foo/*/bar/**:rest"],
      out: [
        ["/foo/bar/**:rest", "/foo/*/bar/**:rest"],
        ["/foo/bar/**:rest", "/foo/:_1/bar/**:rest"],
      ],
    },
    "path-to-regexp-v6": {
      in: ["/foo/:_1?/bar/:rest+"],
      out: [
        ["/foo/:_1?/bar/:rest+"],
        ["/foo/bar/:rest+", "/foo/:_1/bar/:rest+"],
      ],
    },
    "path-to-regexp-v8": {
      in: ["/foo{/:_1}/bar/*rest"],
      out: [["/foo{/:_1}/bar/*rest"], ["/foo/bar/*rest", "/foo/:_1/bar/*rest"]],
    },
    regexp: {
      in: [/^\/foo\/?(?<_1>[^/]*)\/bar\/(?<rest>.+)\/?$/],
      out: [
        [/^\/foo\/?(?<_1>[^/]*)\/bar\/(?<rest>.+)\/?$/],
        [
          /^\/foo\/bar\/(?<rest>.+)\/?$/,
          /^\/foo\/([^/]+)\/bar\/(?<rest>.+)\/?$/,
        ],
      ],
    },
    urlpattern: {
      in: [new URLPattern({ pathname: "/foo{/:_1}?/bar/:rest+{/}?" })],
      out: [
        ["/foo/:_1?/bar/:rest+{/}?"],
        ["/foo/bar/:rest+{/}?", "/foo/:_1/bar/:rest+{/}?"],
      ],
    },
    urlpatterninit: {
      in: [{ pathname: "/foo{/:_1}?/bar/:rest+{/}?" }],
      out: [
        [{ pathname: "/foo/:_1?/bar/:rest+{/}?" }],
        ["/foo/bar/:rest+{/}?", "/foo/:_1/bar/:rest+{/}?"],
      ],
    },
    [shouldMatch]: [
      "/foo/bar/a",
      "/foo/bar/a/b/c",
      "/foo/a/bar/a",
      "/foo/a/bar/a/b/c",
    ],
    [shouldNotMatch]: [
      "/a",
      "/a/b",
      "/foo/a/b",
      "/foo/a/b/c",
      "/foo/bar",
      "/foo/bar/",
      "/foo/a/bar",
      "/foo/a/bar/",
      "/foo/a/b/bar/c",
    ],
  },
]);

function prepare(
  fixtures: (FixtureAdapters & WithSymbols)[],
): ResolvedFixture[] {
  return fixtures.map((fixture) => {
    const entries = Object.entries(fixture).map(
      ([key, value]: [string, FixtureInValue]) => {
        let route: Route;
        if (typeof value === "string") {
          route = {
            in: [value],
            out: [[value]],
          };
        } else if (value instanceof RegExp) {
          route = {
            in: [value],
            out: [[value]],
          };
        } else if (value instanceof URLPattern) {
          route = {
            in: [value],
            out: [[value.pathname]],
          };
        } else if (
          typeof value === "object" &&
          value !== null &&
          "pathname" in value &&
          !("in" in value)
        ) {
          route = {
            in: [value as any],
            out: [[value as any]],
          };
        } else {
          route = value as Route;
        }

        return [key, route] as const;
      },
    );

    const resolvedFixture = Object.fromEntries(
      entries,
    ) as unknown as ResolvedFixture;

    resolvedFixture[shouldMatch] = fixture[shouldMatch];
    resolvedFixture[shouldNotMatch] = fixture[shouldNotMatch];
    Object.defineProperty(resolvedFixture, "toString", {
      enumerable: false,
      configurable: false,
      value: function () {
        return this.rou3.in.join(",");
      },
    });

    return resolvedFixture;
  });
}

// ============================================================================
// NEW TWO-SECTION FIXTURE SYSTEM
// ============================================================================

// Section 1: Pattern → IR (Input Fixtures)
// Tests that parsing patterns from each format produces correct normalized IRs
export const inputFixtures: InputFixture[] = [
  // Root path "/"
  {
    pattern: "/",
    format: "rou3",
    ir: { params: [] },
  },
  {
    pattern: "/",
    format: "path-to-regexp-v8",
    ir: { params: [] },
  },
  {
    pattern: "/",
    format: "path-to-regexp-v6",
    ir: { params: [] },
  },
  
  // Simple static path "/foo"
  {
    pattern: "/foo",
    format: "rou3",
    ir: {
      params: [
        { value: "foo", optional: false },
      ],
    },
  },
  {
    pattern: "/foo",
    format: "path-to-regexp-v8",
    ir: {
      params: [
        { value: "foo", optional: false },
      ],
    },
  },
  
  // Named parameter "/foo/:id"
  {
    pattern: "/foo/:id",
    format: "rou3",
    ir: {
      params: [
        { value: "foo", optional: false },
        { 
          value: ":id", 
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ],
    },
  },
  {
    pattern: "/foo/:id",
    format: "path-to-regexp-v8",
    ir: {
      params: [
        { value: "foo", optional: false },
        { 
          value: ":id", 
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ],
    },
  },
];

// Section 2: IR → Pattern (Output Fixtures)
// Tests that IRs generate correct patterns for each format
export const outputFixtures: OutputFixture[] = [
  // Root path
  {
    ir: { params: [] },
    outputs: {
      rou3: "/",
      "path-to-regexp-v8": "/",
      "path-to-regexp-v6": "/",
      regexp: /^\/\/?$/,
      urlpattern: "/{/}?",
      urlpatterninit: { pathname: "/{/}?" },
    },
  },
  
  // Simple static path "/foo"
  {
    ir: {
      params: [
        { value: "foo", optional: false },
      ],
    },
    outputs: {
      rou3: "/foo",
      "path-to-regexp-v8": "/foo",
      "path-to-regexp-v6": "/foo",
      regexp: /^\/foo\/?$/,
      urlpattern: "/foo{/}?",
      urlpatterninit: { pathname: "/foo{/}?" },
    },
  },
  
  // Named parameter "/foo/:id"
  {
    ir: {
      params: [
        { value: "foo", optional: false },
        { 
          value: ":id", 
          optional: false,
          catchAll: { name: "id", greedy: false },
        },
      ],
    },
    outputs: {
      rou3: "/foo/:id",
      "path-to-regexp-v8": "/foo/:id",
      "path-to-regexp-v6": "/foo/:id",
      regexp: /^\/foo\/(?<id>[^/]+)\/?$/,
      urlpattern: "/foo/:id{/}?",
      urlpatterninit: { pathname: "/foo/:id{/}?" },
    },
  },
];

// Match test fixtures (shared between old and new systems)
export const matchTestFixtures: MatchTestFixture[] = [
  {
    [shouldMatch]: ["/"],
    [shouldNotMatch]: ["/a", "/a/b"],
  },
  {
    [shouldMatch]: ["/foo"],
    [shouldNotMatch]: ["/a", "/a/b", "/foo/a", "/foo/a/b"],
  },
  {
    [shouldMatch]: ["/foo/a", "/foo/b"],
    [shouldNotMatch]: ["/a", "/a/b", "/foo", "/foo/", "/foo/bar/a", "/foo/bar/a/b"],
  },
];
