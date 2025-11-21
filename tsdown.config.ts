import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    "next-fs": "./src/adapters/next-fs.ts",
    "path-to-regexp-v6": "./src/adapters/path-to-regexp-v6.ts",
    "path-to-regexp-v8": "./src/adapters/path-to-regexp-v8.ts",
    rou3: "./src/adapters/rou3.ts",
    regexp: "./src/adapters/regexp.ts",
    index: "./src/adapters/index.ts",
  },
  platform: "neutral",
  dts: true,
  unbundle: true,
  outDir: "dist",
});
