// tests/talcServices.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import createTalcService from '../src/lib/services/talcServices.js';

let db;
let talc;

async function wipeDb() {
  // FK-safe order: logs → talcDeposit (FK to oreTransport) → talcTransport → oreTransport → oreDeposit → supplier
  await db.log.deleteMany({});
  await db.talcDeposit.deleteMany({});
  await db.talcTransport.deleteMany({});
  await db.oreTransport.deleteMany({});
  await db.oreDeposit.deleteMany({});
  await db.supplier.deleteMany({});
}

beforeAll(async () => {
  db = new PrismaClient();
  talc = createTalcService(db);
});

afterAll(async () => {
  await db.$disconnect();
});

beforeEach(async () => {
  await wipeDb();
});

describe('Talc Services', () => {
  it('deposit: creates talcDeposit and writes a TALC_DEPOSIT log (no link)', async () => {
    const row = await talc.deposit({
      stationCode: 'JSS',
      weightTon: 7.25,
      gradeCode: 'tl' // should normalize to TL
    });

    expect(row).toBeTruthy();
    expect(row.stationCode).toBe('JSS');
    expect(Number(row.weightTon)).toBeCloseTo(7.25, 5);
    expect(row.gradeCode).toBe('TL');
    expect(row.depositedAt instanceof Date).toBe(true);

    const logs = await db.log.findMany({ where: { type: 'TALC_DEPOSIT' } });
    expect(logs.length).toBe(1);
    expect(logs[0].metadata.id).toBe(row.id);
  });

  it('deposit: can link to an OreTransport via oreTransportId (traceability)', async () => {
    // minimal ore transport to satisfy FK
    const ot = await db.oreTransport.create({
      data: {
        fromStation: 'JSS',
        toStation: 'PSS',
        sendWeightTon: 10,
        sendGradeCode: 'GL'
        // status defaults to in_transit; no business rule enforced here
      }
    });

    const row = await talc.deposit({
      stationCode: 'PSS',
      weightTon: 3.5,
      gradeCode: 'wf',      // -> WF
      oreTransportId: ot.id // FK link
    });

    expect(row.oreTransportId).toBe(ot.id);
    expect(row.gradeCode).toBe('WF');

    const logs = await db.log.findMany({ where: { type: 'TALC_DEPOSIT' } });
    expect(logs.length).toBe(1);
    expect(logs[0].metadata.oreTransportId).toBe(ot.id);
  });

  it('dispatch: creates talcTransport in in_transit and logs TALC_DISPATCH', async () => {
    const t = await talc.dispatch({
      stationCode: 'JSS',
      toStation: 'PSS',
      truckNo: 'TR-777',
      weightTon: 4.2,
      gradeCode: 'gl'
    });

    expect(t).toBeTruthy();
    expect(t.fromStation).toBe('JSS');
    expect(t.toStation).toBe('PSS');
    expect(t.truckNo).toBe('TR-777');
    expect(Number(t.sendWeightTon)).toBeCloseTo(4.2, 5);
    expect(t.sendGradeCode).toBe('GL');
    expect(t.status).toBe('in_transit');
    expect(t.dispatchedAt instanceof Date).toBe(true);

    const logs = await db.log.findMany({ where: { type: 'TALC_DISPATCH' } });
    expect(logs.length).toBe(1);
    expect(logs[0].metadata.id).toBe(t.id);
  });

  it('listInTransit: filters by toStation correctly', async () => {
    const a = await talc.dispatch({
      stationCode: 'JSS', toStation: 'PSS', truckNo: 'T-A', weightTon: 1, gradeCode: 'WC'
    });
    const b = await talc.dispatch({
      stationCode: 'JSS', toStation: 'KEF', truckNo: 'T-B', weightTon: 2, gradeCode: 'WF'
    });
    expect(a && b).toBeTruthy();

    const onlyPSS = await talc.listInTransit('PSS');
    expect(onlyPSS.length).toBe(1);
    expect(onlyPSS[0].id).toBe(a.id);

    const all = await talc.listInTransit();
    expect(all.length).toBe(2);
  });

  it('unload: happy path updates status/fields and logs TALC_UNLOAD', async () => {
    const t = await talc.dispatch({
      stationCode: 'JSS', toStation: 'PSS', truckNo: 'TR-999', weightTon: 5.6, gradeCode: 'WL'
    });

    const r = await talc.unload({
      transportId: t.id,
      stationCode: 'PSS',
      receiveWeightTon: 5.5,
      receiveGradeCode: 'wl', // -> WL
      receivedBy: 'Ali'
    });

    expect(r.status).toBe('received');
    expect(Number(r.receiveWeightTon)).toBeCloseTo(5.5, 5);
    expect(r.receiveGradeCode).toBe('WL');
    expect(r.receivedBy).toBe('Ali');
    expect(r.receivedAt instanceof Date).toBe(true);

    const logs = await db.log.findMany({ where: { type: 'TALC_UNLOAD' } });
    expect(logs.length).toBe(1);
    expect(logs[0].metadata.id).toBe(t.id);
    expect(logs[0].metadata.toStation).toBe('PSS');
  });

  it('unload: throws E_NOT_FOUND if transport does not exist', async () => {
    await expect(
      talc.unload({
        transportId: 999999,
        stationCode: 'PSS',
        receiveWeightTon: 1,
        receiveGradeCode: 'WC',
        receivedBy: 'X'
      })
    ).rejects.toMatchObject({ code: 'E_NOT_FOUND' });
  });

  it('unload: throws E_BAD_STATUS if already received', async () => {
    const t = await talc.dispatch({
      stationCode: 'JSS', toStation: 'PSS', truckNo: 'TR-123', weightTon: 3, gradeCode: 'GC'
    });
    await talc.unload({
      transportId: t.id, stationCode: 'PSS', receiveWeightTon: 3, receiveGradeCode: 'GC', receivedBy: 'Z'
    });

    await expect(
      talc.unload({
        transportId: t.id, stationCode: 'PSS', receiveWeightTon: 2.9, receiveGradeCode: 'GC', receivedBy: 'Z'
      })
    ).rejects.toMatchObject({ code: 'E_BAD_STATUS' });
  });

  it('unload: throws E_STATION_MISMATCH on wrong receiving station', async () => {
    const t = await talc.dispatch({
      stationCode: 'JSS', toStation: 'KEF', truckNo: 'TR-555', weightTon: 7, gradeCode: 'GF'
    });

    await expect(
      talc.unload({
        transportId: t.id, stationCode: 'PSS', receiveWeightTon: 7, receiveGradeCode: 'GF', receivedBy: 'Y'
      })
    ).rejects.toMatchObject({ code: 'E_STATION_MISMATCH' });
  });

  it('getTransport: returns the right row', async () => {
    const t = await talc.dispatch({
      stationCode: 'JSS', toStation: 'PSS', truckNo: 'TR-404', weightTon: 2.2, gradeCode: 'WF'
    });

    const found = await talc.getTransport(t.id);
    expect(found?.id).toBe(t.id);
    expect(found?.status).toBe('in_transit');
  });
});
