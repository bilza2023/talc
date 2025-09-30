// tests/prisma.smoke.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => { await prisma.$connect(); });
afterAll(async () => { await prisma.$disconnect(); });

describe('prisma singleton / connectivity', () => {
  it('runs a trivial query', async () => {
    const rows = await prisma.$queryRaw`SELECT 1 AS one`;
    const val = rows?.[0]?.one ?? Object.values(rows?.[0] ?? {})[0];
    expect(Number(val)).toBe(1);
  });
});
