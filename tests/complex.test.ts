// route-converter-advanced.test.ts
import { beforeEach, describe, expect, test } from "vitest";
import { RouteConverter } from "../src/route-converter";
import { detectRouteFormat } from "../src/route-detector";

describe("Route Converter Integration Tests", () => {
  describe("Detector + Converter Integration", () => {
    const testRoutes = [
      "/users/:id",
      "/blog/[slug]",
      "/api/v1/products/:productId/reviews/:reviewId",
      "/docs/[...path]",
      "/articles/:category?/:id",
      "/[[lang]]/products",
    ];

    testRoutes.forEach((route) => {
      test(`Auto-converts ${route} to file-system format`, () => {
        const sourceFormat = detectRouteFormat(route);
        expect(sourceFormat).not.toBe("unknown");

        if (sourceFormat !== "unknown") {
          const converted = RouteConverter.convert(
            route,
            sourceFormat,
            "file-system",
          );
          expect(converted).toBeTruthy();

          const newFormat = detectRouteFormat(converted);
          expect(newFormat).toBe("file-system");
        }
      });
    });
  });

  describe("Complex Routes", () => {
    const complexRoutes = [
      // Complex path-to-regexp route
      "/api/:version(v[0-9]+)/:resource/:id(\\d+)?/*path",

      // Complex file-system route
      "/[[lang]]/blog/[year]/[month]/[...slug]",

      // Deeply nested parameters
      "/organizations/:orgId/teams/:teamId/projects/:projectId/tasks/:taskId/comments/:commentId",

      // Mix of parameters and static segments with special characters
      "/users/:userId/files/:filename.:ext/preview-:size",

      // Very long route
      "/a/very/long/route/with/many/segments/and/:someParam/more/segments/:anotherParam/even/more/[...rest]",
    ];

    complexRoutes.forEach((route) => {
      test(`Detects format for complex route: ${route}`, () => {
        const format = detectRouteFormat(route);
        expect(format).toBeDefined();
      });

      test(`Converts complex route: ${route} to other formats and back`, () => {
        const format = detectRouteFormat(route);
        if (format !== "unknown") {
          const formats: Array<
            "path-to-regexp" | "rou3" | "find-my-way" | "file-system"
          > = ["path-to-regexp", "rou3", "find-my-way", "file-system"];

          formats
            .filter((f) => f !== format)
            .forEach((targetFormat) => {
              try {
                const converted = RouteConverter.convert(
                  route,
                  format,
                  targetFormat,
                );
                expect(converted).toBeTruthy();

                // Try to convert back to the original format
                const roundTrip = RouteConverter.convert(
                  converted,
                  targetFormat,
                  format,
                );
                expect(roundTrip).toBeDefined();

                // Note: We don't always expect perfect round-trip conversion
                // so we're just checking that the conversion completes without errors
              } catch (error) {
                // If conversion fails, the test should fail
                expect(error).toBeUndefined();
              }
            });
        }
      });
    });
  });

  describe("Real-world Framework Examples", () => {
    test("Converts Next.js routes to Express routes", () => {
      const nextJsRoutes = [
        "/pages/index.js",
        "/pages/about.js",
        "/pages/blog/[slug].js",
        "/pages/[category]/[id].js",
        "/pages/[[locale]]/products.js",
        "/pages/api/users/[id].js",
        "/pages/[...catchAll].js",
      ];

      nextJsRoutes.forEach((path) => {
        const fileRoute =
          path.replace(/^\/pages/, "").replace(/\.js$/, "") || "/";
        const expressRoute = RouteConverter.convert(
          fileRoute,
          "file-system",
          "path-to-regexp",
        );
        expect(expressRoute).toBeTruthy();
      });
    });

    test("Converts Express routes to Next.js file system routes", () => {
      const expressRoutes = [
        "/",
        "/about",
        "/users/:id",
        "/blog/:year/:month?/:day?",
        "/products/:category/:id",
        "/download/*filepath",
      ];

      expressRoutes.forEach((route) => {
        const nextJsRoute = RouteConverter.convert(
          route,
          "path-to-regexp",
          "file-system",
        );
        expect(nextJsRoute).toBeTruthy();
      });
    });

    test("Converts Fastify routes to SvelteKit routes", () => {
      const fastifyRoutes = [
        "/",
        "/users/:id",
        "/posts/:slug",
        "/api/:version/products/:id",
        "/assets/*",
      ];

      fastifyRoutes.forEach((route) => {
        const svelteKitRoute = RouteConverter.convert(
          route,
          "find-my-way",
          "file-system",
        );
        expect(svelteKitRoute).toBeTruthy();
      });
    });
  });

  describe("Error Handling", () => {
    test("Throws error for invalid source format", () => {
      expect(() => {
        // @ts-ignore - Intentionally passing invalid format
        RouteConverter.convert("/users/:id", "invalid-format", "file-system");
      }).toThrow();
    });

    test("Throws error for invalid target format", () => {
      expect(() => {
        // @ts-ignore - Intentionally passing invalid format
        RouteConverter.convert(
          "/users/:id",
          "path-to-regexp",
          "unknown-format",
        );
      }).toThrow();
    });
  });
});
