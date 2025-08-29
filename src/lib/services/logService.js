// src/lib/services/logService.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function log(level, type, metadata = {}) {
  return prisma.log.create({
    data: { level, type, metadata }
  });
}

export async function list({
  skip = 0,
  take = 50,
  filter = {},    // e.g. { type: 'ORE_DEPOSIT', level: 'error' }
  dateFrom,
  dateTo
} = {}) {
  const where = { ...filter };
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo)   where.createdAt.lte = dateTo;
  }
  return prisma.log.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take
  });
}

export async function get(id) {
  return prisma.log.findUnique({ where: { id } });
}

// (Optional) if you really need deletes—use with care:
export async function remove(id) {
  return prisma.log.delete({ where: { id } });
}
