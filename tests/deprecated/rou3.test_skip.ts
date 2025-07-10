import { describe, expect, test } from 'vitest';
import { addRoute, createRouter, findRoute } from "rou3";

describe('rou3', () => {

  test('Static route conversion', () => {
    const router = createRouter();

    addRoute(router, "GET", "/path", {payload: "this path"});
    addRoute(router, "POST", "/path/:name", {payload: "named route"});
    addRoute(router, "GET", "/path/foo/*", {payload: "foo"});

    expect(findRoute(router, "GET", "/path/foo")).toEqual({
      "data": {
        "payload": "foo",
      },
      "params": {
        "_0": undefined,
      },
    })

    expect(findRoute(router, "GET", "/path/foo/guy")).toEqual({
      "data": {
        "payload": "foo",
      },
      "params": {
        "_0": "guy",
      },
    })

    expect(findRoute(router, "GET", "/path/foo/guy/guy")).toBeUndefined();
  });
})
