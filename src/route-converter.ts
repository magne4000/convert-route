// route-converter.ts
type RouteParam = {
  name?: string;
  optional?: boolean;
  catchAll?: boolean;
  greedy?: boolean;
};

// Intermediary representation of a route
export type RouteIR = {
  pattern: string;      // Original pattern as provided
  params: RouteParam[]; // Named parameters
};

// Main converter class
export class RouteConverter {
  /**
   * Converts path-to-regexp format to intermediate representation
   * @param path Path pattern like '/users/:id' or '/posts/:title(\w+)'
   */
  static fromPathToRegexp(path: string): RouteIR {
    const params: RouteParam[] = [];

    // Extract named parameters
    const paramRegex = /:([a-zA-Z0-9_]+)(\??)(\([^)]*\))?|\*([a-zA-Z0-9_]*)/g;
    let match;

    while ((match = paramRegex.exec(path)) !== null) {
      const [fullMatch, name, optional, constraint, catchAllName] = match;

      if (fullMatch.startsWith('*')) {
        // Catch-all parameter
        params.push({
          name: catchAllName || 'catchAll',
          optional: false,
          catchAll: true
        });
      } else {
        // Named parameter
        params.push({
          name: name,
          optional: optional === '?',
          catchAll: false
        });
      }
    }

    return {
      pattern: path,
      params
    };
  }

  /**
   * Converts rou3/radix3 format to intermediate representation
   * @param path Path pattern like '/users/:id' or '/posts/:title' or '/optional/:param/*'
   */
  static fromRou3(path: string): RouteIR {
    const params: RouteParam[] = [];

    // Extract named parameters and check for trailing '/*' pattern for optional params
    const paramRegex = /:([a-zA-Z0-9_]+)(?:\/\*)?|\*([a-zA-Z0-9_]*)/g;
    let match;
    let processedPath = path;

    while ((match = paramRegex.exec(path)) !== null) {
      const [fullMatch, name, catchAllName] = match;

      if (fullMatch.startsWith('*')) {
        // Catch-all parameter
        params.push({
          name: catchAllName || 'catchAll',
          optional: false,
          catchAll: true
        });
      } else {
        // Check if this parameter has the optional '/*' suffix
        const isOptional = path.includes(`${fullMatch}/*`);

        // Named parameter
        params.push({
          name: name,
          optional: isOptional,
          catchAll: false
        });

        // Remove the '/*' suffix from the processed path for regex matching if it exists
        if (isOptional) {
          processedPath = processedPath.replace(`${fullMatch}/*`, fullMatch);
        }
      }
    }

    return {
      pattern: path,
      params
    };
  }

  /**
   * Converts find-my-way format to intermediate representation
   * @param path Path pattern like '/users/:id' or '/posts/:title'
   */
  static fromFindMyWay(path: string): RouteIR {
    const params: RouteParam[] = [];

    // Extract named parameters - find-my-way uses :name and *
    const paramRegex = /:([a-zA-Z0-9_]+)|\*([a-zA-Z0-9_]*)/g;
    let match;

    while ((match = paramRegex.exec(path)) !== null) {
      const [fullMatch, name, catchAllName] = match;

      if (fullMatch.startsWith('*')) {
        // Catch-all parameter
        params.push({
          name: catchAllName || 'wildcard',
          optional: false,
          catchAll: true
        });
      } else {
        // Named parameter
        params.push({
          name: name,
          optional: false,
          catchAll: false
        });
      }
    }

    return {
      pattern: path,
      params
    };
  }

  /**
   * Converts file system route format to intermediate representation
   * @param path Path pattern like '/blog/[slug]' or '/docs/[...catchAll]'
   */
  static fromFileSystemRoute(path: string): RouteIR {
    const params: RouteParam[] = [];

    // Extract named parameters
    const paramRegex = /\[{1,2}([a-zA-Z0-9_]+)\]{1,2}|\[\.\.\.([a-zA-Z0-9_]+)\]/g;
    let normalizedPath = path;
    let match;

    while ((match = paramRegex.exec(path)) !== null) {
      const [fullMatch, name, catchAllName] = match;

      if (fullMatch.startsWith('[...')) {
        // Catch-all parameter
        params.push({
          name: catchAllName,
          optional: false,
          catchAll: true
        });

        // Replace in normalized path
        normalizedPath = normalizedPath.replace(fullMatch, '*');
      } else if (fullMatch.startsWith('[[')) {
        // Optional parameter
        params.push({
          name: name,
          optional: true,
          catchAll: false
        });

        // Replace in normalized path
        normalizedPath = normalizedPath.replace(fullMatch, `:${name}?`);
      } else {
        // Regular parameter
        params.push({
          name: name,
          optional: false,
          catchAll: false
        });

        // Replace in normalized path
        normalizedPath = normalizedPath.replace(fullMatch, `:${name}`);
      }
    }

    return {
      pattern: path,
      params,
    };
  }

  /**
   * Converts intermediate representation to path-to-regexp format
   */
  static toPathToRegexp(route: RouteIR): string {
    let result = route.pattern;

    // If it's already in path-to-regexp format, return as is
    if (result.includes(':') && !result.includes('[')) {
      return result;
    }

    // Convert from other formats to path-to-regexp
    for (const param of route.params) {
      if (param.catchAll) {
        // Replace catch-all syntax with path-to-regexp syntax
        if (result.includes('[...')) {
          result = result.replace(`[...${param.name}]`, `*${param.name}`);
        } else if (result.includes('*')) {
          // Already in correct format or close to it
          if (!result.match(/\*[a-zA-Z0-9_]+/)) {
            // If it's just '*' without a name, add the name
            result = result.replace('*', `*${param.name}`);
          }
        }
      } else {
        // Replace parameter syntax with path-to-regexp syntax
        if (param.optional) {
          if (result.includes(`[[${param.name}]]`)) {
            result = result.replace(`[[${param.name}]]`, `:${param.name}?`);
          }
        } else {
          if (result.includes(`[${param.name}]`)) {
            result = result.replace(`[${param.name}]`, `:${param.name}`);
          }
        }
      }
    }

    return result;
  }

  /**
   * Converts intermediate representation to rou3/radix3 format
   */
  static toRou3(route: RouteIR): string {
    let result = route.pattern;

    // If it's already in rou3 format, return as is
    if ((result.includes(':') && !result.includes('[')) || result.includes('*')) {
      // Make sure catch-all is in the right format
      for (const param of route.params) {
        if (param.catchAll && result.includes(`*${param.name}`)) {
          result = result.replace(`*${param.name}`, '*');
        }
      }
      return result;
    }

    // Convert from other formats to rou3
    for (const param of route.params) {
      if (param.catchAll) {
        // Replace catch-all syntax
        if (result.includes(`[...${param.name}]`)) {
          result = result.replace(`[...${param.name}]`, '*');
        } else if (result.includes(`*${param.name}`)) {
          result = result.replace(`*${param.name}`, '*');
        }
      } else {
        // Replace parameter syntax
        if (param.optional) {
          // Rou3 does support optional params via '*' suffix
          if (result.includes(`[[${param.name}]]`)) {
            result = result.replace(`[[${param.name}]]`, `:${param.name}/*`);
          } else if (result.includes(`:${param.name}?`)) {
            result = result.replace(`:${param.name}?`, `:${param.name}/*`);
          }
        } else {
          if (result.includes(`[${param.name}]`)) {
            result = result.replace(`[${param.name}]`, `:${param.name}`);
          }
        }
      }
    }

    return result;
  }

  /**
   * Converts intermediate representation to find-my-way format
   */
  static toFindMyWay(route: RouteIR): string {
    let result = route.pattern;

    // If it's already in find-my-way format, return as is
    if ((result.includes(':') && !result.includes('[')) || result.includes('*')) {
      return result;
    }

    // Convert from other formats to find-my-way
    for (const param of route.params) {
      if (param.catchAll) {
        // Replace catch-all syntax
        if (result.includes(`[...${param.name}]`)) {
          result = result.replace(`[...${param.name}]`, '*');
        } else if (result.includes(`*${param.name}`)) {
          result = result.replace(`*${param.name}`, '*');
        }
      } else {
        // Replace parameter syntax
        if (param.optional) {
          // Find-my-way handles optional parameters differently
          if (result.includes(`[[${param.name}]]`)) {
            result = result.replace(`[[${param.name}]]`, `:${param.name}`);
            // Note: Client would need to configure the route as optional
          } else if (result.includes(`:${param.name}?`)) {
            result = result.replace(`:${param.name}?`, `:${param.name}`);
          }
        } else {
          if (result.includes(`[${param.name}]`)) {
            result = result.replace(`[${param.name}]`, `:${param.name}`);
          }
        }
      }
    }

    return result;
  }

  /**
   * Converts intermediate representation to file system route format
   */
  static toFileSystemRoute(route: RouteIR): string {
    let result = route.pattern;

    // If it's already in file system format, return as is
    if (result.includes('[') && !result.includes(':')) {
      return result;
    }

    // Convert from other formats to file system format
    for (const param of route.params) {
      if (param.catchAll) {
        // Replace catch-all syntax
        if (result.includes(`*${param.name}`)) {
          result = result.replace(`*${param.name}`, `[...${param.name}]`);
        } else if (result.includes('*')) {
          result = result.replace('*', `[...catchAll]`);
        }
      } else {
        // Replace parameter syntax
        if (param.optional) {
          if (result.includes(`:${param.name}?`)) {
            result = result.replace(`:${param.name}?`, `[[${param.name}]]`);
          } else if (result.includes(`:${param.name}`)) {
            result = result.replace(`:${param.name}`, `[[${param.name}]]`);
          }
        } else {
          if (result.includes(`:${param.name}`)) {
            result = result.replace(`:${param.name}`, `[${param.name}]`);
          }
        }
      }
    }

    return result;
  }

  /**
   * Convert from any supported format to any other format
   */
  static convert(path: string, fromFormat: 'path-to-regexp' | 'rou3' | 'find-my-way' | 'file-system',
                 toFormat: 'path-to-regexp' | 'rou3' | 'find-my-way' | 'file-system'): string {
    // Parse to intermediate representation
    let ir: RouteIR;

    switch (fromFormat) {
      case 'path-to-regexp':
        ir = RouteConverter.fromPathToRegexp(path);
        break;
      case 'rou3':
        ir = RouteConverter.fromRou3(path);
        break;
      case 'find-my-way':
        ir = RouteConverter.fromFindMyWay(path);
        break;
      case 'file-system':
        ir = RouteConverter.fromFileSystemRoute(path);
        break;
      default:
        throw new Error(`Unsupported format: ${fromFormat}`);
    }

    // Convert to target format
    switch (toFormat) {
      case 'path-to-regexp':
        return RouteConverter.toPathToRegexp(ir);
      case 'rou3':
        return RouteConverter.toRou3(ir);
      case 'find-my-way':
        return RouteConverter.toFindMyWay(ir);
      case 'file-system':
        return RouteConverter.toFileSystemRoute(ir);
      default:
        throw new Error(`Unsupported format: ${toFormat}`);
    }
  }
}
