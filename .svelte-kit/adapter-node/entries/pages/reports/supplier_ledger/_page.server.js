import { p as prisma } from "../../../../chunks/stockEngine.js";
async function load() {
  const rows = await prisma.purchase_tbl.findMany({
    include: { supplier: { select: { id: true, name: true, code: true } } },
    orderBy: [
      { docDate: "asc" },
      { supplier: { name: "asc" } },
      { toMmaCode: "asc" },
      { createdAt: "asc" }
    ]
  });
  const items = rows.map((r) => ({
    id: r.id,
    // cuid (unique rowKey)
    docDate: r.docDate ? r.docDate.toISOString() : null,
    // ISO for kind:'date'
    supplierName: r.supplier?.name || r.supplier?.code || String(r.supplierId),
    toMmaCode: r.toMmaCode,
    // e.g., ABS_RAW
    shade: String(r.shade),
    size: String(r.size),
    quantity: Number(r.quantity),
    // commercials (numbers or null)
    ratePerMt: r.ratePerMt ?? null,
    freightPerMt: r.freightPerMt ?? null,
    supplierFreight: r.supplierFreight ?? null,
    roadExp: r.roadExp ?? null,
    cashPaid: r.cashPaid ?? null,
    // light text
    paymentMode: r.paymentMode ?? "",
    remarks: r.remarks ?? ""
  }));
  return {
    title: "Supplier Ledger",
    items
  };
}
export {
  load
};
