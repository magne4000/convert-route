import { describe, expect, test } from "vitest";
import { fromFs, toFs } from "../src/adapters/fs.js";
import { fromRou3, toRou3 } from "../src/adapters/rou3.js";
import { routes } from "./fixtures.js";

function from(name: string) {
  switch (name) {
    case "rou3":
      return fromRou3;
    case "fs":
      return fromFs;
    default:
      throw new Error(`Unknown adapter: ${name}`);
  }
}

function to(name: string) {
  switch (name) {
    case "rou3":
      return toRou3;
    case "fs":
      return toFs;
    default:
      throw new Error(`Unknown adapter: ${name}`);
  }
}

describe.for(routes)("$key", (fixture) => {
  const entries = Object.entries(fixture) as [string, string | string[]][];

  describe.for(entries)("$0", ([name1, route1]) => {
    const ir1 = from(name1)(typeof route1 === "string" ? route1 : route1[0]);

    test.for(entries)("$0", ([name2, route2]) => {
      // route1 to route2
      if (Array.isArray(route2)) {
        expect(to(name2)(ir1)).oneOf(route2);
      } else {
        expect(to(name2)(ir1)).toBe(route2);
      }
    });
  });
});
