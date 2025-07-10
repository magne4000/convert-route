// route-converter.test.ts
import { describe, expect, test } from "vitest";
import { RouteConverter } from "../src/route-converter";

describe("RouteConverter", () => {
  // Helper function to run a test case and check the result
  function testConversion(
    path: string,
    fromFormat: "path-to-regexp" | "rou3" | "find-my-way" | "file-system",
    toFormat: "path-to-regexp" | "rou3" | "find-my-way" | "file-system",
    expected: string,
  ) {
    const result = RouteConverter.convert(path, fromFormat, toFormat);
    expect(result).toBe(expected);
  }

  describe("Basic Routes", () => {
    test("Static route conversion", () => {
      testConversion(
        "/users/profile",
        "path-to-regexp",
        "file-system",
        "/users/profile",
      );
    });

    test("Multiple static segments", () => {
      testConversion(
        "/api/v1/users/settings",
        "rou3",
        "find-my-way",
        "/api/v1/users/settings",
      );
    });
  });

  describe("Named Parameters", () => {
    test("Basic named parameter - path-to-regexp to file-system", () => {
      testConversion(
        "/users/:id",
        "path-to-regexp",
        "file-system",
        "/users/[id]",
      );
    });

    test("Basic named parameter - file-system to path-to-regexp", () => {
      testConversion(
        "/users/[id]",
        "file-system",
        "path-to-regexp",
        "/users/:id",
      );
    });

    test("Basic named parameter - file-system to rou3", () => {
      testConversion("/posts/[slug]", "file-system", "rou3", "/posts/:slug");
    });

    test("Basic named parameter - find-my-way to file-system", () => {
      testConversion(
        "/orders/:orderId",
        "find-my-way",
        "file-system",
        "/orders/[orderId]",
      );
    });

    test("Multiple named parameters - path-to-regexp to file-system", () => {
      testConversion(
        "/users/:userId/posts/:postId",
        "path-to-regexp",
        "file-system",
        "/users/[userId]/posts/[postId]",
      );
    });

    test("Multiple named parameters - file-system to find-my-way", () => {
      testConversion(
        "/users/[userId]/posts/[postId]/comments/[commentId]",
        "file-system",
        "find-my-way",
        "/users/:userId/posts/:postId/comments/:commentId",
      );
    });
  });

  describe("Optional Parameters", () => {
    test("Optional parameter - path-to-regexp to file-system", () => {
      testConversion(
        "/users/:userId?",
        "path-to-regexp",
        "file-system",
        "/users/[[userId]]",
      );
    });

    test("Optional parameter - file-system to path-to-regexp", () => {
      testConversion(
        "/users/[[userId]]",
        "file-system",
        "path-to-regexp",
        "/users/:userId?",
      );
    });

    test("Multiple optional parameters - path-to-regexp to file-system", () => {
      testConversion(
        "/blog/:year?/:month?/:day?",
        "path-to-regexp",
        "file-system",
        "/blog/[[year]]/[[month]]/[[day]]",
      );
    });

    // Note: rou3 and find-my-way don't natively support optional parameters
    // the same way, but our converter tries to handle them reasonably
    test("Optional parameter - path-to-regexp to rou3", () => {
      testConversion(
        "/users/:userId?",
        "path-to-regexp",
        "rou3",
        "/users/:userId",
      );
    });
  });

  describe("Catch-all / Wildcard Parameters", () => {
    test("Catch-all parameter - path-to-regexp to file-system", () => {
      testConversion(
        "/docs/*path",
        "path-to-regexp",
        "file-system",
        "/docs/[...path]",
      );
    });

    test("Catch-all parameter - file-system to path-to-regexp", () => {
      testConversion(
        "/docs/[...path]",
        "file-system",
        "path-to-regexp",
        "/docs/*path",
      );
    });

    test("Catch-all parameter - file-system to rou3", () => {
      testConversion(
        "/assets/[...filepath]",
        "file-system",
        "rou3",
        "/assets/*",
      );
    });

    test("Catch-all parameter - rou3 to file-system", () => {
      testConversion(
        "/assets/*",
        "rou3",
        "file-system",
        "/assets/[...catchAll]",
      );
    });

    test("Catch-all parameter - find-my-way to path-to-regexp", () => {
      testConversion(
        "/wildcard/*",
        "find-my-way",
        "path-to-regexp",
        "/wildcard/*wildcard",
      );
    });
  });

  describe("Mixed Parameter Types", () => {
    test("Mixed parameters - path-to-regexp to file-system", () => {
      testConversion(
        "/users/:userId/posts/*postPath",
        "path-to-regexp",
        "file-system",
        "/users/[userId]/posts/[...postPath]",
      );
    });

    test("Mixed parameters - file-system to path-to-regexp", () => {
      testConversion(
        "/blog/[category]/[...slug]",
        "file-system",
        "path-to-regexp",
        "/blog/:category/*slug",
      );
    });

    test("Complex mixed parameters - path-to-regexp to file-system", () => {
      testConversion(
        "/api/:version/users/:userId?/posts/*rest",
        "path-to-regexp",
        "file-system",
        "/api/[version]/users/[[userId]]/posts/[...rest]",
      );
    });
  });

  describe("Path-to-regexp specific features", () => {
    test("Parameter with pattern constraints - maintain in path-to-regexp", () => {
      testConversion(
        "/users/:id(\\d+)",
        "path-to-regexp",
        "path-to-regexp",
        "/users/:id(\\d+)",
      );
    });

    // This test might lose the regex pattern constraint when converting to other formats
    test("Parameter with pattern constraints - to file-system (pattern will be lost)", () => {
      testConversion(
        "/users/:id(\\d+)",
        "path-to-regexp",
        "file-system",
        "/users/[id]",
      );
    });
  });

  describe("Round-trip Conversions", () => {
    // Test that converting from A→B→A preserves the original format
    test("Round-trip: path-to-regexp → file-system → path-to-regexp", () => {
      const originalPath = "/users/:id/posts/:slug?/*rest";
      const intermediate = RouteConverter.convert(
        originalPath,
        "path-to-regexp",
        "file-system",
      );
      const roundTrip = RouteConverter.convert(
        intermediate,
        "file-system",
        "path-to-regexp",
      );
      expect(roundTrip).toBe(originalPath);
    });
  });

  describe("Edge Cases", () => {
    test("Empty path", () => {
      testConversion("", "path-to-regexp", "file-system", "");
    });

    test("Root path", () => {
      testConversion("/", "rou3", "path-to-regexp", "/");
    });

    test("Path with special characters", () => {
      testConversion(
        "/user-settings/preferences.json",
        "file-system",
        "find-my-way",
        "/user-settings/preferences.json",
      );
    });

    // Parameters at root level
    test("Parameter at root level - path-to-regexp to file-system", () => {
      testConversion("/:page", "path-to-regexp", "file-system", "/[page]");
    });

    // Parameters with similar names
    test("Parameters with similar names", () => {
      testConversion(
        "/users/:userId/user-posts/:postId",
        "path-to-regexp",
        "file-system",
        "/users/[userId]/user-posts/[postId]",
      );
    });

    // Special case for index routes
    test("Index route with optional parameter", () => {
      testConversion("/[:locale]", "file-system", "path-to-regexp", "/:locale");
    });
  });

  describe("Batch Conversions", () => {
    test("Converting file paths to path-to-regexp format", () => {
      const filePaths = [
        "/pages/index.js",
        "/pages/about.js",
        "/pages/blog/[slug].js",
        "/pages/[...catchAll].js",
      ];

      const expectedConversions = [
        { path: "/pages/index.js", expected: "/" },
        { path: "/pages/about.js", expected: "/about" },
        { path: "/pages/blog/[slug].js", expected: "/blog/:slug" },
        { path: "/pages/[...catchAll].js", expected: "/*catchAll" },
      ];

      expectedConversions.forEach(({ path, expected }) => {
        // Strip the file extension and '/pages' prefix to get the route
        const fileRoute =
          path.replace(/^\/pages/, "").replace(/\.js$/, "") || "/";
        const apiRoute = RouteConverter.convert(
          fileRoute,
          "file-system",
          "path-to-regexp",
        );
        expect(apiRoute).toBe(expected);
      });
    });
  });
});
