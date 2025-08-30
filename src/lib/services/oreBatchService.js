
// src/lib/services/oreBatch.service.js
/**
 * Ore Batches + Edges (new tables only).
 * - deposit: create deposit-born ore batch
 * - dispatch: allocate qty from existing ore batches (creates oreEdge 'dispatch' rows)
 * - unload: create unload-born ore batch + oreEdge 'unload' rows from sources to child
 *
 * @param {import('@prisma/client').PrismaClient} db
 * @param {{ epsilon?: number, now?: () => Date }} [cfg]
 */
export function createOreBatchService(db, cfg = {}) {
    if (!db) throw new Error('Prisma client required');
    const EPS = cfg.epsilon ?? 1e-3;
    const now = cfg.now ?? (() => new Date());
  
    // ---- helpers -------------------------------------------------------------
  
    async function _fetchOpenBatchOrThrow(id, stationCode = null) {
      const b = await db.oreBatch.findUnique({ where: { id: Number(id) } });
      if (!b) throw Object.assign(new Error(`oreBatch ${id} not found`), { code: 'E_NOT_FOUND' });
      if (!(b.remainingTon > EPS))
        throw Object.assign(new Error(`oreBatch ${id} has no remaining`), { code: 'E_DEPLETED' });
      if (stationCode && b.stationCode !== stationCode)
        throw Object.assign(new Error(`oreBatch ${id} station mismatch`), { code: 'E_STATION' });
      return b;
    }
  
    async function _decreaseRemainingOrClose(batchId, delta) {
      // delta > 0 means 'consume'
      const b = await db.oreBatch.update({
        where: { id: batchId },
        data: { remainingTon: { decrement: delta } },
        select: { id: true, remainingTon: true }
      });
      if (b.remainingTon <= EPS) {
        await db.oreBatch.update({
          where: { id: batchId },
          data: { remainingTon: 0, closedAt: now() }
        });
      }
    }
  
    // ---- public API ----------------------------------------------------------
  
    /**
     * Create a deposit-born ore batch (root).
     * @param {{stationCode: import('@prisma/client').StationCode, gradeCode: string, weightTon: number, supplierId?: number, truckNo?: string, depositedAt?: Date}} v
     */
    async function deposit(v) {
      const createdTon = Number(v.weightTon);
      if (!(createdTon > 0)) throw Object.assign(new Error('weightTon must be > 0'), { code: 'E_BAD_FIELD' });
  
      return db.oreBatch.create({
        data: {
          stationCode: v.stationCode,
          gradeCode: String(v.gradeCode).toUpperCase(),
          createdTon,
          remainingTon: createdTon,
          bornAs: 'deposit',
          supplierId: v.supplierId ?? null,
          truckNo: v.truckNo ?? null,
          depositedAt: v.depositedAt ?? now()
        }
      });
    }
  
    /**
     * Dispatch = allocate quantities out of specific parent batches.
     * Creates one oreEdge('dispatch') per allocation and decrements remaining.
     *
     * @param {{ allocations: Array<{ parentBatchId: number, qtyTon: number }> }} v
     *        (No destination here; unload will create the child batch)
     */
    async function dispatch(v) {
      if (!Array.isArray(v.allocations) || v.allocations.length === 0)
        throw Object.assign(new Error('allocations required'), { code: 'E_MISSING' });
  
      return db.$transaction(async (tx) => {
        for (const a of v.allocations) {
          const qty = Number(a.qtyTon);
          if (!(qty > 0)) throw Object.assign(new Error('qtyTon must be > 0'), { code: 'E_BAD_FIELD' });
  
          const batch = await _fetchOpenBatchOrThrow(a.parentBatchId);
  
          // Prevent negative remaining
          if (batch.remainingTon - qty < -EPS) {
            throw Object.assign(
              new Error(`allocation exceeds remaining on batch ${batch.id}`),
              { code: 'E_NEGATIVE' }
            );
          }
  
          // 1) write edge
          await tx.oreEdge.create({
            data: {
              event: 'dispatch',
              createdAt: now(),
              parentBatchId: batch.id,
              deltaTon: qty
            }
          });
  
          // 2) decrement remaining (and close if needed)
          await tx.oreBatch.update({
            where: { id: batch.id },
            data: { remainingTon: { decrement: qty } }
          });
        }
  
        // auto-close any batches that crossed EPS
        const toClose = await tx.oreBatch.findMany({
          where: { remainingTon: { lte: EPS }, closedAt: null },
          select: { id: true }
        });
        for (const b of toClose) {
          await tx.oreBatch.update({ where: { id: b.id }, data: { remainingTon: 0, closedAt: now() } });
        }
        return { ok: true, edges: v.allocations.length };
      });
    }
  
    /**
     * Unload = create a new child batch at a station, and write 'unload' edges
     * from each source parent batch into the new child.
     *
     * @param {{ stationCode: import('@prisma/client').StationCode,
     *           gradeCode: string,
     *           receipts: Array<{ parentBatchId: number, qtyTon: number }> }} v
     * @returns {{ childBatchId: number }}
     */
    async function unload(v) {
      if (!Array.isArray(v.receipts) || v.receipts.length === 0)
        throw Object.assign(new Error('receipts required'), { code: 'E_MISSING' });
  
      const total = v.receipts.reduce((s, r) => s + Number(r.qtyTon || 0), 0);
      if (!(total > 0)) throw Object.assign(new Error('total received must be > 0'), { code: 'E_BAD_FIELD' });
  
      return db.$transaction(async (tx) => {
        // 1) create child batch at destination
        const child = await tx.oreBatch.create({
          data: {
            stationCode: v.stationCode,
            gradeCode: String(v.gradeCode).toUpperCase(),
            createdTon: total,
            remainingTon: total,
            bornAs: 'unload',
            createdAt: now()
          }
        });
  
        // 2) write 'unload' edges from each parent -> child
        for (const r of v.receipts) {
          const qty = Number(r.qtyTon);
          if (!(qty > 0)) continue;
  
          // parent existence check (no remaining change here; it was decreased at dispatch time)
          const parent = await tx.oreBatch.findUnique({ where: { id: Number(r.parentBatchId) } });
          if (!parent) throw Object.assign(new Error(`parent oreBatch ${r.parentBatchId} not found`), { code: 'E_NOT_FOUND' });
  
          await tx.oreEdge.create({
            data: {
              event: 'unload',
              createdAt: now(),
              parentBatchId: parent.id,
              childBatchId: child.id,
              deltaTon: qty
            }
          });
        }
  
        return { childBatchId: child.id };
      });
    }
  
    /** List open (remaining > EPS and not closed) ore batches by station (optional). */
    async function openBatches(stationCode = null) {
      return db.oreBatch.findMany({
        where: {
          ...(stationCode ? { stationCode } : {}),
          remainingTon: { gt: EPS },
          OR: [{ closedAt: null }, { closedAt: { equals: null } }]
        },
        orderBy: [{ stationCode: 'asc' }, { createdAt: 'asc' }]
      });
    }
  
    /** Station stock view = Σ remaining of open batches at that station. */
    async function stationStock(stationCode) {
      const agg = await db.oreBatch.aggregate({
        _sum: { remainingTon: true },
        where: { stationCode, remainingTon: { gt: EPS } }
      });
      return { stationCode, remainingTon: Number(agg._sum.remainingTon || 0) };
    }
  
    /** Inspect a batch and its lineage (edges in/out). */
    async function batchWithEdges(id) {
      const batch = await db.oreBatch.findUnique({ where: { id: Number(id) } });
      if (!batch) throw Object.assign(new Error('batch not found'), { code: 'E_NOT_FOUND' });
  
      const [out, inn] = await Promise.all([
        db.oreEdge.findMany({ where: { parentBatchId: batch.id }, orderBy: { createdAt: 'asc' } }),
        db.oreEdge.findMany({ where: { childBatchId: batch.id }, orderBy: { createdAt: 'asc' } })
      ]);
  
      return { batch, edgesOut: out, edgesIn: inn };
    }
  
    return { deposit, dispatch, unload, openBatches, stationStock, batchWithEdges };
  }
  