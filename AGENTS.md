# Agent Instructions for convert-route

## Repository Overview

**convert-route** is a TypeScript library that converts between different route pattern formats including `path-to-regexp` (v6 and v8), `rou3`, Next.js file system routes, and RegExp. The repository is small (~380 lines of TypeScript source code) and follows modern JavaScript/TypeScript practices.

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
   - 643 total tests (611 active, 32 skipped)
   - Works directly on source files without requiring a build
   - Test files: `tests/index.test.ts` and `tests/fixtures.ts`

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

**Utilities** (`src/utils/`):
- `mapper.ts` - SegmentMapper for parsing route segments
- `join.ts` - Join route parts handling multiple pattern outputs
- `error.ts` - Error handling utilities

### Test Structure (`tests/`)
- `index.test.ts` - Main test suite with 643 tests covering all adapters
- `fixtures.ts` - Test fixtures and helper functions

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
