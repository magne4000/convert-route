export const shouldMatch = Symbol.for("shouldMatch");

type FixtureInValue = string | Route;

interface FixtureAdapters {
  rou3: FixtureInValue;
  "next-fs"?: FixtureInValue;
  "path-to-regexp-v6": FixtureInValue;
  "path-to-regexp-v8": FixtureInValue;
}

interface WithSymbols {
  [shouldMatch]: string[];
}

export interface Route {
  in: string[];
  out: string[][];
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
    [shouldMatch]: ["/"],
  },
  {
    rou3: "/foo",
    "next-fs": "/foo",
    "path-to-regexp-v6": "/foo",
    "path-to-regexp-v8": "/foo",
    [shouldMatch]: ["/foo"],
  },
  {
    rou3: "/foo/bar",
    "next-fs": "/foo/bar",
    "path-to-regexp-v6": "/foo/bar",
    "path-to-regexp-v8": "/foo/bar",
    [shouldMatch]: ["/foo/bar"],
  },
  {
    rou3: "/foo/:id",
    "next-fs": "/foo/[id]",
    "path-to-regexp-v6": "/foo/:id",
    "path-to-regexp-v8": "/foo/:id",
    [shouldMatch]: ["/foo/a", "/foo/b"],
  },
  {
    rou3: "/foo/:foo/bar/:bar",
    "next-fs": "/foo/[foo]/bar/[bar]",
    "path-to-regexp-v6": "/foo/:foo/bar/:bar",
    "path-to-regexp-v8": "/foo/:foo/bar/:bar",
    [shouldMatch]: ["/foo/a/bar/b"],
  },
  {
    rou3: "/foo/*",
    "path-to-regexp-v6": "/foo/:_1?",
    "path-to-regexp-v8": "/foo{/:_1}",
    [shouldMatch]: ["/foo", "/foo/", "/foo/a"],
  },
  {
    rou3: "/foo/:_1",
    "next-fs": "/foo/[_1]",
    "path-to-regexp-v6": {
      in: ["/foo/(.+)"],
      out: [["/foo/:_1"]],
    },
    "path-to-regexp-v8": "/foo/:_1",
    [shouldMatch]: ["/foo/a", "/foo/b"],
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
    [shouldMatch]: ["/foo", "/foo/", "/foo/a"],
  },
  {
    rou3: "/foo/**",
    "next-fs": "/foo/[[..._1]]",
    "path-to-regexp-v6": "/foo/:_1*",
    "path-to-regexp-v8": "/foo{/*_1}",
    [shouldMatch]: [
      "/foo",
      "/foo/",
      "/foo/a",
      "/foo/a/",
      "/foo/a/b",
      "/foo/a/b/",
      "/foo/a/b/c/d/e/f",
    ],
  },
  {
    rou3: "/foo/**:foo",
    "next-fs": "/foo/[...foo]",
    "path-to-regexp-v6": "/foo/:foo+",
    "path-to-regexp-v8": "/foo/*foo",
    [shouldMatch]: [
      "/foo/a",
      "/foo/a/",
      "/foo/a/b",
      "/foo/a/b/",
      "/foo/a/b/c/d/e/f",
    ],
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
    [shouldMatch]: ["/foo/bar", "/foo/bar/", "/foo/a/bar", "/foo/a/bar/"],
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
    [shouldMatch]: [
      "/foo/bar/a",
      "/foo/bar/a/b/c",
      "/foo/a/bar/a",
      "/foo/a/bar/a/b/c",
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
        } else {
          route = value;
        }

        return [key, route] as const;
      },
    );

    const resolvedFixture = Object.fromEntries(
      entries,
    ) as unknown as ResolvedFixture;

    resolvedFixture[shouldMatch] = fixture[shouldMatch];
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
