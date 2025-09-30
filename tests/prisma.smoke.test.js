// tests/prisma.smoke.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('prisma smoke', () => {
  it('runs a trivial query', async () => {
    const rows = await prisma.$queryRaw`SELECT 1 AS one`;
    const val = Number(rows?.[0]?.one ?? Object.values(rows?.[0] ?? {})[0]);
    expect(val).toBe(1);
  });

  it('uses test DATABASE_URL', async () => {
    // sanity check the test DB URL is present (setup.prisma.js sets it)
    expect(process.env.DATABASE_URL).toBeTruthy();
    // optional: print to confirm it's the in-memory one
    console.log('TEST DATABASE_URL =', process.env.DATABASE_URL);
  });
});
