// /src/lib/processes/processing.js
import { randomUUID as uuidv4 } from 'crypto';
import { prisma, rawStock, processedStock } from '../stocks/index.js';

/**
 * processing(): one-to-many bridge from RAW -> PROCESSED
 *
 * - Uses ONLY Stock verbs for inventories:
 *   RAW:        withdraw({ fromMmaCode: 'ABS_RAW', ... , processId })
 *   PROCESSED:  deposit({ toMmaCode: 'ABS_PROCESSED', ... , processId })
 *
 * - Writes exactly one row in process_tbl (no other tables).
 * - "Transactional" behavior is implemented with compensating actions because
 *   Stock.deposit/withdraw are atomic to their own tables. If any target deposit
 *   fails, we roll back the already-done target deposits (via processed.withdraw)
 *   and re-credit RAW (via raw.deposit). Result status becomes "ROLLED_BACK".
 *
 * Payload (tons only):
 * {
 *   processId?: string,                  // optional; will be generated if not provided
 *   fromMmaCode: 'ABS_RAW',
 *   toMmaCode:   'ABS_PROCESSED',
 *   supplierId: number,
 *   from: {
 *     shade: string,
 *     size?: string | null,              // RAW defaults to 'ANY' inside Stock
 *     qtyT: number,                      // > 0 tons
 *     stationCode?: string | null
 *   },
 *   targets: [                           // >= 1
 *     { shade: string, size: string, qtyT: number, stationCode?: string | null },
 *     ...
 *   ],
 *   toStationCode?: string | null,       // optional default for targets
 *   meta?: object                        // free-form, will be echoed in process_tbl
 * }
 *
 * Invariants (current behavior):
 * - Σ(targets.qtyT) must equal from.qtyT (exact within 1e-6).
 * - Station checks/permissions live ABOVE this layer. We pass station codes through.
 */
export async function processing(payload) {
  // ---- validate minimal required shape ----
  const {
    processId = `PROC-${uuidv4().slice(0, 8).toUpperCase()}`,
    fromMmaCode = 'ABS_RAW',
    toMmaCode   = 'ABS_PROCESSED',
    supplierId,
    from,
    targets,
    toStationCode = null,
    meta = null,
  } = payload ?? {};

  if (!supplierId) throw new Error('supplierId is required');
  if (!from || !from.shade || !from.qtyT) throw new Error('from {shade, qtyT} is required');
  if (!Array.isArray(targets) || targets.length === 0) throw new Error('targets[] is required');

  const srcQty = Number(from.qtyT);
  if (!(srcQty > 0)) throw new Error('from.qtyT must be > 0');

  // ---- ensure tonnage conservation (tight for now; relax later if needed) ----
  const sumTargets = targets.reduce((s, t) => s + Number(t.qtyT || 0), 0);
  const eps = 1e-6;
  if (Math.abs(sumTargets - srcQty) > eps) {
    throw new Error(`targets sum (${sumTargets}) must equal source qty (${srcQty}) in tons`);
  }

  // convenient copies
  const fromShade = String(from.shade);
  const fromSize  = from.size ?? null;            // RAW Stock will normalize to 'ANY'
  const fromStationCode = from.stationCode ?? null;

  const targetList = targets.map(t => ({
    shade: String(t.shade),
    size:  String(t.size ?? 'ANY'),
    qtyT:  Number(t.qtyT),
    stationCode: t.stationCode ?? toStationCode ?? null,
  }));

  // book-keeping for compensations
  let rawWithdrawn = false;
  const processedPosted = []; // keep successful deposits for rollback

  // ---- perform the bridge with compensations on failure ----
  try {
    // 1) consume RAW (one slot)
    await rawStock.withdraw({
      fromMmaCode,
      supplierId,
      shade: fromShade,
      size: fromSize,              // may be null -> Stock defaults to 'ANY'
      qty: srcQty,
      processId,
      fromStationCode,
      meta: { ...meta, step: 'processing.consume' },
    });
    rawWithdrawn = true;

    // 2) produce PROCESSED (many slots)
    for (const t of targetList) {
      const res = await processedStock.deposit({
        toMmaCode,
        supplierId,
        shade: t.shade,
        size: t.size,
        qty: t.qtyT,
        processId,                 // marks reason='PROCESS', linkId=processId
        toStationCode: t.stationCode,
        meta: { ...meta, step: 'processing.produce' },
      });
      processedPosted.push({ shade: t.shade, size: t.size, qtyT: t.qtyT, stationCode: t.stationCode, posting: res.posting });
    }

    // 3) single row log in process_tbl
    const log = await prisma.process_tbl.create({
      data: {
        processId,
        processType: 'PROCESSING',
        fromMmaCode,
        toMmaCode,
        supplierId: Number(supplierId),
        fromStationCode,
        toStationCode,
        sourceShade: fromShade,
        sourceSize:  String(fromSize ?? 'ANY'),
        sourceQtyT:   srcQty,
        targetsQtyT:  sumTargets,
        targets:      targetList.map(({ stationCode, ...x }) => ({ ...x, stationCode })), // compact JSON
        status:       'SUCCESS',
        error:        null,
        meta,
      },
    });

    return {
      processId,
      status: 'SUCCESS',
      posted: { raw: { qtyT: srcQty, shade: fromShade, size: String(fromSize ?? 'ANY') }, processed: processedPosted },
      log,
    };
  } catch (err) {
    // ---- attempt compensating rollback ----
    try {
      // Undo processed deposits (if any)
      for (const t of processedPosted.reverse()) {
        await processedStock.withdraw({
          fromMmaCode: toMmaCode,
          supplierId,
          shade: t.shade,
          size: t.size,
          qty: t.qtyT,
          processId, // same processId to keep lineage
          fromStationCode: t.stationCode ?? null,
          meta: { ...meta, step: 'processing.rollback.target' },
        });
      }

      // Re-credit RAW if we had consumed it
      if (rawWithdrawn) {
        await rawStock.deposit({
          toMmaCode: fromMmaCode,
          supplierId,
          shade: fromShade,
          size: fromSize,
          qty: srcQty,
          processId, // same processId: auditProcess will net to zero
          toStationCode: fromStationCode,
          // reason will be 'PROCESS' because processId is present; that's ok for lineage
          meta: { ...meta, step: 'processing.rollback.source' },
        });
      }

      // Log a single row as ROLLED_BACK
      const log = await prisma.process_tbl.create({
        data: {
          processId,
          processType: 'PROCESSING',
          fromMmaCode,
          toMmaCode,
          supplierId: Number(supplierId),
          fromStationCode,
          toStationCode,
          sourceShade: fromShade,
          sourceSize:  String(fromSize ?? 'ANY'),
          sourceQtyT:   srcQty,
          targetsQtyT:  sumTargets,
          targets:      targetList,
          status:       'ROLLED_BACK',
          error:        String(err?.message ?? err),
          meta,
        },
      });

      return { processId, status: 'ROLLED_BACK', error: String(err?.message ?? err), log };
    } catch (rbErr) {
      // If even rollback fails, we still try to record a single FAILED row.
      const log = await prisma.process_tbl.create({
        data: {
          processId,
          processType: 'PROCESSING',
          fromMmaCode,
          toMmaCode,
          supplierId: Number(supplierId),
          fromStationCode,
          toStationCode,
          sourceShade: fromShade,
          sourceSize:  String(fromSize ?? 'ANY'),
          sourceQtyT:   srcQty,
          targetsQtyT:  sumTargets,
          targets:      targetList,
          status:       'FAILED',
          error:        `do: ${String(err?.message ?? err)} | rollback: ${String(rbErr?.message ?? rbErr)}`,
          meta,
        },
      }).catch(() => null); // last resort: don't throw away original error if log also explodes

      const combined = new Error(
        `processing failed and rollback failed; manual repair needed. root=${String(err?.message ?? err)}; rollback=${String(rbErr?.message ?? rbErr)}`
      );
      combined.log = log;
      throw combined;
    }
  }
}

export default processing;
