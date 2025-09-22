// src/lib/mma/utils.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Return the Prisma delegate (table model) for a given table name string.
 * Example: getDelegate(prisma, 'processed4s') → prisma.processed4s
 */
export function getDelegate(prismaClient, table) {
  if (!prismaClient[table]) {
    throw new Error(`No delegate found for table: ${table}`);
  }
  return prismaClient[table];
}

/**
 * Convenience: export a singleton prisma in case utils need it.
 */
export { prisma };
