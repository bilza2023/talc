
// src/lib/mma/mma4s.instance.js
import { createMMA4S } from './mma4s.js';
import { MMA_REGISTRY } from './registry.js';

// Single engine instance for the whole app
export const mma4s = createMMA4S({ registry: MMA_REGISTRY });
