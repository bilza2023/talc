// tests/stocks.smoke.test.js
import { describe, it, expect, afterAll } from 'vitest';
import { prisma, rawStock, sortedStock, processedStock } from '../src/lib/stocks/index.js';

describe('stocks smoke', () => {
  afterAll(async () => {
    try {
      await prisma.$disconnect();
    } catch {}
  });

  it('imports raw/sorted/processed stocks', () => {
    expect(rawStock).toBeTruthy();
    expect(sortedStock).toBeTruthy();
    expect(processedStock).toBeTruthy();
  });

  it('prisma responds to a trivial query', async () => {
    const rows = await prisma.$queryRaw`SELECT 1 AS one`;
    const raw = rows?.[0] ?? {};
    const val = raw.one ?? raw.ONE ?? raw.One ?? Object.values(raw)[0];
    const num = typeof val === 'bigint' ? Number(val) : Number(val);
    expect(num).toBe(1);
  });
});
