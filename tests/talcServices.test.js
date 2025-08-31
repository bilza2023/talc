// tests/talcServices.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import createOreService from '../src/lib/services/oreServices.js';
import createTalcService from '../src/lib/services/talcServices.js';

describe.sequential('Talc Services', () => {
  let db;
  let ore;
  let talc;

  async function wipeDb() {
    await db.$transaction([
      db.log.deleteMany({}),
      db.oreEdge.deleteMany({}),
      db.talcEdge.deleteMany({}),
      db.processEdge.deleteMany({}),
      db.oreBatch.deleteMany({}),
      db.talcBatch.deleteMany({})
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

  async function seedOreAt(stationCode, createdTon = 20, gradeCode = 'GL') {
    return ore.deposit({ stationCode, gradeCode, createdTon });
  }

  it('process: creates talcBatch, writes processEdge, deducts ore', async () => {
    const parentOre = await seedOreAt('JSS', 20, 'GL');

    const res = await talc.process({
      parentOreBatchId: parentOre.id,
      stationCode: 'JSS',
      gradeCode: 'tl1',
      oreDeltaTon: 10,
      talcCreatedTon: 6.5,
      runKey: 'RUN-1'
    });

    expect(res.talcBatch).toBeTruthy();
    expect(res.talcBatch.stationCode).toBe('JSS');
    expect(res.talcBatch.gradeCode).toBe('TL1');
    expect(res.talcBatch.bornAs).toBe('process');
    expect(Number(res.talcBatch.createdTon)).toBeCloseTo(6.5, 5);

    expect(res.processEdge.parentOreBatchId).toBe(parentOre.id);
    expect(Number(res.processEdge.oreDeltaTon)).toBeCloseTo(10, 5);

    expect(Number(res.parentOreBatch.remainingTon)).toBeCloseTo(10, 5);

    const logs = await db.log.findMany({ where: { type: 'TALC_PROCESS' } });
    expect(logs.length).toBe(1);
    expect(logs[0].metadata.parentOreBatchId).toBe(parentOre.id);
  });

  it('dispatch: creates in_transit talcEdge from a parent talc batch', async () => {
    const parentOre = await seedOreAt('JSS', 15, 'GL');
    const { talcBatch } = await talc.process({
      parentOreBatchId: parentOre.id,
      stationCode: 'JSS',
      gradeCode: 'TL2',
      oreDeltaTon: 8,
      talcCreatedTon: 4.2
    });

    const edge = await talc.dispatch({
      parentBatchId: talcBatch.id,
      toStation: 'PSS',
      dispatchWeight: 3.5,
      dispatchGrade: 'tl2',
      truckNo: 'TR-123'
    });

    expect(edge.status).toBe('in_transit');
    expect(edge.fromStation).toBe('JSS');
    expect(edge.toStation).toBe('PSS');
    expect(edge.dispatchGrade).toBe('TL2');
    expect(Number(edge.dispatchWeight)).toBeCloseTo(3.5, 5);
  });

  it('listIncomingEdges: filters by destination station', async () => {
    const parentOre = await seedOreAt('JSS', 15, 'GL');
    const { talcBatch } = await talc.process({
      parentOreBatchId: parentOre.id,
      stationCode: 'JSS',
      gradeCode: 'TL3',
      oreDeltaTon: 8,
      talcCreatedTon: 5
    });

    const a = await talc.dispatch({
      parentBatchId: talcBatch.id,
      toStation: 'PSS',
      dispatchWeight: 2,
      dispatchGrade: 'TL3'
    });
    const b = await talc.dispatch({
      parentBatchId: talcBatch.id,
      toStation: 'KEF',
      dispatchWeight: 1.5,
      dispatchGrade: 'TL3'
    });
    expect(a && b).toBeTruthy();

    const onlyPSS = await talc.listIncomingEdges('PSS');
    expect(onlyPSS.length).toBe(1);
    expect(onlyPSS[0].id).toBe(a.id);

    const all = await talc.listIncomingEdges();
    expect(all.length).toBe(2);
  });

  it('receive: completes talc edge, creates child batch, deducts parent', async () => {
    const parentOre = await seedOreAt('JSS', 20, 'GL');
    const { talcBatch } = await talc.process({
      parentOreBatchId: parentOre.id,
      stationCode: 'JSS',
      gradeCode: 'TL1',
      oreDeltaTon: 10,
      talcCreatedTon: 6
    });
    const edge = await talc.dispatch({
      parentBatchId: talcBatch.id,
      toStation: 'KEF',
      dispatchWeight: 2.5,
      dispatchGrade: 'TL1'
    });

    const res = await talc.receive({
      edgeId: edge.id,
      receiveWeight: 2.4,
      receiveGrade: 'tl1',
      receivedBy: 'Sara'
    });

    expect(res.edge.status).toBe('received');
    expect(Number(res.edge.receiveWeight)).toBeCloseTo(2.4, 5);
    expect(res.childBatch.stationCode).toBe('KEF');
    expect(res.childBatch.bornAs).toBe('receive');
    expect(Number(res.parentBatch.remainingTon)).toBeCloseTo(3.6, 5); // 6 - 2.4
  });

  it('receive: rejects if receiveWeight > dispatchWeight', async () => {
    const parentOre = await seedOreAt('JSS', 10, 'GL');
    const { talcBatch } = await talc.process({
      parentOreBatchId: parentOre.id,
      stationCode: 'JSS',
      gradeCode: 'TL1',
      oreDeltaTon: 5,
      talcCreatedTon: 3
    });
    const edge = await talc.dispatch({
      parentBatchId: talcBatch.id,
      toStation: 'PSS',
      dispatchWeight: 2,
      dispatchGrade: 'TL1'
    });

    await expect(talc.receive({ edgeId: edge.id, receiveWeight: 3 })).rejects.toMatchObject({
      code: 'E_EXCEEDS'
    });
  });

  it('getEdge: returns the right talc edge', async () => {
    const parentOre = await seedOreAt('JSS', 10, 'GL');
    const { talcBatch } = await talc.process({
      parentOreBatchId: parentOre.id,
      stationCode: 'JSS',
      gradeCode: 'TL1',
      oreDeltaTon: 5,
      talcCreatedTon: 3
    });
    const edge = await talc.dispatch({
      parentBatchId: talcBatch.id,
      toStation: 'PSS',
      dispatchWeight: 1,
      dispatchGrade: 'TL1'
    });

    const found = await talc.getEdge(edge.id);
    expect(found?.id).toBe(edge.id);
    expect(found?.status).toBe('in_transit');
  });
});
