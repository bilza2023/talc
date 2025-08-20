<script>
  import DepositOre from '$lib/components/DepositOre.svelte';
  export let data;   // expects { suppliers: [...] }
  export let form;   // SvelteKit form data (will be null initially)
</script>

<div class="px-4 py-6">
  <div class="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow">
    <h1 class="mb-4 text-2xl font-bold text-slate-100">Deposit Ore — JSS</h1>
    <DepositOre stationCode="JSS" suppliers={data.suppliers} {form} />
  </div>
</div>
