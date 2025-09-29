// /src/lib/processes/sorting.js

import { randomUUID as uuidv4 } from 'crypto';
import { prisma, processedStock as processed, sortedStock as sorted } from '../stocks/index.js';

/* tiny helpers (no registry) */
function stationFrom(mmaCode) {
  return String(mmaCode).split('_')[0] || '';
}
function familyRawFrom(mmaCode) {
  return String(mmaCode).split('_')[1] || ''; // 'SCREENED' | 'PROCESSED' | 'SORTED' | ...
}
function normalizeFamily(fam) {
  // Treat SCREENED as a synonym for PROCESSED
  return fam === 'SCREENED' ? 'PROCESSED' : fam;
}
function assertPair(fromMmaCode, toMmaCode) {
  const fromRaw = familyRawFrom(fromMmaCode);
  const toRaw   = familyRawFrom(toMmaCode);
  const from    = normalizeFamily(fromRaw);
  const to      = normalizeFamily(toRaw);

  if (!(from === 'PROCESSED' && to === 'SORTED')) {
    throw new Error(
      `sorting: requires SCREENED/PROCESSED → SORTED (got ${fromRaw} → ${toRaw})`
    );
  }

  const s1 = stationFrom(fromMmaCode);
  const s2 = stationFrom(toMmaCode);
  if (s1 && s2 && s1 !== s2) {
    throw new Error(`sorting: station mismatch '${s1}' → '${s2}'`);
  }
}

/**
 * sorting(): one-to-one bridge from SCREENED/PROCESSED -> SORTED
 *
 * Inventory effects:
 *   - processed.withdraw(...)   // 'processed' engine also serves 'screened' MMAs
 *   - sorted.deposit(...)
 *
 * Persistence:
 *   - exactly ONE row into sorting_tbl per successful commit (status='SUCCESS')
 *   - if deposit fails after withdraw and compensation succeeds, write status='ROLLED_BACK'
 *   - if even compensation fails, write status='FAILED' (last resort), then throw
 *
 * Units: tons (qtyT). 1→1 means to.qtyT === from.qtyT (enforced).
 *
 * Payload:
 * {
 *   processId?: string,                 // optional; generated if missing
 *   fromMmaCode: 'PSS_SCREENED' | 'PSS_PROCESSED',
 *   toMmaCode:   'PSS_SORTED',
 *   supplierId: number,
 *   from: { shade, size, qtyT, stationCode?: string | null },
 *   to?:  { shade?, size?, qtyT?, stationCode?: string | null }, // defaults from 'from'
 *   meta?: { ht?: number, wastage?: number, ... }                 // forwarded as-is to ledgers and table
 * }
 *
 * Returns:
 * { status:'SUCCESS'|'ROLLED_BACK'|'FAILED', processId, qtyT, from:{...}, to:{...} }
 */
export default async function sorting(payload) {
  const {
    processId = `SORT-${uuidv4().slice(0, 8).toUpperCase()}`,
    fromMmaCode = 'ABS_PROCESSED', // accepts SCREENED or PROCESSED
    toMmaCode   = 'ABS_SORTED',
    supplierId,
    from,
    to = {},
    meta = {},
  } = payload ?? {};

  // idempotency: if a row already exists, return its summary (no re-writes)
  const existing = await prisma.sorting_tbl.findUnique({ where: { processId } }).catch(() => null);
  if (existing) {
    return {
      status: existing.status,
      processId,
      qtyT: Number(existing.qtyT),
      from: {
        mmaCode: existing.fromMmaCode,
        supplierId: existing.supplierId,
        shade: existing.fromShade,
        size: existing.fromSize,
        stationCode: existing.fromStationCode ?? null,
      },
      to: {
        mmaCode: existing.toMmaCode,
        supplierId: existing.supplierId,
        shade: existing.toShade,
        size: existing.toSize,
        stationCode: existing.toStationCode ?? null,
      },
    };
  }

  if (!supplierId) throw new Error('sorting: supplierId is required');
  if (!from || !from.shade || !from.size || !(Number(from.qtyT) > 0)) {
    throw new Error('sorting: from {shade, size, qtyT>0} is required');
  }

  // enforce SCREENED/PROCESSED → SORTED + same-station pairing
  assertPair(fromMmaCode, toMmaCode);

  // normalize target; 1→1 requires equal quantities
  const qtyT = Number(to.qtyT ?? from.qtyT);
  if (!(qtyT > 0)) throw new Error('sorting: qtyT must be > 0');
  if (to.qtyT !== undefined) {
    const eps = 1e-6;
    if (Math.abs(Number(to.qtyT) - Number(from.qtyT)) > eps) {
      throw new Error('sorting: to.qtyT must equal from.qtyT (1→1)');
    }
  }

  const fromShade = String(from.shade);
  const fromSize  = String(from.size);
  const fromStationCode = from.stationCode ?? null;

  const toShade = String(to.shade ?? fromShade);
  const toSize  = String(to.size ?? fromSize);
  const toStationCode = to.stationCode ?? null;

  // carry meta (including ht & wastage) to both legs for audit (does not affect math)
  const baseMeta = { ...meta, process: 'SORTING' };
  const htVal = meta?.ht !== undefined && meta.ht !== '' ? Number(meta.ht) : null;
  const wastageVal = meta?.wastage !== undefined && meta.wastage !== '' ? Number(meta.wastage) : null;

  let withdrawPost = null;
  try {
    // 1) consume from SCREENED/PROCESSED
    const w = await processed.withdraw({
      fromMmaCode,
      supplierId,
      shade: fromShade,
      size: fromSize,
      qty: qtyT,                 // tons
      processId,
      fromStationCode,
      meta: { ...baseMeta, step: 'sorting.consume' },
    });
    withdrawPost = w?.posting ?? null;

    // 2) produce into SORTED
    const d = await sorted.deposit({
      toMmaCode,
      supplierId,
      shade: toShade,
      size: toSize,
      qty: qtyT,                 // tons (1→1)
      processId,
      toStationCode,
      meta: { ...baseMeta, step: 'sorting.produce' },
    });
    const depositPost = d?.posting ?? null;

    // 3) single row log in sorting_tbl (commit-only)
    await prisma.sorting_tbl.create({
      data: {
        processId,
        processType: 'SORTING',
        fromMmaCode,
        toMmaCode,
        supplierId: Number(supplierId),
        fromStationCode,
        toStationCode,
        fromShade,
        fromSize,
        toShade,
        toSize,
        qtyT,
        ht: htVal,
        wastage: wastageVal,
        withdrawLedgerId: withdrawPost ? String(withdrawPost.id) : null,
        depositLedgerId:  depositPost  ? String(depositPost.id)  : null,
        status: 'SUCCESS',
        error: null,
        meta: Object.keys(meta || {}).length ? meta : null,
        committedAt: new Date(),
      },
    });

    return {
      status: 'SUCCESS',
      processId,
      qtyT,
      from: { mmaCode: fromMmaCode, supplierId, shade: fromShade, size: fromSize, stationCode: fromStationCode },
      to:   { mmaCode: toMmaCode,   supplierId, shade: toShade,   size: toSize,   stationCode: toStationCode },
    };
  } catch (err) {
    // compensate if the deposit failed after withdraw
    let rollbackPost = null;
    if (withdrawPost) {
      try {
        const rb = await processed.deposit({
          toMmaCode: fromMmaCode,
          supplierId,
          shade: fromShade,
          size: fromSize,
          qty: qtyT,
          processId,
          toStationCode: fromStationCode,
          meta: { ...baseMeta, step: 'sorting.rollback.source' },
        });
        rollbackPost = rb?.posting ?? null;

        // record ROLLED_BACK
        await prisma.sorting_tbl.create({
          data: {
            processId,
            processType: 'SORTING',
            fromMmaCode,
            toMmaCode,
            supplierId: Number(supplierId),
            fromStationCode,
            toStationCode,
            fromShade,
            fromSize,
            toShade,
            toSize,
            qtyT,
            ht: htVal,
            wastage: wastageVal,
            withdrawLedgerId: String(withdrawPost.id),
            // deposit into SORTED never happened; keep null
            depositLedgerId: null,
            status: 'ROLLED_BACK',
            error: String(err?.message ?? err),
            meta: Object.keys(meta || {}).length ? meta : null,
            committedAt: new Date(),
          },
        });

        return {
          status: 'ROLLED_BACK',
          processId,
          qtyT,
          from: { mmaCode: fromMmaCode, supplierId, shade: fromShade, size: fromSize, stationCode: fromStationCode },
          to:   { mmaCode: toMmaCode,   supplierId, shade: toShade,   size: toSize,   stationCode: toStationCode },
        };
      } catch (rbErr) {
        // final attempt to record FAILED
        await prisma.sorting_tbl.create({
          data: {
            processId,
            processType: 'SORTING',
            fromMmaCode,
            toMmaCode,
            supplierId: Number(supplierId),
            fromStationCode,
            toStationCode,
            fromShade,
            fromSize,
            toShade,
            toSize,
            qtyT,
            ht: htVal,
            wastage: wastageVal,
            withdrawLedgerId: withdrawPost ? String(withdrawPost.id) : null,
            depositLedgerId: null,
            status: 'FAILED',
            error: `do: ${String(err?.message ?? err)} | rollback: ${String(rbErr?.message ?? rbErr)}`,
            meta: Object.keys(meta || {}).length ? meta : null,
            committedAt: new Date(),
          },
        }).catch(() => null);

        const combined = new Error(
          `sorting failed and rollback failed; manual repair needed. root=${String(err?.message ?? err)}; rollback=${String(rbErr?.message ?? rbErr)}`
        );
        throw combined;
      }
    }

    // withdraw never happened; just record FAILED (best-effort) then throw
    await prisma.sorting_tbl.create({
      data: {
        processId,
        processType: 'SORTING',
        fromMmaCode,
        toMmaCode,
        supplierId: Number(supplierId),
        fromStationCode,
        toStationCode,
        fromShade,
        fromSize,
        toShade,
        toSize,
        qtyT,
        ht: htVal,
        wastage: wastageVal,
        withdrawLedgerId: null,
        depositLedgerId: null,
        status: 'FAILED',
        error: String(err?.message ?? err),
        meta: Object.keys(meta || {}).length ? meta : null,
        committedAt: new Date(),
      },
    }).catch(() => null);

    throw err;
  }
}
