interface Fixture {
  key: string;
  rou3: string | string[];
  fs: string | string[];
}

export const routes = withKey([
  {
    rou3: "/",
    fs: "/",
  },
  {
    rou3: "/foo",
    fs: "/foo",
  },
  {
    rou3: "/foo/bar",
    fs: "/foo/bar",
  },
  {
    rou3: "/foo/:id",
    fs: "/foo/[id]",
  },
  {
    rou3: "/foo/:id",
    fs: "/foo/[id]",
  },
  {
    rou3: "/foo/:foo/bar/:bar",
    fs: "/foo/[foo]/bar/[bar]",
  },
  {
    // When an array is provided, we use index [0] for test cases.
    // However, when converting routes from other formats, any element in the array can be matched.
    rou3: ["/foo/*", "/foo/*:_1"],
    fs: "/foo/[[_1]]",
  },
  {
    rou3: "/foo/*:foo",
    fs: "/foo/[[foo]]",
  },
  {
    rou3: ["/foo/**", "/foo/**:_1"],
    fs: "/foo/[[..._1]]",
  },
  {
    rou3: "/foo/**:foo",
    fs: "/foo/[[...foo]]",
  },
]);

function withKey(fixtures: Omit<Fixture, "key">[]) {
  for (const f of fixtures) {
    Object.defineProperty(f, "key", {
      enumerable: false,
      configurable: false,
      get() {
        return Array.isArray(f.rou3) ? f.rou3[0] : f.rou3;
      },
    });
  }

  return fixtures;
}
