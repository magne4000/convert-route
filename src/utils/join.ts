type NullableString = string | null | undefined;

function isValidSegment(segment: NullableString): segment is string {
  return segment !== null && segment !== undefined && segment !== "";
}

function generateCombinations(arrays: NullableString[][]): string[][] {
  if (arrays.length === 0) return [[]];
  if (arrays.length === 1)
    return arrays[0].filter(isValidSegment).map((item) => [item]);

  const [first, ...rest] = arrays;
  const restCombinations = generateCombinations(rest);

  const result: string[][] = [];
  for (const item of first) {
    for (const combination of restCombinations) {
      if (isValidSegment(item)) {
        result.push([item, ...combination]);
      } else {
        result.push([...combination]);
      }
    }
  }

  return result;
}

export function join(segments: (NullableString | NullableString[])[]) {
  // Convert segments to arrays and track positions
  const normalizedSegments = segments
    .map((segment) => {
      if (Array.isArray(segment)) {
        return segment;
      }
      return [segment];
    })
    .filter((arr) => arr.length > 0); // Remove empty arrays

  // Generate all combinations
  const combinations = generateCombinations(normalizedSegments);

  // Join each combination with '/'
  return combinations.map((combination) => `/${combination.join("/")}`);
}
