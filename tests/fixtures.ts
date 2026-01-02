import "urlpattern-polyfill";
export const shouldMatch = Symbol.for("shouldMatch");
export const shouldNotMatch = Symbol.for("shouldNotMatch");

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
    urlpatterninit: { pathname: "/foo{/:_1}?" },
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
    urlpatterninit: { pathname: "/foo/:_1+" },
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
