// Server: Purchase Ledger (grouped by MMA / station)
// Source of truth: purchase_tbl

import { prisma } from '$lib/stocks/stockEngine.js';

export async function load({ url }) {
  // Optional date filters (?from=YYYY-MM-DD&to=YYYY-MM-DD)
  const from = url.searchParams.get('from');
  const to   = url.searchParams.get('to');

  const where = {
    ...(from ? { docDate: { gte: new Date(from) } } : {}),
    ...(to   ? { docDate: { ...(where?.docDate ?? {}), lte: new Date(to) } } : {})
  };

  const rows = await prisma.purchase_tbl.findMany({
    where,
    include: {
      supplier: { select: { id: true, name: true, code: true } }
    },
    orderBy: [
      { toMmaCode: 'asc' },
      { docDate: 'asc' },
      { supplier: { name: 'asc' } },
      { id: 'asc' }
    ]
  });

  // Normalize for ListTable (light rows; strings where helpful)
  const items = rows.map(r => ({
    id: r.id, // cuid
    docDate: r.docDate?.toISOString() ?? null,  // ListTable kind:'date' friendly
    supplierName: r.supplier?.name || r.supplier?.code || String(r.supplierId),
    toMmaCode: r.toMmaCode,    // e.g., ABS_RAW
    shade: String(r.shade),
    size: String(r.size),
    quantity: Number(r.quantity),

    // commercials (optional numbers)
    ratePerMt:        r.ratePerMt        ?? null,
    freightPerMt:     r.freightPerMt     ?? null,
    supplierFreight:  r.supplierFreight  ?? null,
    roadExp:          r.roadExp          ?? null,
    cashPaid:         r.cashPaid         ?? null,
    paymentMode:      r.paymentMode      ?? '',
    remarks:          r.remarks          ?? ''
  }));

  // Group by MMA/station (toMmaCode) → render multiple ListTables
  const groupMap = new Map();
  for (const it of items) {
    if (!groupMap.has(it.toMmaCode)) groupMap.set(it.toMmaCode, []);
    groupMap.get(it.toMmaCode).push(it);
  }

  // Preserve order by toMmaCode asc
  const groups = Array.from(groupMap.entries()).map(([mma, list]) => ({
    mma,
    items: list
  }));

  return {
    title: 'Purchase Ledger',
    from: from || null,
    to: to || null,
    groups
  };
}
