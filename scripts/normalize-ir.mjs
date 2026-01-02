#!/usr/bin/env node
/**
 * Normalizes IR params to ensure consistent optional property and property order
 * This ensures each logical pattern has only one canonical IR representation
 */

export function normalizeIR(params) {
  return params.map(param => {
    // Build normalized object with consistent property order
    const normalized = {
      value: param.value,
      optional: param.optional ?? false,  // Always include, default to false
    };
    
    // Add catchAll if present, with consistent internal order
    if (param.catchAll) {
      normalized.catchAll = {
        name: param.catchAll.name,
        greedy: param.catchAll.greedy,
      };
    }
    
    return normalized;
  });
}

// Test the normalization
import { fromRou3 } from '../dist/rou3.js';
import { fromPathToRegexpV8 } from '../dist/path-to-regexp-v8.js';

const rou3IR = fromRou3('/foo/:id');
const ptr8IR = fromPathToRegexpV8('/foo/:id');

console.log('Before normalization:');
console.log('rou3:', JSON.stringify(rou3IR.params));
console.log('ptr8:', JSON.stringify(ptr8IR.params));
console.log('Equal:', JSON.stringify(rou3IR.params) === JSON.stringify(ptr8IR.params));

const normalizedRou3 = normalizeIR(rou3IR.params);
const normalizedPtr8 = normalizeIR(ptr8IR.params);

console.log('\nAfter normalization:');
console.log('rou3:', JSON.stringify(normalizedRou3));
console.log('ptr8:', JSON.stringify(normalizedPtr8));
console.log('Equal:', JSON.stringify(normalizedRou3) === JSON.stringify(normalizedPtr8));
