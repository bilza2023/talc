// /src/lib/processes/sorting.js
// PSS Sorting: SCREENED → SORTED (1 → 1), minimal header with ht & wastage
import { prisma, stock } from '../stocks/stockEngine.js';

const FROM_MMA = 'PSS_SCREENED';
const TO_MMA   = 'PSS_SORTED';

/**
 * @param {Object} payload
 * @param {number} payload.supplierId
 * @param {{ shade:string, size:string, qtyT:number }} payload.from
 * @param {number|null|undefined} payload.ht
 * @param {number|null|undefined} payload.wastage
 * @param {any} [payload.meta]
 * @returns {Promise<{ status:'SUCCESS'|'FAILED'|'ROLLED_BACK', id?:number, error?:string }>}
 */
export default async function sorting({ supplierId, from, ht, wastage, meta } = {}) {
  // 1) Validate inputs (matches tests)
  if (!supplierId) throw new Error('supplierId is required');
  if (!from?.shade) throw new Error('from.shade is required');
  if (!from?.size)  throw new Error('from.size is required');

  const qtyT = Number(from?.qtyT ?? 0);
  if (!(qtyT > 0)) throw new Error('qtyT must be > 0');

  // 2) Availability guard (no writes if insufficient)
  const available = await stock.onHand({
    mmaCode: FROM_MMA,
    supplierId,
    shade: from.shade,
    size: from.size,
  });
  if (Number(available) < qtyT) {
    return { status: 'FAILED', error: `Insufficient stock: have ${available}, need ${qtyT}` };
  }

  // 3) Create minimal header FIRST (schema stores only ht, wastage, meta; qty lives in ledger)
  const header = await prisma.sorting_tbl.create({
    data: {
      ht: ht == null ? null : Number(ht),
      wastage: wastage == null ? null : Number(wastage),
      meta: meta ?? null,
      // committedAt is set after both ledger posts succeed
    },
  });
  const linkId = String(header.id);

  // 4) Ledger mutations, both linked to header.id
  try {
    // Withdraw from SCREENED
    await stock.withdraw({
      fromMmaCode: FROM_MMA,
      supplierId,
      shade: from.shade,
      size: from.size,
      qty: qtyT,
      processId: linkId,
      reason: 'PROCESS',
      meta: { ...meta, process: 'sorting', step: 'withdraw' },
    });

    // Deposit to SORTED
    await stock.deposit({
      toMmaCode: TO_MMA,
      supplierId,
      shade: from.shade,
      size: from.size,
      qty: qtyT,
      processId: linkId,
      reason: 'PROCESS',
      meta: { ...meta, process: 'sorting', step: 'deposit' },
    });

    // 5) Mark header committed (happy path)
    await prisma.sorting_tbl.update({
      where: { id: header.id },
      data: { committedAt: new Date() },
    });

    return { status: 'SUCCESS', id: header.id };
  } catch (err) {
    // 6) Best-effort rollback: try to reverse withdraw if it happened, then drop header
    try {
      const have = await stock.onHand({
        mmaCode: TO_MMA, supplierId, shade: from.shade, size: from.size
      });
      if (have >= qtyT) {
        // reverse deposit from SORTED
        await stock.withdraw({
          fromMmaCode: TO_MMA,
          supplierId,
          shade: from.shade,
          size: from.size,
          qty: qtyT,
          processId: linkId,
          meta: { ...meta, step: 'sorting.rollback.dest' },
        });
      }
      // put back to SCREENED if we had withdrawn
      const lost = await stock.onHand({
        mmaCode: FROM_MMA, supplierId, shade: from.shade, size: from.size
      });
      if (lost < available) {
        await stock.deposit({
          toMmaCode: FROM_MMA,
          supplierId,
          shade: from.shade,
          size: from.size,
          qty: qtyT,
          processId: linkId,
          meta: { ...meta, step: 'sorting.rollback.source' },
        });
      }
    } finally {
      await prisma.sorting_tbl.delete({ where: { id: header.id } }).catch(() => null);
    }
    return { status: 'ROLLED_BACK', error: String(err?.message ?? err) };
  }
}
