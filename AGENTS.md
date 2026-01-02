# Agent Instructions for convert-route

## Repository Overview

**convert-route** is a TypeScript library that converts between different route pattern formats including `path-to-regexp` (v6 and v8), `rou3`, Next.js file system routes, URLPattern, and RegExp. The repository is small (~450 lines of TypeScript source code) and follows modern JavaScript/TypeScript practices.

**Key Technologies:**
- **Language:** TypeScript 5.9.3 targeting ES2022
- **Package Manager:** pnpm 10.11.0 (specified in package.json)
- **Build Tool:** tsdown 0.16.6 (rolldown-based bundler)
- **Test Framework:** vitest 3.2.4
- **Linter/Formatter:** Biome 2.3.7
- **Node.js:** Version 20+ (CI tests on 20, 22, 24)
- **Module System:** ESM (type: "module" in package.json)

## Build and Validation Commands

### Prerequisites

**ALWAYS install dependencies first:**
```bash
pnpm install
```

This is **required** before running any other commands. Without `node_modules`, all commands will fail.

### Command Sequence

The following commands work independently (no dependencies between them except for `pnpm install`):

1. **Build** (takes ~1-2 seconds):
   ```bash
   pnpm run build
   ```
   - Compiles TypeScript sources from `src/` to `dist/`
   - Generates both JS and .d.ts files
   - Uses tsdown with config from `tsdown.config.ts`
   - Output directory `dist/` is gitignored
   - **Note:** Tests do NOT require building - they work directly with source files

2. **Lint** (takes <1 second):
   ```bash
   pnpm run lint
   ```
   - Uses Biome to check code quality
   - Configuration: `biome.json`
   - Key rule: `useImportExtensions` requires .js extensions on imports (even for .ts files)

3. **Format** (takes <1 second):
   ```bash
   pnpm run format
   ```
   - Auto-formats code with Biome
   - Writes changes back to files

4. **Test** (takes <1 second):
   ```bash
   pnpm run test
   ```
   - Runs vitest test suite
   - 1114 total tests (1046 active, 68 skipped/legacy failures)
   - Works directly on source files without requiring a build
   - Test files: `tests/index.test.ts` and `tests/fixtures.ts`
   - Includes two-section fixture tests (33 tests) for clear validation

### CI Validation

Two GitHub Actions workflows run on every PR:

**Lint Workflow** (`.github/workflows/lint.yml`):
```bash
pnpm install
pnpm run build
pnpm run lint
```

**Test Workflow** (`.github/workflows/test.yml`):
```bash
pnpm install
pnpm run build
pnpm run test
```

Both workflows run `pnpm run build` before validation. **To replicate CI locally**, run:
```bash
pnpm install && pnpm run build && pnpm run lint && pnpm run test
```

## Project Layout

### Root Files
- `package.json` - Project metadata, scripts, and exports configuration
- `tsconfig.json` - TypeScript compiler configuration (strict mode, ESNext modules)
- `tsdown.config.ts` - Build configuration defining entry points for each adapter
- `biome.json` - Linter and formatter configuration
- `pnpm-lock.yaml` - Lock file for dependencies
- `pnpm-workspace.yaml` - Workspace configuration (single package)
- `.gitignore` - Excludes `node_modules/`, `dist/`, and standard Node.js artifacts

### Source Structure (`src/`)

**Core Types** (`src/types.ts`):
- `RouteIR` - Intermediate representation used for conversion between formats
- `RouteParam` - Represents route parameters with optional/catchAll metadata

**Adapters** (`src/adapters/`):
Each adapter provides `from*` and/or `to*` functions:
- `index.ts` - Re-exports all adapters
- `rou3.ts` - Convert from/to rou3 format
- `path-to-regexp-v6.ts` - Convert from/to path-to-regexp v6 format
- `path-to-regexp-v8.ts` - Convert from/to path-to-regexp v8 format
- `next-fs.ts` - Convert from Next.js file system routes (no toNextFs)
- `regexp.ts` - Convert to RegExp (no fromRegexp)
- `urlpattern.ts` - Convert from/to URLPattern and URLPatternInit formats with dedicated SegmentMapper

**Utilities** (`src/utils/`):
- `mapper.ts` - SegmentMapper for parsing route segments
- `join.ts` - Join route parts handling multiple pattern outputs
- `error.ts` - Error handling utilities

### Test Structure (`tests/`)
- `index.test.ts` - Main test suite with 1114 tests covering all adapters
  - Legacy round-trip conversion tests (~1013 tests)
  - Two-section fixture tests (~33 tests for Pattern→IR and IR→Pattern)
- `fixtures.ts` - Test fixtures, helper functions, and two-section fixture arrays
  - `inputFixtures[]` - Pattern → IR validation (23 fixtures)
  - `outputFixtures[]` - IR → Pattern validation (10 fixtures)
  - `normalizeIR()` - IR normalization helper for consistent comparisons
  - Legacy `routes[]` - Original fixture format (being phased out)

### Distribution

Build outputs to `dist/` with:
- One JS file per adapter (e.g., `dist/rou3.js`)
- Corresponding .d.ts TypeScript declaration files
- Utility modules in `dist/utils/`
- Package exports configured in package.json

## Important Notes

### Code Style Requirements

1. **Import Extensions:** All relative imports MUST include `.js` extension, even for `.ts` files:
   ```typescript
   import { fromRou3 } from "../adapters/rou3.js";  // Correct
   import { fromRou3 } from "../adapters/rou3";     // Will fail lint
   ```

2. **Module System:** ESM only - use `import`/`export`, not `require`

3. **TypeScript:** Strict mode enabled with verbatimModuleSyntax

### Common Pitfalls

1. **Missing node_modules:** Always run `pnpm install` after cloning or cleaning
2. **Wrong package manager:** Must use `pnpm`, not `npm` or `yarn`
3. **Build not required for tests:** Don't assume tests need build output
4. **Import extensions:** Biome will fail if .js extensions are missing on imports

### URLPattern Support

The URLPattern adapter (`src/adapters/urlpattern.ts`) provides conversion between URLPattern/URLPatternInit and the internal RouteIR format, with automatic trailing slash handling.

**Architecture:**
- **Dedicated SegmentMapper:** Custom implementation for URLPattern syntax (not based on path-to-regexp)
- **Direct parsing:** Handles `:param`, `:param?`, `:param+`, `:param*` modifiers natively
- **Trailing slash support:** Automatic `{/}?` suffix by default (opt-out available)

**Key Conversions:**
- path-to-regexp v8 `/*param` ↔ URLPattern `/:param+` (required multi-segment)
- path-to-regexp v8 `{/*param}` ↔ URLPattern `/:param*` (optional multi-segment)
- path-to-regexp v8 `{/:param}` ↔ URLPattern `/:param?` (optional single segment)

**Trailing Slash Handling:**
By default, the adapter appends `{/}?` to patterns to match both with and without trailing slashes, aligning with path-to-regexp v8 behavior:

```typescript
import { toURLPatternInput } from './adapters/urlpattern.js';

// Default: trailing slash support enabled
toURLPatternInput(route);
// → { pathname: "/foo/:id{/}?" } (matches /foo/bar and /foo/bar/)

// Opt-out: no trailing slash support
toURLPatternInput(route, { trailingSlash: false });
// → { pathname: "/foo/:id" } (matches only /foo/bar)
```

**URLPatternOptions Interface:**
```typescript
interface URLPatternOptions {
  trailingSlash?: boolean; // default: true
}
```

**Functions:**
- `fromURLPattern(pattern: URLPattern | URLPatternInit): RouteIR` - Parse URLPattern to IR
- `toURLPattern(route: RouteIR, options?: URLPatternOptions): URLPattern` - Convert IR to URLPattern
- `toURLPatternInput(route: RouteIR, options?: URLPatternOptions): URLPatternInit` - Convert IR to URLPatternInit

**Known Limitations:**
1. **Pathname only:** Only the `pathname` property is supported. Other URLPattern properties (protocol, hostname, port, username, password, search, hash) will throw `ConvertRouteError` if not default values.

2. **RegExp groups:** Patterns with `hasRegExpGroups` are not supported and will throw `ConvertRouteError`.

3. **Trailing slash behavior:** When `trailingSlash: false`, URLPattern behaves per spec (strict matching without trailing slash), which differs from path-to-regexp v8's permissive matching.

**Type Definitions:**
The package includes a global type declaration for URLPattern in `src/urlpattern.d.ts` that extends the `urlpattern-polyfill` types.

**Testing:**
See "Test Fixture Architecture" section below for how URLPattern fixtures are organized.

### Test Fixture Architecture

The test suite uses a **two-section fixture architecture** with all fixtures consolidated inline in a single test file for clarity and maintainability.

**Section 1: Pattern → IR (Input Tests)**
Tests that parsing patterns from each format produces correct normalized IRs:

```typescript
// tests/index.test.ts - Pattern → IR tests (inline)
test("rou3: /foo/:id → named parameter", () => {
  const result = fromRou3("/foo/:id");
  expect(normalizeIR(result.params)).toEqual([
    { value: "foo", optional: false },
    { value: ":id", optional: false, catchAll: { name: "id", greedy: false } }
  ]);
});
```

**Section 2: IR → Pattern (Output Tests)**
Tests that IRs generate correct patterns for each format (one-to-many mapping):

```typescript
// tests/index.test.ts - IR → Pattern tests (inline)
test("optional single segment → rou3:/foo/*, ptr8:/foo{/:_1}", () => {
  const ir: RouteIR = {
    pattern: "",
    params: [
      { value: "foo", optional: false },
      { value: ":_1", optional: true, catchAll: { name: "_1", greedy: false } }
    ]
  };
  
  expect(toRou3(ir)).toContain("/foo/*");
  expect(toPathToRegexpV8(ir)).toBe("/foo{/:_1}");
  expect(toURLPatternInput(ir).pathname).toBe("/foo/:_1?{/}?");
});
```

**IR Normalization:**
The `normalizeIR()` function ensures consistent IR representation:
- `optional` property always present (defaults to `false`)
- Consistent property order: `value`, `optional`, `catchAll`
- CatchAll with consistent order: `name`, `greedy`

This eliminates ambiguity where different parsers produce structurally different but semantically identical IRs.

**Test Organization:**
- Single file: `tests/index.test.ts` (~450 lines, all tests and fixtures consolidated)
- Pattern → IR tests: 23 tests validating parsing
- IR → Pattern tests: 10 tests validating generation (60+ format-specific assertions)
- No separate fixture file - all data inline for clarity

**Benefits:**
- **No indirection:** Fixtures defined where they're used
- **Explicit expectations:** Each test declares the exact expected IR inline
- **Clear failure diagnosis:** Test name and inline data show exactly what failed
- **Easy extension:** Add new tests by copying and modifying inline data
- **Single source:** One file contains all test logic and data
- **Better readability:** See input pattern and expected IR together

### Development Workflow

For code changes:
1. Run `pnpm install` (if starting fresh)
2. Make changes to source files in `src/`
3. Run `pnpm run lint` to check code style
4. Run `pnpm run test` to validate functionality
5. Run `pnpm run build` to verify compilation succeeds
6. Commit changes (never commit `node_modules/` or `dist/`)

## Quick Reference

**Clone to commit workflow:**
```bash
# Setup
pnpm install

# Development cycle
pnpm run lint    # Check code style
pnpm run test    # Run tests (works on source)
pnpm run build   # Compile (if needed)

# Full CI validation
pnpm install && pnpm run build && pnpm run lint && pnpm run test
```

**When to run each command:**
- `pnpm run lint` - After editing any source file
- `pnpm run test` - After changing logic or adding features
- `pnpm run build` - Before committing, to ensure code compiles
- `pnpm run format` - To auto-fix formatting issues

## Trust These Instructions

These instructions have been validated by running all commands successfully. Only search for additional information if you encounter an error not documented here or if these instructions appear incomplete or incorrect for your specific task.
