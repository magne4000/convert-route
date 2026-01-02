#!/usr/bin/env node
/**
 * Helper script to generate IR JSON objects from existing fixture patterns
 */

import { fromRou3 } from '../dist/rou3.js';

const pattern = process.argv[2] || '/foo/:id';
const ir = fromRou3(pattern);
console.log(JSON.stringify({ params: ir.params }, null, 2));
