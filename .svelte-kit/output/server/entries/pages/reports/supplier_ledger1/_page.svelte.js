import { c as create_ssr_component, b as escape, v as validate_component } from "../../../../chunks/ssr.js";
import { L as ListTable } from "../../../../chunks/ListTable.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data = {} } = $$props;
  const rows = Array.isArray(data?.rows) ? data.rows : [];
  const columns = [
    {
      key: "sno",
      label: "S/No.",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      key: "date",
      label: "Date",
      kind: "text",
      align: "left",
      sortable: true
    },
    {
      key: "particulars",
      label: "Particulars",
      kind: "text",
      align: "left",
      sortable: true
    },
    {
      key: "supplierName",
      label: "Supplier",
      kind: "text",
      align: "left",
      sortable: true
    },
    {
      key: "lumps",
      label: "Lumps (t)",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      key: "chips",
      label: "Chips (t)",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      key: "fines",
      label: "Fines (t)",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      key: "totalQty",
      label: "Total (t)",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      key: "rate",
      // derived
      label: "Rate/mt",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      key: "value",
      label: "Value",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      key: "freightMt",
      // derived
      label: "Freight/mt",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      key: "suppFreight",
      label: "Supplier Freight",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      key: "roadExp",
      label: "Road Exp",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      key: "suppFreightTotal",
      label: "Total Supp Freight",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      key: "cashPaid",
      // derived
      label: "Cash Paid",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      key: "netFreightMt",
      label: "NW Freight/mt",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      key: "netFreightTotal",
      // derived
      label: "NW Total Freight",
      kind: "number",
      align: "right",
      sortable: true
    },
    {
      key: "remarks",
      // derived
      label: "Remarks",
      kind: "text",
      align: "left",
      sortable: false
    }
  ];
  const num = (x) => x == null ? 0 : Number(x);
  const items = rows.map((r) => {
    const totalQty = num(r.lumps) + num(r.chips) + num(r.fines);
    const value = r.value ?? totalQty * num(r.rate);
    const netFreightMt = r.netFreightMt ?? num(r.freightMt) - num(r.suppFreight);
    const suppFreightTotal = r.suppFreightTotal ?? totalQty * num(r.suppFreight) + num(r.roadExp);
    const netFreightTotal = r.netFreightTotal ?? totalQty * netFreightMt;
    return {
      // identity
      id: r.purchaseId ?? r.sno,
      // ListTable usually wants a stable id; sno is fine as fallback
      // displayed fields
      sno: r.sno,
      date: r.date,
      particulars: r.particulars,
      supplierName: r.supplierName ?? "",
      lumps: num(r.lumps),
      chips: num(r.chips),
      fines: num(r.fines),
      totalQty,
      rate: num(r.rate),
      value,
      freightMt: num(r.freightMt),
      suppFreight: num(r.suppFreight),
      roadExp: num(r.roadExp),
      suppFreightTotal,
      cashPaid: num(r.cashPaid),
      netFreightMt,
      netFreightTotal,
      remarks: r.remarks || ""
    };
  });
  const searchKeys = ["particulars", "supplierName", "date"];
  const getHref = (item) => {
    const original = rows.find((r) => (r.purchaseId ?? r.sno) === item.id);
    if (!original) return null;
    if (original.depositLedgerId) return `/ledger/${original.depositLedgerId}`;
    if (original.purchaseId) return `/purchase/${original.purchaseId}`;
    return null;
  };
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return ` <h1 data-svelte-h="svelte-4kx2ms">Supplier Purchase Ledger</h1> <p style="opacity:.75">${data?.supplier?.name ? `Supplier: ${escape(data.supplier.name)} ·` : ``}
  Period: ${escape(data?.period?.from || "—")} → ${escape(data?.period?.to || "—")}</p>  ${validate_component(ListTable, "ListTable").$$render($$result, { columns, items, searchKeys, getHref }, {}, {})}`;
});
export {
  Page as default
};
