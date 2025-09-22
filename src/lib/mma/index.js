
import { PrismaClient } from '@prisma/client';
import MMA4S from './mma4s.js';

const prisma = new PrismaClient();

// Registry: which MMA codes belong to each stage
const processed4s = new MMA4S({
  prisma,
  table: 'processed4s',
  registry: ['ABS_PROCESSED', 'PSS_PROCESSED'],
});

const sorted4s = new MMA4S({
  prisma,
  table: 'sorted4s',
  registry: ['PSS_SORTED'], // add 'KHI_SORTED' if you define it
});

export { processed4s, sorted4s };
