interface Fixture {
  key: string;
  rou3: string | string[];
  fs: string | string[];
  "path-to-regexp-v6": string | string[];
  "path-to-regexp-v8": string | string[];
}

export const routes = withKey([
  {
    rou3: "/",
    fs: "/",
    "path-to-regexp-v6": "/",
    "path-to-regexp-v8": "/",
  },
  {
    rou3: "/foo",
    fs: "/foo",
    "path-to-regexp-v6": "/foo",
    "path-to-regexp-v8": "/foo",
  },
  {
    rou3: "/foo/bar",
    fs: "/foo/bar",
    "path-to-regexp-v6": "/foo/bar",
    "path-to-regexp-v8": "/foo/bar",
  },
  {
    rou3: "/foo/:id",
    fs: "/foo/[id]",
    "path-to-regexp-v6": "/foo/:id",
    "path-to-regexp-v8": "/foo/:id",
  },
  {
    rou3: "/foo/:foo/bar/:bar",
    fs: "/foo/[foo]/bar/[bar]",
    "path-to-regexp-v6": "/foo/:foo/bar/:bar",
    "path-to-regexp-v8": "/foo/:foo/bar/:bar",
  },
  {
    // When an array is provided, we use index [0] for test cases.
    // However, when converting routes from other formats, any element in the array can be matched.
    rou3: ["/foo/*", "/foo/*:_1"],
    fs: "/foo/[[_1]]",
    "path-to-regexp-v6": ["/foo/(.*)", "/foo/:_1?"],
    "path-to-regexp-v8": "/foo{/:_1}",
  },
  {
    rou3: "/foo/:_1",
    fs: "/foo/[_1]",
    "path-to-regexp-v6": ["/foo/(.+)", "/foo/:_1"],
    "path-to-regexp-v8": "/foo/:_1",
  },
  {
    rou3: "/foo/*:foo",
    fs: "/foo/[[foo]]",
    "path-to-regexp-v6": "/foo/:foo?",
    "path-to-regexp-v8": "/foo{/:foo}",
  },
  {
    rou3: ["/foo/**", "/foo/**:_1"],
    fs: "/foo/[[..._1]]",
    "path-to-regexp-v6": "/foo/:_1*",
    "path-to-regexp-v8": "/foo{/*_1}",
  },
  {
    rou3: "/foo/**:foo",
    fs: "/foo/[[...foo]]",
    "path-to-regexp-v6": "/foo/:foo*",
    "path-to-regexp-v8": "/foo{/*foo}",
  },
  {
    rou3: "/foo/*:foo/bar/**:rest",
    fs: "/foo/[[foo]]/bar/[[...rest]]",
    "path-to-regexp-v6": "/foo/:foo?/bar/:rest*",
    "path-to-regexp-v8": "/foo{/:foo}/bar{/*rest}",
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
