<script>
  import ListTable from '$lib/listTable/ListTable.svelte';
  export let data = {};

  // Source data from server (unchanged)
  const rows = Array.isArray(data?.rows) ? data.rows : [];

  // Flat columns (no grouped header, no footer)
  const columns = [
    { key: 'sno',               label: 'S/No.',             kind: 'number', align: 'right',  sortable: true },
    { key: 'date',              label: 'Date',              kind: 'text',   align: 'left',   sortable: true },
    { key: 'particulars',       label: 'Particulars',       kind: 'text',   align: 'left',   sortable: true },
    { key: 'supplierName',      label: 'Supplier',          kind: 'text',   align: 'left',   sortable: true },

    { key: 'lumps',             label: 'Lumps (t)',         kind: 'number', align: 'right',  sortable: true },
    { key: 'chips',             label: 'Chips (t)',         kind: 'number', align: 'right',  sortable: true },
    { key: 'fines',             label: 'Fines (t)',         kind: 'number', align: 'right',  sortable: true },
    { key: 'totalQty',          label: 'Total (t)',         kind: 'number', align: 'right',  sortable: true }, // derived

    { key: 'rate',              label: 'Rate/mt',           kind: 'number', align: 'right',  sortable: true },
    { key: 'value',             label: 'Value',             kind: 'number', align: 'right',  sortable: true }, // derived

    { key: 'freightMt',         label: 'Freight/mt',        kind: 'number', align: 'right',  sortable: true },
    { key: 'suppFreight',       label: 'Supplier Freight',  kind: 'number', align: 'right',  sortable: true },
    { key: 'roadExp',           label: 'Road Exp',          kind: 'number', align: 'right',  sortable: true },
    { key: 'suppFreightTotal',  label: 'Total Supp Freight',kind: 'number', align: 'right',  sortable: true }, // derived

    { key: 'cashPaid',          label: 'Cash Paid',         kind: 'number', align: 'right',  sortable: true },

    { key: 'netFreightMt',      label: 'NW Freight/mt',     kind: 'number', align: 'right',  sortable: true }, // derived
    { key: 'netFreightTotal',   label: 'NW Total Freight',  kind: 'number', align: 'right',  sortable: true }, // derived

    { key: 'remarks',           label: 'Remarks',           kind: 'text',   align: 'left',   sortable: false }
  ];

  // Items for ListTable (keep it flat; compute a couple of safe derived values)
  const num = (x) => (x == null ? 0 : Number(x));
  const items = rows.map(r => {
    const totalQty = num(r.lumps) + num(r.chips) + num(r.fines);
    // value / suppFreightTotal / netFreightMt / netFreightTotal are already computed in server;
    // we keep fallbacks to be safe, but do not change values if present
    const value             = r.value ?? (totalQty * num(r.rate));
    const netFreightMt      = r.netFreightMt ?? (num(r.freightMt) - num(r.suppFreight));
    const suppFreightTotal  = r.suppFreightTotal ?? ((totalQty * num(r.suppFreight)) + num(r.roadExp));
    const netFreightTotal   = r.netFreightTotal ?? (totalQty * netFreightMt);

    return {
      // identity
      id: r.purchaseId ?? r.sno,   // ListTable usually wants a stable id; sno is fine as fallback

      // displayed fields
      sno: r.sno,
      date: r.date,
      particulars: r.particulars,
      supplierName: r.supplierName ?? '',

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

      remarks: r.remarks || ''
    };
  });

  // Optional: enable built-in search over a few keys (no custom code)
  const searchKeys = ['particulars', 'supplierName', 'date'];

  // Optional: primary-click navigation (if your ListTable supports row links via `getHref`)
  const getHref = (item) => {
    // prefer deposit ledger if available (the server already returns these fields)
    const original = rows.find(r => (r.purchaseId ?? r.sno) === item.id);
    if (!original) return null;
    if (original.depositLedgerId) return `/ledger/${original.depositLedgerId}`;
    if (original.purchaseId)      return `/purchase/${original.purchaseId}`;
    return null;
  };
</script>

<!-- Title/subtitle kept very minimal; feel free to remove -->
<h1>Supplier Purchase Ledger</h1>
<p style="opacity:.75">
  {#if data?.supplier?.name}Supplier: {data.supplier.name} · {/if}
  Period: {data?.period?.from || '—'} → {data?.period?.to || '—'}
</p>

<!-- Pure ListTable: no multi-row header, no totals/footer, no custom CSS -->
<ListTable
  {columns}
  {items}
  {searchKeys}
  {getHref}
/>
