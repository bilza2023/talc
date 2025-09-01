// src/lib/services/oreService.js
/**
 * Ore service — deposit → dispatch → receive (+ helpers)
 * @param {import('@prisma/client').PrismaClient} db
 */
export default function createOreService(db) {
  if (!db) throw Object.assign(new Error('Prisma client required'), { code: 'E_PRISMA_REQUIRED' });

  const log = async (type, metadata) => {
    try { await db.log.create({ data: { type, metadata } }); } catch {}
  };
  const upper = (s) => String(s ?? '').toUpperCase();

  /** Create an ore batch from external supplier (no edge). */
  async function deposit({ stationCode, gradeCode, createdTon, supplierId = null, depositedAt = null }) {
    if (!stationCode) throw Object.assign(new Error('stationCode required'), { code: 'E_MISSING' });
    if (!(Number(createdTon) > 0)) throw Object.assign(new Error('createdTon > 0 required'), { code: 'E_BAD' });
    if (!gradeCode) throw Object.assign(new Error('gradeCode required'), { code: 'E_MISSING' });

    const data = {
      stationCode,
      gradeCode: upper(gradeCode),
      bornAs: 'deposit',
      createdTon: Number(createdTon),
      remainingTon: Number(createdTon),
      supplierId: supplierId ? Number(supplierId) : null,
      depositedAt: depositedAt ? new Date(depositedAt) : null,
    };

    const batch = await db.oreBatch.create({ data });
    await log('ORE_DEPOSIT', { batchId: batch.id, ...data });
    return batch;
  }

  /** Dispatch ore from a parent batch: create in-transit edge (no child yet). */
  async function dispatch({
    parentBatchId, toStation, dispatchWeight, dispatchGrade,
    truckNo = null, amount = null, dispatchedAt = null, dispatchedBy = null
  }) {
    const parentId = Number(parentBatchId);
    const parent = await db.oreBatch.findUnique({ where: { id: parentId } });
    if (!parent) throw Object.assign(new Error('Parent batch not found'), { code: 'E_NOT_FOUND' });

    if (!toStation) throw Object.assign(new Error('toStation required'), { code: 'E_MISSING' });
    const dWeight = Number(dispatchWeight);
    if (!(dWeight > 0)) throw Object.assign(new Error('dispatchWeight > 0'), { code: 'E_BAD' });
    const dGrade = upper(dispatchGrade);
    if (!dGrade) throw Object.assign(new Error('dispatchGrade required'), { code: 'E_MISSING' });

    // Over-dispatch guard: sum of in-transit dispatchWeight + new dispatch ≤ remainingTon
    const agg = await db.oreEdge.aggregate({
      _sum: { dispatchWeight: true },
      where: { parentBatchId: parentId, status: 'in_transit' }
    });
    const committed = Number(agg._sum.dispatchWeight || 0);
    if (committed + dWeight > Number(parent.remainingTon)) {
      throw Object.assign(new Error('Insufficient available ton on parent'), { code: 'E_OVERDISPATCH' });
    }

    const data = {
      status: 'in_transit',
      fromStation: parent.stationCode,
      toStation,
      truckNo: truckNo ?? null,
      amount: amount != null ? Number(amount) : null,
      dispatchWeight: dWeight,
      dispatchGrade: dGrade,
      dispatchedAt: dispatchedAt ? new Date(dispatchedAt) : null,
      dispatchedBy: dispatchedBy ?? null,
      parentBatchId: parentId,
      childBatchId: null
    };

    const edge = await db.oreEdge.create({ data });
    await log('ORE_DISPATCH', { edgeId: edge.id, parentBatchId: parentId, ...data });
    return edge;
  }

  /** Receive a dispatched edge: create child batch, complete edge, deduct parent. */
  async function receive({ edgeId, receiveWeight, receiveGrade = null, receivedAt = null, receivedBy = null }) {
    const id = Number(edgeId);
    const edge = await db.oreEdge.findUnique({ where: { id } });
    if (!edge) throw Object.assign(new Error('Edge not found'), { code: 'E_NOT_FOUND' });
    if (edge.status !== 'in_transit') throw Object.assign(new Error('Edge not in transit'), { code: 'E_BAD_STATUS' });

    const rWeight = Number(receiveWeight);
    if (!(rWeight > 0)) throw Object.assign(new Error('receiveWeight > 0'), { code: 'E_BAD' });
    if (rWeight > Number(edge.dispatchWeight)) {
      throw Object.assign(new Error('receiveWeight cannot exceed dispatchWeight'), { code: 'E_EXCEEDS' });
    }

    const parent = await db.oreBatch.findUnique({ where: { id: edge.parentBatchId } });
    if (!parent) throw Object.assign(new Error('Parent batch not found'), { code: 'E_NOT_FOUND' });

    const rGrade = receiveGrade ? upper(receiveGrade) : edge.dispatchGrade;

    const [updatedEdge, childBatch, updatedParent] = await db.$transaction(async (tx) => {
      // Create child batch at destination
      const child = await tx.oreBatch.create({
        data: {
          stationCode: edge.toStation,
          gradeCode: rGrade,
          bornAs: 'receive',
          createdTon: rWeight,
          remainingTon: rWeight
        }
      });

      // Complete edge
      const e = await tx.oreEdge.update({
        where: { id },
        data: {
          status: 'received',
          receiveWeight: rWeight,
          receiveGrade: rGrade,
          receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
          receivedBy: receivedBy ?? null,
          childBatchId: child.id
        }
      });

      // Deduct from parent
      const newRemain = Number(parent.remainingTon) - rWeight;
      const p = await tx.oreBatch.update({
        where: { id: parent.id },
        data: { remainingTon: newRemain, ...(newRemain === 0 ? { closedAt: new Date() } : {}) }
      });

      return [e, child, p];
    });

    await log('ORE_RECEIVE', {
      edgeId: updatedEdge.id, parentBatchId: parent.id, childBatchId: childBatch.id,
      receiveWeight: rWeight, varianceTon: Number(edge.dispatchWeight) - rWeight
    });

    return { edge: updatedEdge, childBatch, parentBatch: updatedParent };
  }

  /** Cancel an in-transit edge (no stock effect). */
  async function cancel({ edgeId, cancelledBy = null, reason = null }) {
    const id = Number(edgeId);
    const edge = await db.oreEdge.findUnique({ where: { id } });
    if (!edge) throw Object.assign(new Error('Edge not found'), { code: 'E_NOT_FOUND' });
    if (edge.status !== 'in_transit') throw Object.assign(new Error('Only in_transit can be cancelled'), { code: 'E_BAD_STATUS' });

    const row = await db.oreEdge.update({ where: { id }, data: { status: 'cancelled' } });
    await log('EDGE_CANCELLED', { material: 'ore', edgeId: id, cancelledBy, reason });
    return row;
  }

  // ---------- Lookups ----------

  async function getBatch(id) { return db.oreBatch.findUnique({ where: { id: Number(id) } }); }
  async function getEdge(id)  { return db.oreEdge.findUnique({ where: { id: Number(id) } }); }

  async function listIncomingEdges(toStation) {
    return db.oreEdge.findMany({
      where: { status: 'in_transit', toStation },
      orderBy: { createdAt: 'desc' }
    });
  }

  async function listOutgoingsByBatch(parentBatchId) {
    return db.oreEdge.findMany({
      where: { parentBatchId: Number(parentBatchId) },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
    });
  }

  /** Station stock = sum of remainingTon from batches at station. */
  async function getStationStock(stationCode) {
    const agg = await db.oreBatch.aggregate({
      _sum: { remainingTon: true },
      where: { stationCode }
    });
    return { stationCode, remainingTon: Number(agg._sum.remainingTon || 0) };
  }

  /** Quick overview for dashboards. */
  async function overview() {
    const [depAgg, recvAgg, inAgg] = await Promise.all([
      db.oreBatch.aggregate({ _sum: { createdTon: true }, where: { bornAs: 'deposit' } }),
      db.oreEdge.aggregate({ _sum: { receiveWeight: true }, where: { status: 'received' } }),
      db.oreEdge.aggregate({ _sum: { dispatchWeight: true }, _count: { _all: true }, where: { status: 'in_transit' } })
    ]);
    return {
      depositsTon:  Number(depAgg._sum.createdTon || 0),
      receivedTon:  Number(recvAgg._sum.receiveWeight || 0),
      inTransitTon: Number(inAgg._sum.dispatchWeight || 0),
      inTransitCount: Number(inAgg._count?._all || 0)
    };
  }

  /** Group in-transit/received by truck (ore edges). */
  async function groupByTruck({ dateFrom = null, dateTo = null } = {}) {
    const whereBase = {
      truckNo: { not: null },
      ...(dateFrom || dateTo
        ? { dispatchedAt: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } }
        : {})
    };

    const agg = await db.oreEdge.groupBy({
      by: ['truckNo'],
      where: whereBase,
      _sum: { dispatchWeight: true, receiveWeight: true },
      _count: { _all: true },
      _max: { dispatchedAt: true }
    });

    const recvd = await db.oreEdge.findMany({
      where: { ...whereBase, status: 'received' },
      select: { truckNo: true, dispatchedAt: true, receivedAt: true }
    });

    const dur = new Map();
    for (const r of recvd) {
      if (!r.dispatchedAt || !r.receivedAt) continue;
      const hrs = (new Date(r.receivedAt) - new Date(r.dispatchedAt)) / 3_600_000;
      const cur = dur.get(r.truckNo) || { sumHrs: 0, n: 0 };
      cur.sumHrs += hrs; cur.n += 1;
      dur.set(r.truckNo, cur);
    }

    return agg.map((r) => {
      const m = dur.get(r.truckNo) || { sumHrs: 0, n: 0 };
      return {
        material: 'ore',
        truckNo: r.truckNo,
        tripsCount: r._count?._all || 0,
        totalDispatchTon: Number(r._sum?.dispatchWeight || 0),
        totalReceiveTon: Number(r._sum?.receiveWeight || 0),
        avgTurnaroundHrs_sum: m.sumHrs,
        avgTurnaroundHrs_n: m.n,
        lastTripAt: r._max?.dispatchedAt || null
      };
    });
  }

  async function listStationBatches(stationCode, { openOnly = true } = {}) {
    return db.oreBatch.findMany({
      where: { stationCode, ...(openOnly ? { remainingTon: { gt: 0 } } : {}) },
      orderBy: [{ createdAt: 'desc' }],
      select: {
        id: true, stationCode: true, gradeCode: true,
        createdTon: true, remainingTon: true,
        depositedAt: true, createdAt: true
      }
    });
  }
  
  

  return {
    // actions
    deposit, dispatch, receive, cancel,
    // lookups
    getBatch, getEdge, listIncomingEdges, listOutgoingsByBatch, getStationStock, overview, groupByTruck,
    
    listStationBatches
  };
}
