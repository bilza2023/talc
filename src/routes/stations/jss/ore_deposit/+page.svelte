<script>
  export let data;
  import DepositOre from '$lib/components/DepositOre.svelte';
  const station = 'JSS';
</script>

<div class="min-h-screen bg-slate-950 text-slate-100">
  <div class="mx-auto max-w-3xl p-4">
    <div class="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
      <div class="border-b border-slate-800 px-5 py-4">
        <h1 class="text-xl font-semibold">Deposit Ore — {station}</h1>
      </div>
      <div class="p-5">
        <DepositOre stationCode={station} suppliers={data.suppliers} />
      </div>
    </div>
  </div>
</div>
