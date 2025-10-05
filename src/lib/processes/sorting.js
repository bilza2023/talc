// /src/lib/processes/sorting.js
// PSS Sorting: SCREENED → SORTED (1 → 1), minimal header with ht & wastage
import { prisma, stock } from '../stocks/stockEngine.js';

const FROM_MMA = 'PSS_SCREENED';
const TO_MMA   = 'PSS_SORTED';

/**
 * Run sorting with minimal lineage:
 * - Validate inputs and availability
 * - Create header (sorting_tbl) with ht & wastage to get id
 * - Withdraw from PSS_SCREENED, deposit to PSS_SORTED, both with linkId = String(header.id)
 * - On success: mark committedAt
 * - On error: compensate ledger and delete header
 *
 * @param {Object} payload
 * @param {number} payload.supplierId
 * @param {{shade:string, size:string, qtyT:number}} payload.from
 * @param {number|null} [payload.ht]        // optional attribute
 * @param {number|null} [payload.wastage]   // optional attribute (tag only; no math change)
 * @param {any} [payload.meta]
 */
export default async function sorting(payload = {}) {
  const { supplierId, from, meta = null } = payload;

  // 1) Validate shape
  if (!supplierId) throw new Error('sorting: supplierId is required');
  if (!from || !from.shade || !from.size || from.qtyT == null) {
    throw new Error('sorting: from {shade, size, qtyT} is required');
  }

  const shade = String(from.shade);
  const size  = String(from.size);
  const qtyT  = Number(from.qtyT);

  if (!(qtyT > 0)) {
    throw new Error('sorting: qtyT must be > 0');
  }

  // normalize attributes (nullable)
  const attrHt = payload.ht == null ? null : Number(payload.ht);
  const attrW  = payload.wastage == null ? null : Number(payload.wastage);

  // 2) Availability preflight
  const available = await stock.onHand({
    mmaCode: FROM_MMA,
    supplierId,
    shade,
    size
  });
  if (qtyT > Number(available)) {
    return {
      status: 'FAILED',
      error: `Insufficient stock at ${FROM_MMA} (available=${available}, requested=${qtyT})`,
    };
  }

  // 3) Create header to get an id we can link ledger rows to
  const header = await prisma.sorting_tbl.create({
    data: {
      ht: attrHt,
      wastage: attrW,
      meta,
    },
  });
  const linkId = String(header.id);

  // 4) Effects + compensation guard
  let sourceWithdrawn = false;
  let targetDeposited = false;

  try {
    // Withdraw from SCREENED
    await stock.withdraw({
      fromMmaCode: FROM_MMA,
      supplierId,
      shade,
      size,
      qty: qtyT,
      processId: linkId,
      meta: { ...meta, step: 'sorting.withdraw' },
    });
    sourceWithdrawn = true;

    // Deposit into SORTED
    await stock.deposit({
      toMmaCode: TO_MMA,
      supplierId,
      shade,
      size,
      qty: qtyT,
      processId: linkId,
      meta: { ...meta, step: 'sorting.deposit' },
    });
    targetDeposited = true;

    // Mark header committed
    await prisma.sorting_tbl.update({
      where: { id: header.id },
      data: { committedAt: new Date() },
    });

    return { id: header.id, status: 'SUCCESS' };
  } catch (err) {
    // Best-effort compensation
    try {
      if (targetDeposited) {
        await stock.withdraw({
          fromMmaCode: TO_MMA,
          supplierId,
          shade,
          size,
          qty: qtyT,
          processId: linkId,
          meta: { ...meta, step: 'sorting.rollback.target' },
        });
      }
      if (sourceWithdrawn) {
        await stock.deposit({
          toMmaCode: FROM_MMA,
          supplierId,
          shade,
          size,
          qty: qtyT,
          processId: linkId,
          meta: { ...meta, step: 'sorting.rollback.source' },
        });
      }
    } finally {
      // Remove header so failed runs leave no lineage
      await prisma.sorting_tbl.delete({ where: { id: header.id } }).catch(() => null);
    }

    return { status: 'ROLLED_BACK', error: String(err?.message ?? err) };
  }
}
