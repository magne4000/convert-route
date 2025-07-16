# convert-route

Convert between `path-to-regexp`, `rou3`, `next.js`, etc. route patterns.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Supported Features](#supported-features)
  - [rou3](#rou3)
  - [Next.js](#nextjs)
  - [path-to-regexp v6](#path-to-regexp-v6)
  - [path-to-regexp v8](#path-to-regexp-v8)


## Installation

```sh
npm install convert-route
# or
yarn add convert-route
# or
pnpm add convert-route
```

## Usage

```ts
import { fromPathToRegexpV8 } from 'convert-route/path-to-regexp-v8';
import { toRou3 } from 'convert-route/rou3';

// Convert from Next.js format to rou3 format
const rou3Pattern = toRou3(fromPathToRegexpV8('/users/*id'));
console.log(rou3Pattern); // '/users/**:id'
```

## Supported Features

| Feature              | Next.js        | rou3         | path-to-regexp v6 | path-to-regexp v8 |
|----------------------|----------------|--------------|-------------------|-------------------|
| Named Segments       | `[param]`      | `:param`     | `:param`          | `:param`          |
| Optional Segments    | No             | `*`          | `:param?`         | `{/:param}`       |
| Catch-all (Wildcard) | `[...param]`   | `**:param`   | `:param+`         | `*param`          |
| Optional Catch-all   | `[[...param]]` | `**`         | `:param*`         | `{/*param}`       |
| Custom Regex         | No             | No           | No                | No                |
| Suffix Matching      | No             | WIP          | WIP               | WIP               |
| Prefix Matching      | No             | WIP          | WIP               | WIP               |

### rou3

```ts
import { fromRou3, toRou3 } from 'convert-route/rou3';
```

### Next.js

```ts
import { fromNextFs } from 'convert-route/next-fs';
```

> [!NOTE]  
> There is no `toNextFs` function. If you have a need for such helper, please open an issue.

### path-to-regexp v6

```ts
import { fromPathToRegexpV6, toPathToRegexpV6 } from 'convert-route/path-to-regexp-v6';
```

### path-to-regexp v8

```ts
import { fromPathToRegexpV8, toPathToRegexpV8 } from 'convert-route/path-to-regexp-v8';
```
