// src/lib/services/talcBatch.service.js
/**
 * Talc Batches + Edges + Process (new tables only).
 * - process: consume ore batches, create ONE talc batch (single-output run),
 *            and write processEdge rows; decreases ore.remainingTon accordingly.
 * - dispatch/unload: same-material talc movement (talcEdge).
 *
 * @param {import('@prisma/client').PrismaClient} db
 * @param {{ epsilon?: number, now?: () => Date }} [cfg]
 */
export function createTalcBatchService(db, cfg = {}) {
    if (!db) throw new Error('Prisma client required');
    const EPS = cfg.epsilon ?? 1e-3;
    const now = cfg.now ?? (() => new Date());
  
    // ---- helpers -------------------------------------------------------------
  
    async function _fetchOpenOreBatchOrThrow(id) {
      const b = await db.oreBatch.findUnique({ where: { id: Number(id) } });
      if (!b) throw Object.assign(new Error(`oreBatch ${id} not found`), { code: 'E_NOT_FOUND' });
      if (!(b.remainingTon > EPS))
        throw Object.assign(new Error(`oreBatch ${id} has no remaining`), { code: 'E_DEPLETED' });
      return b;
    }
  
    async function _decreaseOreRemainingOrClose(batchId, delta) {
      const b = await db.oreBatch.update({
        where: { id: batchId },
        data: { remainingTon: { decrement: delta } },
        select: { id: true, remainingTon: true }
      });
      if (b.remainingTon <= EPS) {
        await db.oreBatch.update({
          where: { id: b.id },
          data: { remainingTon: 0, closedAt: now() }
        });
      }
    }
  
    // ---- public API ----------------------------------------------------------
  
    /**
     * PROCESS (single-output): consume ore inputs, create one talc batch.
     * Writes `processEdge` rows from each ore input -> talc batch.
     *
     * @param {{
     *   stationCode: import('@prisma/client').StationCode,
     *   talcGradeCode: string,
     *   talcCreatedTon: number,
     *   inputs: Array<{ oreBatchId: number, qtyOreTon: number }>,
     *   runKey?: string
     * }} v
     * @returns {{ talcBatchId: number }}
     */
    async function process(v) {
      if (!Array.isArray(v.inputs) || v.inputs.length === 0)
        throw Object.assign(new Error('inputs required'), { code: 'E_MISSING' });
  
      const talcCreatedTon = Number(v.talcCreatedTon);
      if (!(talcCreatedTon > 0))
        throw Object.assign(new Error('talcCreatedTon must be > 0'), { code: 'E_BAD_FIELD' });
  
      // total ore consumed
      const totalOre = v.inputs.reduce((s, i) => s + Number(i.qtyOreTon || 0), 0);
      if (!(totalOre > 0))
        throw Object.assign(new Error('sum of ore inputs must be > 0'), { code: 'E_BAD_FIELD' });
  
      return db.$transaction(async (tx) => {
        // 1) Validate & consume ore inputs
        const inputs = [];
        for (const i of v.inputs) {
          const qty = Number(i.qtyOreTon);
          if (!(qty > 0)) continue;
  
          const ob = await tx.oreBatch.findUnique({ where: { id: Number(i.oreBatchId) } });
          if (!ob) throw Object.assign(new Error(`oreBatch ${i.oreBatchId} not found`), { code: 'E_NOT_FOUND' });
          if (ob.remainingTon - qty < -EPS)
            throw Object.assign(new Error(`oreBatch ${ob.id} insufficient remaining`), { code: 'E_NEGATIVE' });
  
          // decrement immediately (authoritative)
          await tx.oreBatch.update({ where: { id: ob.id }, data: { remainingTon: { decrement: qty } } });
          inputs.push({ oreBatchId: ob.id, qtyOreTon: qty });
        }
  
        // auto-close any depleted ore inputs
        const toClose = await tx.oreBatch.findMany({
          where: { remainingTon: { lte: EPS }, closedAt: null },
          select: { id: true }
        });
        for (const b of toClose) {
          await tx.oreBatch.update({ where: { id: b.id }, data: { remainingTon: 0, closedAt: now() } });
        }
  
        // 2) Create the talc batch (bornAs=process)
        const talc = await tx.talcBatch.create({
          data: {
            stationCode: v.stationCode,
            gradeCode: String(v.talcGradeCode).toUpperCase(),
            createdTon: talcCreatedTon,
            remainingTon: talcCreatedTon,
            bornAs: 'process',
            createdAt: now()
          }
        });
  
        // 3) Write processEdge rows with proportional talc share (optional)
        for (const i of inputs) {
          const share = (i.qtyOreTon / totalOre) * talcCreatedTon; // for recovery math
          await tx.processEdge.create({
            data: {
              processAt: now(),
              parentOreBatchId: i.oreBatchId,
              childTalcBatchId: talc.id,
              oreDeltaTon: i.qtyOreTon,
              talcDeltaTon: share,
              runKey: v.runKey ?? null
            }
          });
        }
  
        return { talcBatchId: talc.id };
      });
    }
  
    /**
     * TALC dispatch: allocate from parent talc batches (talcEdge 'dispatch'), decrement remaining.
     * @param {{ allocations: Array<{ parentBatchId: number, qtyTon: number }> }} v
     */
    async function dispatch(v) {
      if (!Array.isArray(v.allocations) || v.allocations.length === 0)
        throw Object.assign(new Error('allocations required'), { code: 'E_MISSING' });
  
      return db.$transaction(async (tx) => {
        for (const a of v.allocations) {
          const qty = Number(a.qtyTon);
          if (!(qty > 0)) throw Object.assign(new Error('qtyTon must be > 0'), { code: 'E_BAD_FIELD' });
  
          const b = await tx.talcBatch.findUnique({ where: { id: Number(a.parentBatchId) } });
          if (!b) throw Object.assign(new Error(`talcBatch ${a.parentBatchId} not found`), { code: 'E_NOT_FOUND' });
          if (b.remainingTon - qty < -EPS)
            throw Object.assign(new Error(`allocation exceeds remaining on talcBatch ${b.id}`), { code: 'E_NEGATIVE' });
  
          await tx.talcEdge.create({
            data: { event: 'dispatch', createdAt: now(), parentBatchId: b.id, deltaTon: qty }
          });
          await tx.talcBatch.update({ where: { id: b.id }, data: { remainingTon: { decrement: qty } } });
        }
  
        const toClose = await tx.talcBatch.findMany({
          where: { remainingTon: { lte: EPS }, closedAt: null },
          select: { id: true }
        });
        for (const b of toClose) {
          await tx.talcBatch.update({ where: { id: b.id }, data: { remainingTon: 0, closedAt: now() } });
        }
  
        return { ok: true, edges: v.allocations.length };
      });
    }
  
    /**
     * TALC unload: create a child talc batch and write 'unload' edges from parents.
     * @param {{ stationCode: import('@prisma/client').StationCode,
     *           gradeCode: string,
     *           receipts: Array<{ parentBatchId: number, qtyTon: number }> }} v
     */
    async function unload(v) {
      if (!Array.isArray(v.receipts) || v.receipts.length === 0)
        throw Object.assign(new Error('receipts required'), { code: 'E_MISSING' });
  
      const total = v.receipts.reduce((s, r) => s + Number(r.qtyTon || 0), 0);
      if (!(total > 0)) throw Object.assign(new Error('total received must be > 0'), { code: 'E_BAD_FIELD' });
  
      return db.$transaction(async (tx) => {
        const child = await tx.talcBatch.create({
          data: {
            stationCode: v.stationCode,
            gradeCode: String(v.gradeCode).toUpperCase(),
            createdTon: total,
            remainingTon: total,
            bornAs: 'unload',
            createdAt: now()
          }
        });
  
        for (const r of v.receipts) {
          const qty = Number(r.qtyTon);
          if (!(qty > 0)) continue;
  
          const parent = await tx.talcBatch.findUnique({ where: { id: Number(r.parentBatchId) } });
          if (!parent) throw Object.assign(new Error(`talcBatch ${r.parentBatchId} not found`), { code: 'E_NOT_FOUND' });
  
          await tx.talcEdge.create({
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
  
    /** List open talc batches by station (optional). */
    async function openBatches(stationCode = null) {
      return db.talcBatch.findMany({
        where: {
          ...(stationCode ? { stationCode } : {}),
          remainingTon: { gt: EPS },
          OR: [{ closedAt: null }, { closedAt: { equals: null } }]
        },
        orderBy: [{ stationCode: 'asc' }, { createdAt: 'asc' }]
      });
    }
  
    /** Station stock view = Σ remaining of open talc batches at that station. */
    async function stationStock(stationCode) {
      const agg = await db.talcBatch.aggregate({
        _sum: { remainingTon: true },
        where: { stationCode, remainingTon: { gt: EPS } }
      });
      return { stationCode, remainingTon: Number(agg._sum.remainingTon || 0) };
    }
  
    /** Inspect a talc batch and its lineage (edges in/out; plus process inputs). */
    async function batchWithEdges(id) {
      const batch = await db.talcBatch.findUnique({ where: { id: Number(id) } });
      if (!batch) throw Object.assign(new Error('batch not found'), { code: 'E_NOT_FOUND' });
  
      const [out, inn, procIn] = await Promise.all([
        db.talcEdge.findMany({ where: { parentBatchId: batch.id }, orderBy: { createdAt: 'asc' } }),
        db.talcEdge.findMany({ where: { childBatchId: batch.id }, orderBy: { createdAt: 'asc' } }),
        db.processEdge.findMany({
          where: { childTalcBatchId: batch.id },
          orderBy: { processAt: 'asc' },
          include: { parentOreBatch: true }
        })
      ]);
  
      return { batch, edgesOut: out, edgesIn: inn, processInputs: procIn };
    }
  
    return { process, dispatch, unload, openBatches, stationStock, batchWithEdges };
  }
  