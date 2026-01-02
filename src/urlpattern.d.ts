declare global {
  import type { URLPattern as URLPatternPolyfill } from "urlpattern-polyfill";

  interface URLPattern extends URLPatternPolyfill {}
}
