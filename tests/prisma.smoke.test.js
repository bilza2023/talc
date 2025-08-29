import { describe, it, expect, afterAll } from 'vitest';
import prisma from '../src/lib/server/prisma.js';

describe('prisma singleton', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('connects and runs a trivial query', async () => {
    const rows = await prisma.$queryRaw`SELECT 1 AS one`;
    const raw = rows?.[0] ?? {};
    const val = raw.one ?? raw.ONE ?? raw.One ?? Object.values(raw)[0];

    // Normalize to a JS number (works for 1, '1', 1n)
    const num = typeof val === 'bigint' ? Number(val) : Number(val);
    expect(num).toBe(1);
  });
});
