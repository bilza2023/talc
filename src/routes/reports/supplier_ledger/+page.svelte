<script>
  import SupplierLedgerTable from './supplier_ledger_table.svelte';
  export let data = {};

  const supplier = data?.supplier ?? null;
  const period = data?.period ?? { from: null, to: null };
  const rows = Array.isArray(data?.rows) ? data.rows : [];
</script>

<h1>Supplier Purchase Ledger</h1>
<p>
  {#if supplier?.name}Supplier: {supplier.name} · {/if}
  Period: {period?.from || '—'} → {period?.to || '—'}
</p>

<SupplierLedgerTable rows={rows} showTotals={true} />
