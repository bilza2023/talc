// /src/lib/processes/sorting.js
import { randomUUID as uuidv4 } from 'crypto';
import { prisma, processedStock as processed, sortedStock as sorted } from '../stocks/index.js';

/* Resolve Prisma delegate safely regardless of model casing/naming */
const Sorting =
  prisma.sorting_tbl ||      // model sorting_tbl { ... }
  prisma.sorting ||          // model Sorting { ... }
  prisma.sortingTbl;         // model SortingTbl { ... }

if (!Sorting) {
  throw new Error(
    "sorting.js: Prisma model for 'sorting' not found. Expected one of: sorting_tbl, Sorting, SortingTbl. " +
    "Check prisma/schema.prisma and run `npx prisma generate`."
  );
}

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
    throw new Error(`sorting: requires SCREENED/PROCESSED → SORTED (got ${fromRaw} → ${toRaw})`);
  }

  const s1 = stationFrom(fromMmaCode);
  const s2 = stationFrom(toMmaCode);
  if (s1 && s2 && s1 !== s2) {
    throw new Error(`sorting: station mismatch '${s1}' → '${s2}'`);
  }
}

/**
 * sorting(): one-to-one bridge SCREENED/PROCESSED -> SORTED
 *
 * Inventory:
 *   processed.withdraw(...)  // serves SCREENED MMAs
 *   sorted.deposit(...)
 *
 * Persistence:
 *   exactly ONE row into sorting_tbl (SUCCESS), or ROLLED_BACK/FAILED on error paths.
 *
 * Payload:
 * {
 *   processId?: string,
 *   fromMmaCode: 'PSS_SCREENED' | 'PSS_PROCESSED',
 *   toMmaCode:   'PSS_SORTED',
 *   supplierId: number,
 *   from: { shade, size, qtyT, stationCode?: string|null },
 *   to?:  { shade?, size?, qtyT?, stationCode?: string|null },
 *   meta?: { ht?: number, wastage?: number, ... }
 * }
 */
export default async function sorting(payload) {
  const {
    processId = `SORT-${uuidv4().slice(0, 8).toUpperCase()}`,
    fromMmaCode = 'ABS_PROCESSED',
    toMmaCode   = 'ABS_SORTED',
    supplierId,
    from,
    to = {},
    meta = {},
  } = payload ?? {};

  // idempotency
  const existing = await Sorting.findUnique({ where: { processId } }).catch(() => null);
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

  assertPair(fromMmaCode, toMmaCode);

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

  // carry meta (including ht & wastage) to both legs
  const baseMeta = { ...meta, process: 'SORTING' };
  const htVal = meta?.ht !== undefined && meta.ht !== '' ? Number(meta.ht) : null;
  const wastageVal = meta?.wastage !== undefined && meta.wastage !== '' ? Number(meta.wastage) : null;

  let withdrawPost = null;
  try {
    // 1) withdraw from SCREENED/PROCESSED
    const w = await processed.withdraw({
      fromMmaCode,
      supplierId,
      shade: fromShade,
      size: fromSize,
      qty: qtyT,
      processId,
      fromStationCode,
      meta: { ...baseMeta, step: 'sorting.consume' },
    });
    withdrawPost = w?.posting ?? null;

    // 2) deposit into SORTED
    const d = await sorted.deposit({
      toMmaCode,
      supplierId,
      shade: toShade,
      size: toSize,
      qty: qtyT,
      processId,
      toStationCode,
      meta: { ...baseMeta, step: 'sorting.produce' },
    });
    const depositPost = d?.posting ?? null;

    // 3) log once
    await Sorting.create({
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
    // compensate if needed
    if (withdrawPost) {
      try {
        await processed.deposit({
          toMmaCode: fromMmaCode,
          supplierId,
          shade: fromShade,
          size: fromSize,
          qty: qtyT,
          processId,
          toStationCode: fromStationCode,
          meta: { ...baseMeta, step: 'sorting.rollback.source' },
        });

        await Sorting.create({
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
        await Sorting.create({
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

    await Sorting.create({
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
