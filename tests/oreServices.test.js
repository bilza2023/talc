// tests/oreServices.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import createOreService from '../src/lib/services/oreServices.js';

let db;
let ore;
let supplier; // seeded before each test

async function wipeDb() {
  // FK-safe order (adjust model names if yours differ)
  await db.log.deleteMany({});
  await db.oreTransport.deleteMany({});
  await db.oreDeposit.deleteMany({});
  await db.supplier.deleteMany({});
}

beforeAll(async () => {
  db = new PrismaClient();
  ore = createOreService(db); // inject test DB
});

afterAll(async () => {
  await db.$disconnect();
});

beforeEach(async () => {
    await wipeDb();
    supplier = await db.supplier.create({
      data: {
        code: `SUP-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, // required + unique
        name: 'Test Supplier'
      }
    });
  });

describe('Ore Services', () => {
  it('deposit: creates deposit row and writes a log', async () => {
    const row = await ore.deposit({
      stationCode: 'JSS',
      supplierId: supplier.id,
      weightTon: 88.5,
      gradeCode: 'wc', // should normalize to WC
      truckNo: 'TR-001'
    });

    expect(row).toBeTruthy();
    expect(row.stationCode).toBe('JSS');
    expect(row.supplierId).toBe(supplier.id);
    expect(Number(row.weightTon)).toBeCloseTo(88.5, 5);
    expect(row.gradeCode).toBe('WC');
    expect(row.truckNo).toBe('TR-001');
    expect(row.depositedAt instanceof Date).toBe(true);

    const logs = await db.log.findMany({ where: { type: 'ORE_DEPOSIT' } });
    expect(logs.length).toBe(1);
    const meta = logs[0].metadata;
    expect(meta.id).toBe(row.id);
    expect(meta.stationCode).toBe('JSS');
  });

  it('dispatch: creates in_transit transport and writes a log', async () => {
    const t = await ore.dispatch({
      stationCode: 'JSS',
      toStation: 'PSS',
      truckNo: 'TR-777',
      weightTon: 12,
      gradeCode: 'GL',
      supplierId: supplier.id
    });

    expect(t).toBeTruthy();
    expect(t.fromStation).toBe('JSS');
    expect(t.toStation).toBe('PSS');
    expect(t.truckNo).toBe('TR-777');
    expect(Number(t.sendWeightTon)).toBe(12);
    expect(t.sendGradeCode).toBe('GL');
    expect(t.status).toBe('in_transit');
    expect(t.dispatchedAt instanceof Date).toBe(true);

    const logs = await db.log.findMany({ where: { type: 'ORE_DISPATCH' } });
    expect(logs.length).toBe(1);
    expect(logs[0].metadata.id).toBe(t.id);
  });

  it('listInTransit: filters by toStation correctly', async () => {
    const a = await ore.dispatch({
      stationCode: 'JSS', toStation: 'PSS', truckNo: 'T-A', weightTon: 5, gradeCode: 'WC'
    });
    const b = await ore.dispatch({
      stationCode: 'JSS', toStation: 'KEF', truckNo: 'T-B', weightTon: 6, gradeCode: 'WF'
    });
    expect(a && b).toBeTruthy();

    const onlyPSS = await ore.listInTransit('PSS');
    expect(onlyPSS.length).toBe(1);
    expect(onlyPSS[0].id).toBe(a.id);

    const all = await ore.listInTransit();
    expect(all.length).toBe(2);
  });

  it('unload: happy path updates status/fields and logs', async () => {
    const t = await ore.dispatch({
      stationCode: 'JSS', toStation: 'PSS', truckNo: 'TR-999', weightTon: 14.2, gradeCode: 'WL'
    });

    const r = await ore.unload({
      transportId: t.id,
      stationCode: 'PSS',
      receiveWeightTon: 14.0,
      receiveGradeCode: 'wl', // normalize to WL
      receivedBy: 'Ali'
    });

    expect(r.status).toBe('received');
    expect(Number(r.receiveWeightTon)).toBeCloseTo(14.0, 5);
    expect(r.receiveGradeCode).toBe('WL');
    expect(r.receivedBy).toBe('Ali');
    expect(r.receivedAt instanceof Date).toBe(true);

    const logs = await db.log.findMany({ where: { type: 'ORE_UNLOAD' } });
    expect(logs.length).toBe(1);
    const meta = logs[0].metadata;
    expect(meta.id).toBe(t.id);
    expect(meta.toStation).toBe('PSS');
    expect(Number(meta.receiveWeightTon)).toBeCloseTo(14.0, 5);
    expect(meta.receiveGradeCode).toBe('WL');
  });

  it('unload: throws E_NOT_FOUND if transport does not exist', async () => {
    await expect(
      ore.unload({
        transportId: 999999,
        stationCode: 'PSS',
        receiveWeightTon: 1,
        receiveGradeCode: 'WC',
        receivedBy: 'X'
      })
    ).rejects.toMatchObject({ code: 'E_NOT_FOUND' });
  });

  it('unload: throws E_BAD_STATUS if already received', async () => {
    const t = await ore.dispatch({
      stationCode: 'JSS', toStation: 'PSS', truckNo: 'TR-123', weightTon: 3, gradeCode: 'GC'
    });
    await ore.unload({
      transportId: t.id, stationCode: 'PSS', receiveWeightTon: 3, receiveGradeCode: 'GC', receivedBy: 'Z'
    });

    await expect(
      ore.unload({
        transportId: t.id, stationCode: 'PSS', receiveWeightTon: 2.9, receiveGradeCode: 'GC', receivedBy: 'Z'
      })
    ).rejects.toMatchObject({ code: 'E_BAD_STATUS' });
  });

  it('unload: throws E_STATION_MISMATCH on wrong receiving station', async () => {
    const t = await ore.dispatch({
      stationCode: 'JSS', toStation: 'KEF', truckNo: 'TR-555', weightTon: 7, gradeCode: 'GF'
    });

    await expect(
      ore.unload({
        transportId: t.id, stationCode: 'PSS', receiveWeightTon: 7, receiveGradeCode: 'GF', receivedBy: 'Y'
      })
    ).rejects.toMatchObject({ code: 'E_STATION_MISMATCH' });
  });

  it('getTransport: returns the right row', async () => {
    const t = await ore.dispatch({
      stationCode: 'JSS', toStation: 'PSS', truckNo: 'TR-404', weightTon: 9, gradeCode: 'WF'
    });

    const found = await ore.getTransport(t.id);
    expect(found?.id).toBe(t.id);
    expect(found?.status).toBe('in_transit');
  });
});
