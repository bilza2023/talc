// src/lib/services/talcService.js
/**
 * Talc service — process → dispatch → receive (+ helpers)
 * @param {import('@prisma/client').PrismaClient} db
 */
export default function createTalcService(db) {
  if (!db) throw Object.assign(new Error('Prisma client required'), { code: 'E_PRISMA_REQUIRED' });

  const log = async (type, metadata) => {
    try { await db.log.create({ data: { type, metadata } }); } catch {}
  };
  const upper = (s) => String(s ?? '').toUpperCase();

  /** Process ore into talc: create talc batch, link with processEdge, deduct ore. */
  async function process({
    parentOreBatchId,
    stationCode, gradeCode,
    oreDeltaTon, talcCreatedTon,
    talcDeltaTon = null, runKey = null, processAt = null
  }) {
    const parentId = Number(parentOreBatchId);
    const parent = await db.oreBatch.findUnique({ where: { id: parentId } });
    if (!parent) throw Object.assign(new Error('Parent ore batch not found'), { code: 'E_NOT_FOUND' });

    if (!stationCode) throw Object.assign(new Error('stationCode required'), { code: 'E_MISSING' });
    if (!gradeCode) throw Object.assign(new Error('gradeCode required'), { code: 'E_MISSING' });
    const oTon = Number(oreDeltaTon);
    const tTon = Number(talcCreatedTon);
    if (!(oTon > 0)) throw Object.assign(new Error('oreDeltaTon > 0'), { code: 'E_BAD' });
    if (!(tTon > 0)) throw Object.assign(new Error('talcCreatedTon > 0'), { code: 'E_BAD' });
    if (oTon > Number(parent.remainingTon)) {
      throw Object.assign(new Error('Insufficient ore remainingTon'), { code: 'E_STOCK' });
    }

    const [childTalc, procEdge, updatedParent] = await db.$transaction(async (tx) => {
      // Create talc batch born from processing
      const child = await tx.talcBatch.create({
        data: {
          stationCode,
          gradeCode: upper(gradeCode),
          bornAs: 'process',
          createdTon: tTon,
          remainingTon: tTon
        }
      });

      // Link via processEdge
      const edge = await tx.processEdge.create({
        data: {
          parentOreBatchId: parentId,
          childTalcBatchId: child.id,
          oreDeltaTon: oTon,
          talcDeltaTon: talcDeltaTon != null ? Number(talcDeltaTon) : null,
          runKey: runKey ?? null,
          processAt: processAt ? new Date(processAt) : undefined
        }
      });

      // Deduct ore
      const newRemain = Number(parent.remainingTon) - oTon;
      const p = await tx.oreBatch.update({
        where: { id: parent.id },
        data: { remainingTon: newRemain, ...(newRemain === 0 ? { closedAt: new Date() } : {}) }
      });

      return [child, edge, p];
    });

    await log('TALC_PROCESS', {
      childTalcBatchId: childTalc.id,
      parentOreBatchId: parent.id,
      oreDeltaTon: oTon,
      talcCreatedTon: tTon,
      runKey
    });

    return { talcBatch: childTalc, processEdge: procEdge, parentOreBatch: updatedParent };
  }

  /** Dispatch talc from a parent talc batch: create in-transit edge. */
  async function dispatch({
    parentBatchId, toStation, dispatchWeight, dispatchGrade,
    truckNo = null, amount = null, dispatchedAt = null, dispatchedBy = null
  }) {
    const parentId = Number(parentBatchId);
    const parent = await db.talcBatch.findUnique({ where: { id: parentId } });
    if (!parent) throw Object.assign(new Error('Parent talc batch not found'), { code: 'E_NOT_FOUND' });

    if (!toStation) throw Object.assign(new Error('toStation required'), { code: 'E_MISSING' });
    const dWeight = Number(dispatchWeight);
    if (!(dWeight > 0)) throw Object.assign(new Error('dispatchWeight > 0'), { code: 'E_BAD' });
    const dGrade = upper(dispatchGrade);
    if (!dGrade) throw Object.assign(new Error('dispatchGrade required'), { code: 'E_MISSING' });

    // Over-dispatch guard
    const agg = await db.talcEdge.aggregate({
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

    const edge = await db.talcEdge.create({ data });
    await log('TALC_DISPATCH', { edgeId: edge.id, parentBatchId: parentId, ...data });
    return edge;
  }

  /** Receive talc: create child talc batch, complete edge, deduct parent. */
  async function receive({ edgeId, receiveWeight, receiveGrade = null, receivedAt = null, receivedBy = null }) {
    const id = Number(edgeId);
    const edge = await db.talcEdge.findUnique({ where: { id } });
    if (!edge) throw Object.assign(new Error('Edge not found'), { code: 'E_NOT_FOUND' });
    if (edge.status !== 'in_transit') throw Object.assign(new Error('Edge not in transit'), { code: 'E_BAD_STATUS' });

    const rWeight = Number(receiveWeight);
    if (!(rWeight > 0)) throw Object.assign(new Error('receiveWeight > 0'), { code: 'E_BAD' });
    if (rWeight > Number(edge.dispatchWeight)) {
      throw Object.assign(new Error('receiveWeight cannot exceed dispatchWeight'), { code: 'E_EXCEEDS' });
    }

    const parent = await db.talcBatch.findUnique({ where: { id: edge.parentBatchId } });
    if (!parent) throw Object.assign(new Error('Parent talc batch not found'), { code: 'E_NOT_FOUND' });

    const rGrade = receiveGrade ? upper(receiveGrade) : edge.dispatchGrade;

    const [updatedEdge, childBatch, updatedParent] = await db.$transaction(async (tx) => {
      // Create child talc batch at destination
      const child = await tx.talcBatch.create({
        data: {
          stationCode: edge.toStation,
          gradeCode: rGrade,
          bornAs: 'receive',
          createdTon: rWeight,
          remainingTon: rWeight
        }
      });

      // Complete edge
      const e = await tx.talcEdge.update({
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
      const p = await tx.talcBatch.update({
        where: { id: parent.id },
        data: { remainingTon: newRemain, ...(newRemain === 0 ? { closedAt: new Date() } : {}) }
      });

      return [e, child, p];
    });

    await log('TALC_RECEIVE', {
      edgeId: updatedEdge.id, parentBatchId: parent.id, childBatchId: childBatch.id,
      receiveWeight: rWeight, varianceTon: Number(edge.dispatchWeight) - rWeight
    });

    return { edge: updatedEdge, childBatch, parentBatch: updatedParent };
  }

  /** Cancel an in-transit talc edge. */
  async function cancel({ edgeId, cancelledBy = null, reason = null }) {
    const id = Number(edgeId);
    const edge = await db.talcEdge.findUnique({ where: { id } });
    if (!edge) throw Object.assign(new Error('Edge not found'), { code: 'E_NOT_FOUND' });
    if (edge.status !== 'in_transit') throw Object.assign(new Error('Only in_transit can be cancelled'), { code: 'E_BAD_STATUS' });

    const row = await db.talcEdge.update({ where: { id }, data: { status: 'cancelled' } });
    await log('EDGE_CANCELLED', { material: 'talc', edgeId: id, cancelledBy, reason });
    return row;
  }

  // ---------- Lookups ----------

  async function getBatch(id) { return db.talcBatch.findUnique({ where: { id: Number(id) } }); }
  async function getEdge(id)  { return db.talcEdge.findUnique({ where: { id: Number(id) } }); }

  async function listIncomingEdges(toStation) {
    return db.talcEdge.findMany({
      where: { status: 'in_transit', toStation },
      orderBy: { createdAt: 'desc' }
    });
  }

  async function listOutgoingsByBatch(parentBatchId) {
    return db.talcEdge.findMany({
      where: { parentBatchId: Number(parentBatchId) },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
    });
  }

  /** Station stock = sum of remainingTon from talc batches at station. */
  async function getStationStock(stationCode) {
    const agg = await db.talcBatch.aggregate({
      _sum: { remainingTon: true },
      where: { stationCode }
    });
    return { stationCode, remainingTon: Number(agg._sum.remainingTon || 0) };
  }

  /** Quick overview for dashboards. */
  async function overview() {
    const [recvAgg, inAgg] = await Promise.all([
      db.talcEdge.aggregate({ _sum: { receiveWeight: true }, where: { status: 'received' } }),
      db.talcEdge.aggregate({ _sum: { dispatchWeight: true }, _count: { _all: true }, where: { status: 'in_transit' } })
    ]);
    return {
      receivedTon:  Number(recvAgg._sum.receiveWeight || 0),
      inTransitTon: Number(inAgg._sum.dispatchWeight || 0),
      inTransitCount: Number(inAgg._count?._all || 0)
    };
  }

  /** Group talc moves by truck. */
  async function groupByTruck({ dateFrom = null, dateTo = null } = {}) {
    const whereBase = {
      truckNo: { not: null },
      ...(dateFrom || dateTo
        ? { dispatchedAt: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } }
        : {})
    };

    const agg = await db.talcEdge.groupBy({
      by: ['truckNo'],
      where: whereBase,
      _sum: { dispatchWeight: true, receiveWeight: true },
      _count: { _all: true },
      _max: { dispatchedAt: true }
    });

    const recvd = await db.talcEdge.findMany({
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
        material: 'talc',
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

  return {
    // actions
    process, dispatch, receive, cancel,
    // lookups
    getBatch, getEdge, listIncomingEdges, listOutgoingsByBatch, getStationStock, overview, groupByTruck
  };
}
