import type { URLPattern as URLPatternPolyfill } from "urlpattern-polyfill";

declare global {
  interface URLPattern extends URLPatternPolyfill {}
}
