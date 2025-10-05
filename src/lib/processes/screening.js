// /src/lib/processes/screening.js
// ABS Screening: RAW → SCREENED (1 → many), minimal header table
import { prisma, stock } from '../stocks/stockEngine.js';

const FROM_MMA = 'ABS_RAW';
const TO_MMA   = 'ABS_SCREENED';
const RAW_SIZE = 'ANY';

/**
 * Run screening with minimal lineage:
 * - Validate inputs and availability
 * - Create header (screening_tbl) to get id
 * - Withdraw RAW, deposit SCREENED per target, all with linkId = String(header.id)
 * - On success: mark committedAt
 * - On error: compensate ledger and delete header
 *
 * @param {Object} payload
 * @param {number} payload.supplierId
 * @param {{shade:string, qtyT:number}} payload.from
 * @param {{shade:string, size:string, qtyT:number}[]} payload.targets
 * @param {any} [payload.meta]
 */
export default async function screening(payload = {}) {
  const { supplierId, from, targets, meta = null } = payload;

  // 1) Validate shape
  if (!supplierId) throw new Error('screening: supplierId is required');
  if (!from || !from.shade || from.qtyT == null) throw new Error('screening: from {shade, qtyT} is required');
  if (!Array.isArray(targets) || targets.length === 0) throw new Error('screening: targets[] is required');

  const srcQty = Number(from.qtyT);
  if (!(srcQty > 0)) throw new Error('screening: from.qtyT must be > 0');

  const fromShade = String(from.shade);
  const targetList = targets.map(t => ({
    shade: String(t.shade),
    size:  String(t.size ?? 'ANY'),
    qtyT:  Number(t.qtyT),
  }));

  const sumTargets = targetList.reduce((s, t) => s + (t.qtyT || 0), 0);
  if (Math.abs(sumTargets - srcQty) > 1e-6) {
    throw new Error(`screening: targets sum (${sumTargets}) must equal source qty (${srcQty})`);
  }

  // 2) Availability preflight (no header yet if we already know it fails)
  const available = await stock.onHand({
    mmaCode: FROM_MMA,
    supplierId,
    shade: fromShade,
    size: RAW_SIZE,
  });
  if (srcQty > Number(available)) {
    return {
      status: 'FAILED',
      error: `Insufficient stock at ${FROM_MMA} (available=${available}, requested=${srcQty})`,
    };
  }

  // 3) Create header to get an id we can link ledger rows to
  const header = await prisma.screening_tbl.create({
    data: {
      qtyT: srcQty,
      meta,
    },
  });
  const linkId = String(header.id);

  // 4) Effects + compensation guard
  let sourceWithdrawn = false;
  const postedTargets = [];

  try {
    // Withdraw RAW
    await stock.withdraw({
      fromMmaCode: FROM_MMA,
      supplierId,
      shade: fromShade,
      size: RAW_SIZE,
      qty: srcQty,
      processId: linkId,
      meta: { ...meta, step: 'screening.withdraw' },
    });
    sourceWithdrawn = true;

    // Deposit SCREENED per target
    for (const t of targetList) {
      const res = await stock.deposit({
        toMmaCode: TO_MMA,
        supplierId,
        shade: t.shade,
        size: t.size,
        qty: t.qtyT,
        processId: linkId,
        meta: { ...meta, step: 'screening.deposit' },
      });
      postedTargets.push({ ...t, posting: res.posting });
    }

    // Mark header committed
    await prisma.screening_tbl.update({
      where: { id: header.id },
      data: { committedAt: new Date() },
    });

    return { id: header.id, status: 'SUCCESS' };
  } catch (err) {
    // Best-effort compensation
    try {
      // Undo targets
      for (const t of postedTargets.reverse()) {
        await stock.withdraw({
          fromMmaCode: TO_MMA,
          supplierId,
          shade: t.shade,
          size: t.size,
          qty: t.qtyT,
          processId: linkId,
          meta: { ...meta, step: 'screening.rollback.target' },
        });
      }
      // Put RAW back if we took it
      if (sourceWithdrawn) {
        await stock.deposit({
          toMmaCode: FROM_MMA,
          supplierId,
          shade: fromShade,
          size: RAW_SIZE,
          qty: srcQty,
          processId: linkId,
          meta: { ...meta, step: 'screening.rollback.source' },
        });
      }
    } finally {
      // Remove header so failed runs leave no lineage
      await prisma.screening_tbl.delete({ where: { id: header.id } }).catch(() => null);
    }

    return { status: 'ROLLED_BACK', error: String(err?.message ?? err) };
  }
}
