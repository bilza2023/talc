// Vitest runner (ESM-friendly)
import { beforeAll, afterAll, describe, test, expect } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

let PrismaClient, StationCode;
let prisma;
let createOreService;
let ore;

beforeAll(async () => {
  // Use a separate DB for tests
  process.env.DATABASE_URL = 'file:./ab-test.sqlite';

  // Reset DB to schema (fresh file)
  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });

  // Import AFTER env is set & schema is pushed
  ({ PrismaClient, StationCode } = await import('@prisma/client'));
  ({ default: createOreService } = await import('../services/oreService.js'));

  prisma = new PrismaClient();
  ore = createOreService(prisma);
});

afterAll(async () => {
  if (prisma) await prisma.$disconnect();
  try { fs.unlinkSync('./ab-test.sqlite'); } catch {}
});

describe('oreService (canonical flow)', () => {
  test('deposit @JSS → dispatch to PSS → receive at PSS', async () => {
    const supplier = await prisma.supplier.create({
      data: { name: 'Supplier A', code: 'SUP001' },
    });

    const dep = await ore.createDeposit({
      stationCode: 'JSS',
      supplierId: supplier.id,
      weightTon: 20,
      gradeCode: 'WL',
      batchRef: 'SUP001-WL-TEST-001',
    });
    expect(dep.id).toBeTruthy();

    let jss = await ore.getStationStock('JSS');
    expect(jss).toMatchObject({
      stationCode: 'JSS',
      deposits: 20,
      received: 0,
      dispatched: 0,
      inTransit: 0,
      stock: 20,
    });

    const t1 = await ore.dispatch({
      fromStation: 'JSS',
      toStation: 'PSS',
      truckNo: 'TRK-001',
      weightTon: 5,
      gradeCode: 'WL',
      supplierId: supplier.id,
    });

    expect(t1.status).toBe('in_transit');

    jss = await ore.getStationStock('JSS');
    expect(jss.deposits).toBe(20);
    expect(jss.dispatched).toBe(5);
    expect(jss.inTransit).toBe(5);
    expect(jss.stock).toBe(15);

    let pss = await ore.getStationStock('PSS');
    expect(pss.stock).toBe(0);

    await ore.receive({ transportId: t1.id });

    jss = await ore.getStationStock('JSS');
    expect(jss.inTransit).toBe(0);
    expect(jss.stock).toBe(15);

    pss = await ore.getStationStock('PSS');
    expect(pss.deposits).toBe(0);
    expect(pss.received).toBe(5);
    expect(pss.stock).toBe(5);

    const depositsJSS = await ore.listDeposits({ stationCode: 'JSS' });
    expect(depositsJSS.length).toBe(1);

    const movesFromJSS = await ore.listTransports({ fromStation: 'JSS' });
    expect(movesFromJSS.length).toBe(1);

    const movesToPSS = await ore.listTransports({ toStation: 'PSS' });
    expect(movesToPSS.length).toBe(1);
  });

  test('cannot dispatch more than stock (enforceStock)', async () => {
    await expect(
      ore.dispatch({
        fromStation: 'JSS',
        toStation: 'PSS',
        truckNo: 'TRK-OVER',
        weightTon: 999,
      })
    ).rejects.toThrow(/INSUFFICIENT_STOCK/);
  });
});
