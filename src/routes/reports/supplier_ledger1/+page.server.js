// /src/routes/reports/supplier_ledger/+page.server.js
import { prisma } from '$lib/stocks/stockEngine.js';

export const load = async ({ url }) => {
  const supplierId = Number(url.searchParams.get('supplierId') ?? 0) || null;
  const from = url.searchParams.get('from') || null;   // 'YYYY-MM-DD'
  const to   = url.searchParams.get('to')   || null;

  const supplier = supplierId
    ? await prisma.supplier.findUnique({
        where: { id: supplierId },
        select: { id: true, name: true }
      })
    : null;

  // Filter on docDate
  const dateFilter = {};
  if (from || to) {
    if (from) dateFilter.gte = new Date(from);
    if (to)   dateFilter.lte = new Date(to + 'T23:59:59.999Z');
  }

  const where = {
    ...(supplierId ? { supplierId } : {}),
    ...(from || to ? { docDate: dateFilter } : {})
  };

  // Select real columns from purchase_tbl + supplier name (for mixed runs)
  const purchases = await prisma.purchase_tbl.findMany({
    where,
    orderBy: [{ docDate: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      docDate: true,
      supplierId: true,
      supplier: { select: { name: true } }, // <-- for inline supplier badge
      toMmaCode: true,
      shade: true,
      size: true,

      lumps: true,
      chips: true,
      fines: true,
      qtyTotal: true,

      paymentMode: true,
      ratePerMt: true,
      freightPerMt: true,
      supplierFreight: true,
      roadExp: true,

      cashPaid: true,
      remarks: true,
      meta: true,
      depositLedgerId: true
    }
  });

  const num = (x) => (x == null ? 0 : Number(x));

  let sno = 0;
  const rows = purchases.map(p => {
    const lumps = num(p.lumps);
    const chips = num(p.chips);
    const fines = num(p.fines);
    const totalQty = p.qtyTotal != null ? num(p.qtyTotal) : (lumps + chips + fines);

    const rate           = num(p.ratePerMt);        // Rate/mt
    const freightMt      = num(p.freightPerMt);     // Freight/mt
    const suppFreight    = num(p.supplierFreight);  // Supplier Freight (per mt)
    const roadExp        = num(p.roadExp);          // Road Exp (flat)
    const cashPaid       = num(p.cashPaid);         // per-row allocation

    const value            = totalQty * rate;
    const netFreightMt     = freightMt - suppFreight;
    const suppFreightTotal = (totalQty * suppFreight) + roadExp;
    const netFreightTotal  = totalQty * netFreightMt;

    // Particulars text (unchanged logic)
    const particulars =
      (p.meta && (p.meta.biltyNo || p.meta.challanNo || p.meta.truckNo)) ||
      (p.depositLedgerId != null ? String(p.depositLedgerId) : String(p.id));

    return {
      sno: ++sno,
      date: p.docDate instanceof Date ? p.docDate.toISOString().slice(0, 10) : String(p.docDate ?? ''),
      particulars,
      supplierName: p.supplier?.name ?? null,   // <-- for inline badge
      purchaseId: p.id,                         // <-- for link fallback
      depositLedgerId: p.depositLedgerId,       // <-- for preferred link

      lumps, chips, fines,
      rate, value,
      freightMt, suppFreight, roadExp, suppFreightTotal,
      cashPaid,
      netFreightMt, netFreightTotal,
      remarks: p.remarks ?? ''
    };
  });

  return {
    supplier,
    period: { from, to },
    rows
  };
};
