<script>
  import SupplierLedgerTable from './supplier_ledger_table.svelte';
  export let data = {};

  const supplier = data?.supplier ?? null;
  const period = data?.period ?? { from: null, to: null };
  const rows = Array.isArray(data?.rows) ? data.rows : [];
</script>

<h1 class="center-heading">Supplier Ledger Report</h1>

<div class="dbl">
  <SupplierLedgerTable rows={rows} showTotals={true} />

</div>

<style>

  .dbl{
    font-size: 2.75rem;
  }

  .center-heading {
    text-align: center;
    margin: 1rem 0 1.5rem;
    color: white;
    font-size: 1.5rem;
    font-weight: 600;
  }
</style>
