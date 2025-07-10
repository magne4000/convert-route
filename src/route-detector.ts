// route-detector.ts

/**
 * Route format types supported by the detector
 */
export type RouteFormat = 'path-to-regexp' | 'rou3' | 'find-my-way' | 'file-system' | 'unknown';

/**
 * Detects the format of a given route pattern
 * @param route Route pattern string to analyze
 * @returns The detected route format
 */
export function detectRouteFormat(route: string): RouteFormat {
  // Check for file system routing patterns
  if (route.includes('[...') || (route.includes('[') && route.includes(']') && !route.includes(':'))) {
    const fileSystemPatterns = /\[{1,2}[a-zA-Z0-9_]+\]{1,2}|\[\.\.\.([a-zA-Z0-9_]+)\]/;
    if (fileSystemPatterns.test(route)) {
      return 'file-system';
    }
  }

  // Check for path-to-regexp specific patterns
  if (route.includes(':')) {
    // Look for optional parameters with question marks
    if (route.includes('?')) {
      const pathToRegexpOptional = /:[a-zA-Z0-9_]+\?/;
      if (pathToRegexpOptional.test(route)) {
        return 'path-to-regexp';
      }
    }

    // Look for path-to-regexp parameter constraints
    const pathToRegexpConstraints = /:[a-zA-Z0-9_]+\([^)]*\)/;
    if (pathToRegexpConstraints.test(route)) {
      return 'path-to-regexp';
    }

    // Look for named wildcards that only path-to-regexp supports
    const pathToRegexpNamedWildcard = /\*[a-zA-Z0-9_]+/;
    if (pathToRegexpNamedWildcard.test(route)) {
      return 'path-to-regexp';
    }
  }

  // Check for an unnamed wildcard character
  if (route.includes('*') && !route.includes('*[a-zA-Z0-9_]+')) {
    // Both rou3 and find-my-way use unnamed wildcards
    // Because they're very similar, we need more context to differentiate

    // If we have a named parameter and a wildcard, assume it's find-my-way
    // (This is somewhat arbitrary as both could handle this pattern)
    const hasNamedParams = /:[a-zA-Z0-9_]+/.test(route);
    if (hasNamedParams) {
      return 'find-my-way';
    } else {
      return 'rou3'; // Default to rou3 for simpler wildcard patterns
    }
  }

  // Check for basic named parameters without special syntax
  if (route.includes(':')) {
    const basicNamedParams = /:[a-zA-Z0-9_]+/;
    if (basicNamedParams.test(route)) {
      // Both rou3 and find-my-way use similar syntax for basic parameters
      // We can try to differentiate based on common patterns or defaults

      // Check for multiple parameters in a segment which is more common in find-my-way
      const multipleParamsInSegment = /\/:[a-zA-Z0-9_]+:[a-zA-Z0-9_]+/;
      if (multipleParamsInSegment.test(route)) {
        return 'find-my-way';
      }

      // If there's only one parameter pattern, both formats are similar
      // Default to rou3 as it's slightly more common for simple routes
      return 'rou3';
    }
  }

  // If no special patterns are found, we can't determine the format with certainty
  return 'unknown';
}
