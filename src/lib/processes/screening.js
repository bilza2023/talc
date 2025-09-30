
// /src/lib/processes/screening.js
import { randomUUID as uuidv4 } from 'crypto';
import { prisma, rawStock, processedStock as screenedStock } from '../stocks/index.js';

// ───────────────────────── helpers ─────────────────────────
const fam = (mma) => String(mma).split('_')[1] || ''; // RAW | UNCRENED | SCREENED | PROCESSED ...
const stationOf = (mma) => String(mma).split('_')[0] || '';
const normFrom = (f) => (f === 'UNSCREENED' ? 'RAW' : f);
const normTo   = (f) => (f === 'PROCESSED'   ? 'SCREENED' : f);

function assertLane(fromMmaCode, toMmaCode) {
  const F = normFrom(fam(fromMmaCode));
  const T = normTo(fam(toMmaCode));
  if (!(F === 'RAW' && T === 'SCREENED')) {
    throw new Error(`screening requires RAW/UNSCREENED → SCREENED/PROCESSED (got ${fam(fromMmaCode)} → ${fam(toMmaCode)})`);
  }
  const s1 = stationOf(fromMmaCode);
  const s2 = stationOf(toMmaCode);
  if (s1 && s2 && s1 !== s2) throw new Error(`screening: station mismatch '${s1}' → '${s2}'`);
}

/**
 * screening(): one-to-many bridge RAW/UNSCREENED → SCREENED
 *
 * - Inventory is done ONLY via Stock verbs:
 *    RAW:       rawStock.withdraw({ reason:'SCREEN', processId: screenId, ... })
 *    SCREENED:  screenedStock.deposit({ reason:'SCREEN', processId: screenId, ... })
 * - Exactly one row is written to screening_tbl for lineage/idempotency.
 *
 * Payload (tons):
 * {
 *   screenId?: string,                // optional; generated if missing
 *   fromMmaCode: 'ABS_RAW' | 'ABS_UNSCREENED',
 *   toMmaCode:   'ABS_SCREENED' | 'ABS_PROCESSED',
 *   supplierId: number,
 *   from: { shade: string, size?: string|null, qtyT: number, stationCode?: string|null },
 *   targets: [ { shade: string, size: string, qtyT: number, stationCode?: string|null }, ... ],
 *   toStationCode?: string|null,      // default for targets[].stationCode
 *   meta?: object                     // echoed into screening_tbl and ledger meta
 * }
 *
 * Returns: { screenId, status: 'SUCCESS'|'ROLLED_BACK'|'FAILED', ... }
 */
export default async function screening(payload = {}) {
  // ── unpack + defaults ──
  const {
    screenId = `SCREEN-${uuidv4().slice(0, 8).toUpperCase()}`,
    fromMmaCode = 'ABS_RAW',
    toMmaCode   = 'ABS_SCREENED',
    supplierId,
    from,
    targets,
    toStationCode = null,
    meta = null,
  } = payload;

  // ── idempotency ──
  const existing = await prisma.screening_tbl.findUnique({ where: { screenId } }).catch(() => null);
  if (existing) {
    return {
      screenId,
      status: existing.status,
      from: {
        mmaCode: existing.fromMmaCode,
        shade: existing.sourceShade,
        size: existing.sourceSize,
        qtyT: Number(existing.sourceQtyT),
        stationCode: existing.fromStationCode ?? null
      },
      to: {
        mmaCode: existing.toMmaCode,
        qtyT: Number(existing.targetsQtyT),
        stationCode: existing.toStationCode ?? null
      }
    };
  }

  // ── validate lane + inputs ──
  assertLane(fromMmaCode, toMmaCode);

  if (!supplierId) throw new Error('screening: supplierId is required');
  if (!from || !from.shade || !from.qtyT) throw new Error('screening: from {shade, qtyT} is required');
  if (!Array.isArray(targets) || targets.length === 0) throw new Error('screening: targets[] is required');

  const srcQty = Number(from.qtyT);
  if (!(srcQty > 0)) throw new Error('screening: from.qtyT must be > 0');

  const sumTargets = targets.reduce((s, t) => s + Number(t.qtyT || 0), 0);
  const eps = 1e-6;
  if (Math.abs(sumTargets - srcQty) > eps) {
    throw new Error(`screening: targets sum (${sumTargets}) must equal source qty (${srcQty})`);
  }

  const fromShade = String(from.shade);
  const fromSize = from.size ?? null;             // RAW defaults to 'ANY' inside Stock
  const fromStationCode = from.stationCode ?? null;

  const targetList = targets.map(t => ({
    shade: String(t.shade),
    size:  String(t.size ?? 'ANY'),
    qtyT:  Number(t.qtyT),
    stationCode: t.stationCode ?? toStationCode ?? null
  }));

  // ── bookkeeping for rollback ──
  let rawWithdrawn = false;
  const screenedPosted = [];

  // ── do the bridge with compensations ──
  try {
    // 1) consume RAW
    await rawStock.withdraw({
      fromMmaCode,
      supplierId,
      shade: fromShade,
      size: fromSize,            // Stock will normalize null → 'ANY'
      qty: srcQty,
      processId: screenId,       // linkId in ledgers = screenId
      reason: 'SCREEN',          // no 'process' wording in ledgers
      fromStationCode,
      meta: { ...meta, step: 'screening.consume' }
    });
    rawWithdrawn = true;

    // 2) produce SCREENED (many)
    for (const t of targetList) {
      const res = await screenedStock.deposit({
        toMmaCode,
        supplierId,
        shade: t.shade,
        size: t.size,
        qty: t.qtyT,
        processId: screenId,
        reason: 'SCREEN',
        toStationCode: t.stationCode,
        meta: { ...meta, step: 'screening.produce' }
      });
      screenedPosted.push({ ...t, posting: res.posting });
    }

    // 3) single lineage row
    const log = await prisma.screening_tbl.create({
      data: {
        screenId,
        screenType: 'SCREENING',
        fromMmaCode,
        toMmaCode,
        supplierId: Number(supplierId),
        fromStationCode,
        toStationCode,
        sourceShade: fromShade,
        sourceSize:  String(fromSize ?? 'ANY'),
        sourceQtyT:   srcQty,
        targetsQtyT:  sumTargets,
        targets:      targetList.map(({ stationCode, ...x }) => ({ ...x, stationCode })),
        status:       'SUCCESS',
        error:        null,
        meta,
        committedAt:  new Date()
      }
    });

    return {
      screenId,
      status: 'SUCCESS',
      posted: { raw: { qtyT: srcQty, shade: fromShade, size: String(fromSize ?? 'ANY') }, screened: screenedPosted },
      log
    };
  } catch (err) {
    // rollback
    try {
      // undo SCREENED
      for (const t of screenedPosted.reverse()) {
        await screenedStock.withdraw({
          fromMmaCode: toMmaCode,
          supplierId,
          shade: t.shade,
          size: t.size,
          qty: t.qtyT,
          processId: screenId,
          reason: 'SCREEN',
          fromStationCode: t.stationCode ?? null,
          meta: { ...meta, step: 'screening.rollback.target' }
        });
      }
      // re-credit RAW
      if (rawWithdrawn) {
        await rawStock.deposit({
          toMmaCode: fromMmaCode,
          supplierId,
          shade: fromShade,
          size: fromSize,
          qty: srcQty,
          processId: screenId,
          reason: 'SCREEN',
          toStationCode: fromStationCode,
          meta: { ...meta, step: 'screening.rollback.source' }
        });
      }

      const log = await prisma.screening_tbl.create({
        data: {
          screenId,
          screenType: 'SCREENING',
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
          committedAt:  new Date()
        }
      });

      return { screenId, status: 'ROLLED_BACK', error: String(err?.message ?? err), log };
    } catch (rbErr) {
      await prisma.screening_tbl.create({
        data: {
          screenId,
          screenType: 'SCREENING',
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
          committedAt:  new Date()
        }
      }).catch(() => null);

      const combined = new Error(
        `screening failed and rollback failed; manual repair needed. root=${String(err?.message ?? err)}; rollback=${String(rbErr?.message ?? rbErr)}`
      );
      throw combined;
    }
  }
}
