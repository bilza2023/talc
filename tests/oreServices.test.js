// tests/oreServices.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import createOreService from '../src/lib/services/oreServices.js';

describe.sequential('Ore Services', () => {
  let db;
  let ore;

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
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  beforeEach(async () => {
    await wipeDb();
  });

  async function seedSupplier() {
    return db.supplier.create({
      data: {
        code: `SUP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: 'Test Supplier'
      }
    });
  }

  it('deposit: creates oreBatch and logs ORE_DEPOSIT', async () => {
    const sup = await seedSupplier();

    const row = await ore.deposit({
      stationCode: 'JSS',
      gradeCode: 'wc', // normalized to WC
      createdTon: 88.5,
      supplierId: sup.id
    });

    expect(row).toBeTruthy();
    expect(row.stationCode).toBe('JSS');
    expect(row.gradeCode).toBe('WC');
    expect(Number(row.createdTon)).toBeCloseTo(88.5, 5);
    expect(Number(row.remainingTon)).toBeCloseTo(88.5, 5);
    expect(row.bornAs).toBe('deposit');
    expect(row.supplierId).toBe(sup.id);

    const logs = await db.log.findMany({ where: { type: 'ORE_DEPOSIT' } });
    expect(logs.length).toBe(1);
    expect(logs[0].metadata.batchId).toBe(row.id);
  });

  it('dispatch: creates in_transit oreEdge from a parent batch and logs ORE_DISPATCH', async () => {
    const parent = await ore.deposit({ stationCode: 'JSS', gradeCode: 'GL', createdTon: 25 });

    const edge = await ore.dispatch({
      parentBatchId: parent.id,
      toStation: 'PSS',
      dispatchWeight: 12,
      dispatchGrade: 'gl', // normalized to GL
      truckNo: 'TR-777'
    });

    expect(edge).toBeTruthy();
    expect(edge.status).toBe('in_transit');
    expect(edge.fromStation).toBe('JSS');
    expect(edge.toStation).toBe('PSS');
    expect(edge.parentBatchId).toBe(parent.id);
    expect(edge.childBatchId).toBeNull();
    expect(edge.dispatchGrade).toBe('GL');
    expect(Number(edge.dispatchWeight)).toBeCloseTo(12, 5);

    const logs = await db.log.findMany({ where: { type: 'ORE_DISPATCH' } });
    expect(logs.length).toBe(1);
    expect(logs[0].metadata.edgeId).toBe(edge.id);
  });

  it('listIncomingEdges: filters in-transit edges by destination station', async () => {
    const parent = await ore.deposit({ stationCode: 'JSS', gradeCode: 'GL', createdTon: 40 });
    const a = await ore.dispatch({
      parentBatchId: parent.id,
      toStation: 'PSS',
      dispatchWeight: 5,
      dispatchGrade: 'GL',
      truckNo: 'T-A'
    });
    const b = await ore.dispatch({
      parentBatchId: parent.id,
      toStation: 'KEF',
      dispatchWeight: 6,
      dispatchGrade: 'GL',
      truckNo: 'T-B'
    });
    expect(a && b).toBeTruthy();

    const onlyPSS = await ore.listIncomingEdges('PSS');
    expect(onlyPSS.length).toBe(1);
    expect(onlyPSS[0].id).toBe(a.id);

    const all = await ore.listIncomingEdges();
    expect(all.length).toBe(2);
  });

  it('receive: happy path creates child batch, completes edge, deducts parent, logs ORE_RECEIVE', async () => {
    const parent = await ore.deposit({ stationCode: 'JSS', gradeCode: 'WL', createdTon: 20 });
    const edge = await ore.dispatch({
      parentBatchId: parent.id,
      toStation: 'PSS',
      dispatchWeight: 14.2,
      dispatchGrade: 'WL',
      truckNo: 'TR-999'
    });

    const res = await ore.receive({
      edgeId: edge.id,
      receiveWeight: 14.0,
      receiveGrade: 'wl',
      receivedBy: 'Ali'
    });

    expect(res.edge.status).toBe('received');
    expect(Number(res.edge.receiveWeight)).toBeCloseTo(14.0, 5);
    expect(res.edge.receiveGrade).toBe('WL');
    expect(res.childBatch.stationCode).toBe('PSS');
    expect(res.childBatch.bornAs).toBe('receive');
    expect(Number(res.childBatch.createdTon)).toBeCloseTo(14.0, 5);
    expect(Number(res.parentBatch.remainingTon)).toBeCloseTo(6.0, 5);

    const logs = await db.log.findMany({ where: { type: 'ORE_RECEIVE' } });
    expect(logs.length).toBe(1);
    expect(logs[0].metadata.edgeId).toBe(edge.id);
    expect(logs[0].metadata.childBatchId).toBe(res.childBatch.id);
  });

  it('receive: rejects if receiveWeight > dispatchWeight', async () => {
    const parent = await ore.deposit({ stationCode: 'JSS', gradeCode: 'GF', createdTon: 10 });
    const edge = await ore.dispatch({
      parentBatchId: parent.id,
      toStation: 'KEF',
      dispatchWeight: 4,
      dispatchGrade: 'GF'
    });

    await expect(ore.receive({ edgeId: edge.id, receiveWeight: 4.5 })).rejects.toMatchObject({
      code: 'E_EXCEEDS'
    });
  });

  it('getEdge: returns the right row', async () => {
    const parent = await ore.deposit({ stationCode: 'JSS', gradeCode: 'WF', createdTon: 9 });
    const edge = await ore.dispatch({
      parentBatchId: parent.id,
      toStation: 'PSS',
      dispatchWeight: 3,
      dispatchGrade: 'WF'
    });

    const found = await ore.getEdge(edge.id);
    expect(found?.id).toBe(edge.id);
    expect(found?.status).toBe('in_transit');
  });
});
