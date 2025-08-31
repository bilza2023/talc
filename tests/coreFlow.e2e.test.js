// tests/coreFlow.e2e.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import createOreService from '../src/lib/services/oreServices.js';
import createTalcService from '../src/lib/services/talcServices.js';

describe.sequential('Core Flow E2E (Ore → Talc)', () => {
  let db;
  let ore;
  let talc;

  async function wipeDb() {
    // FK-safe order
    await db.$transaction([
      db.log.deleteMany({}),
      db.oreEdge.deleteMany({}),
      db.talcEdge.deleteMany({}),
      db.processEdge.deleteMany({}),
      db.oreBatch.deleteMany({}),
      db.talcBatch.deleteMany({}),
      db.supplier.deleteMany({})
    ]);
  }

  beforeAll(async () => {
    db = new PrismaClient();
    ore = createOreService(db);
    talc = createTalcService(db);
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  beforeEach(async () => {
    await wipeDb();
  });

  it('runs the full pipeline: ore.deposit → ore.dispatch → ore.receive → talc.process → talc.dispatch → talc.receive', async () => {
    // 1) ORE: deposit @JSS (20t WL)
    const parentOre = await ore.deposit({
      stationCode: 'JSS',
      gradeCode: 'wl',    // should normalize to WL
      createdTon: 20
    });
    expect(parentOre.stationCode).toBe('JSS');
    expect(parentOre.gradeCode).toBe('WL');
    expect(Number(parentOre.createdTon)).toBeCloseTo(20, 5);
    expect(Number(parentOre.remainingTon)).toBeCloseTo(20, 5);

    // 2) ORE: dispatch 12t to PSS
    const oreEdge = await ore.dispatch({
      parentBatchId: parentOre.id,
      toStation: 'PSS',
      dispatchWeight: 12,
      dispatchGrade: 'wl', // normalize to WL
      truckNo: 'TR-ORE-001'
    });
    expect(oreEdge.status).toBe('in_transit');
    expect(oreEdge.fromStation).toBe('JSS');
    expect(oreEdge.toStation).toBe('PSS');
    expect(oreEdge.dispatchGrade).toBe('WL');
    expect(Number(oreEdge.dispatchWeight)).toBeCloseTo(12, 5);

    // 3) ORE: receive at PSS (11.8t)
    const oreReceiveRes = await ore.receive({
      edgeId: oreEdge.id,
      receiveWeight: 11.8,
      receiveGrade: 'wl',
      receivedBy: 'Zeeshan'
    });
    expect(oreReceiveRes.edge.status).toBe('received');
    expect(Number(oreReceiveRes.edge.receiveWeight)).toBeCloseTo(11.8, 5);
    expect(oreReceiveRes.childBatch.stationCode).toBe('PSS');
    expect(oreReceiveRes.childBatch.bornAs).toBe('receive');
    expect(oreReceiveRes.childBatch.gradeCode).toBe('WL');
    expect(Number(oreReceiveRes.childBatch.createdTon)).toBeCloseTo(11.8, 5);

    // parent ore remaining should be 20 - 11.8 = 8.2
    expect(Number(oreReceiveRes.parentBatch.remainingTon)).toBeCloseTo(8.2, 5);

    const childOre = oreReceiveRes.childBatch;

    // 4) TALC: process at PSS consuming 10t ore → create 6t talc (TL1)
    const procRes = await talc.process({
      parentOreBatchId: childOre.id,
      stationCode: 'PSS',
      gradeCode: 'tl1',     // normalize to TL1
      oreDeltaTon: 10,
      talcCreatedTon: 6.0,
      runKey: 'RUN-CORE-E2E'
    });
    expect(procRes.talcBatch.stationCode).toBe('PSS');
    expect(procRes.talcBatch.gradeCode).toBe('TL1');
    expect(procRes.talcBatch.bornAs).toBe('process');
    expect(Number(procRes.talcBatch.createdTon)).toBeCloseTo(6.0, 5);

    // ore child remaining should be 11.8 - 10 = 1.8
    expect(Number(procRes.parentOreBatch.remainingTon)).toBeCloseTo(1.8, 5);

    // 5) TALC: dispatch 3.5t TL1 from PSS to KEF
    const talcEdge = await talc.dispatch({
      parentBatchId: procRes.talcBatch.id,
      toStation: 'KEF',
      dispatchWeight: 3.5,
      dispatchGrade: 'tl1',
      truckNo: 'TR-TALC-123'
    });
    expect(talcEdge.status).toBe('in_transit');
    expect(talcEdge.fromStation).toBe('PSS');
    expect(talcEdge.toStation).toBe('KEF');
    expect(talcEdge.dispatchGrade).toBe('TL1');
    expect(Number(talcEdge.dispatchWeight)).toBeCloseTo(3.5, 5);

    // 6) TALC: receive at KEF (3.4t)
    const talcReceiveRes = await talc.receive({
      edgeId: talcEdge.id,
      receiveWeight: 3.4,
      receiveGrade: 'tl1',
      receivedBy: 'Sara'
    });
    expect(talcReceiveRes.edge.status).toBe('received');
    expect(Number(talcReceiveRes.edge.receiveWeight)).toBeCloseTo(3.4, 5);
    expect(talcReceiveRes.childBatch.stationCode).toBe('KEF');
    expect(talcReceiveRes.childBatch.bornAs).toBe('receive');
    expect(talcReceiveRes.childBatch.gradeCode).toBe('TL1');

    // talc parent remaining should be 6.0 - 3.4 = 2.6
    expect(Number(talcReceiveRes.parentBatch.remainingTon)).toBeCloseTo(2.6, 5);

    // --- Edge/Log sanity checks ---
    const oreEdges = await db.oreEdge.findMany();
    const talcEdges = await db.talcEdge.findMany();
    expect(oreEdges.length).toBe(1);
    expect(talcEdges.length).toBe(1);
    expect(oreEdges[0].status).toBe('received');
    expect(talcEdges[0].status).toBe('received');

    const logs = await db.log.findMany({ orderBy: { id: 'asc' } });
    const countByType = logs.reduce((acc, l) => {
      acc[l.type] = (acc[l.type] || 0) + 1;
      return acc;
    }, {});
    expect(countByType.ORE_DEPOSIT).toBe(1);
    expect(countByType.ORE_DISPATCH).toBe(1);
    expect(countByType.ORE_RECEIVE).toBe(1);
    expect(countByType.TALC_PROCESS).toBe(1);
    expect(countByType.TALC_DISPATCH).toBe(1);
    expect(countByType.TALC_RECEIVE).toBe(1);

    // No in_transit edges left
    const anyInTransit =
      oreEdges.some(e => e.status === 'in_transit') ||
      talcEdges.some(e => e.status === 'in_transit');
    expect(anyInTransit).toBe(false);
  });
});
