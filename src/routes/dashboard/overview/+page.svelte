
<script>
  export let data;
  const { days, since, ore, talc, totals } = data;

  const fmtTon = (x) => {
    const n = Number(x || 0);
    return (Math.round(n * 10) / 10).toLocaleString();
  };
  const fmtDate = (iso) => new Date(iso).toLocaleDateString();
</script>

<div class="min-h-screen bg-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-6xl p-6 space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold">Overview</h1>
      <p class="text-sm text-[#9fb0c5]">
        Window: last {days} days (since {fmtDate(since)})
      </p>
      <div class="mt-2 inline-flex gap-2">
        <a href="?days=7"  class="rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/5 {days===7  ? 'bg-white/10' : ''}">7d</a>
        <a href="?days=30" class="rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/5 {days===30 ? 'bg-white/10' : ''}">30d</a>
        <a href="?days=90" class="rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/5 {days===90 ? 'bg-white/10' : ''}">90d</a>
      </div>
    </header>

    <!-- Company totals -->
    <section class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-xl bg-white/5 p-4 border border-white/10">
        <div class="text-xs text-[#9fb0c5]">In-Transit (shipments)</div>
        <div class="text-3xl font-semibold">{totals.inTransitCount}</div>
        <div class="text-xs text-[#9fb0c5] mt-1">Ton: {fmtTon(totals.inTransitTon)}</div>
      </div>

      <div class="rounded-xl bg-white/5 p-4 border border-white/10">
        <div class="text-xs text-[#9fb0c5]">Deposited (last {days}d)</div>
        <div class="text-3xl font-semibold">{fmtTon(totals.depositsTonSince)} t</div>
        <div class="text-xs text-[#9fb0c5] mt-1">Ore + Talc</div>
      </div>

      <div class="rounded-xl bg-white/5 p-4 border border-white/10">
        <div class="text-xs text-[#9fb0c5]">Received (last {days}d)</div>
        <div class="text-3xl font-semibold">{fmtTon(totals.receivedTonSince)} t</div>
        <div class="text-xs text-[#9fb0c5] mt-1">Ore + Talc</div>
      </div>
    </section>

    <!-- By material -->
    <section class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-xl bg-white/5 p-4 border border-white/10">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Ore</h2>
          <a href="/dashboard/ore" class="text-xs text-[#9fb0c5] hover:text-white/90">details →</a>
        </div>
        <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-lg bg-white/5 p-3 border border-white/10">
            <div class="text-[#9fb0c5]">In-Transit</div>
            <div class="text-xl font-semibold">{ore.inTransitCount} <span class="text-xs text-[#9fb0c5]">shipments</span></div>
            <div class="text-xs text-[#9fb0c5] mt-1">Ton: {fmtTon(ore.inTransitTon)}</div>
          </div>
          <div class="rounded-lg bg-white/5 p-3 border border-white/10">
            <div class="text-[#9fb0c5]">Deposited ({days}d)</div>
            <div class="text-xl font-semibold">{fmtTon(ore.depositsTonSince)} t</div>
          </div>
          <div class="rounded-lg bg-white/5 p-3 border border-white/10">
            <div class="text-[#9fb0c5]">Received ({days}d)</div>
            <div class="text-xl font-semibold">{fmtTon(ore.receivedTonSince)} t</div>
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-white/5 p-4 border border-white/10">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Talc</h2>
          <a href="/dashboard/talc" class="text-xs text-[#9fb0c5] hover:text-white/90">details →</a>
        </div>
        <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-lg bg-white/5 p-3 border border-white/10">
            <div class="text-[#9fb0c5]">In-Transit</div>
            <div class="text-xl font-semibold">{talc.inTransitCount} <span class="text-xs text-[#9fb0c5]">shipments</span></div>
            <div class="text-xs text-[#9fb0c5] mt-1">Ton: {fmtTon(talc.inTransitTon)}</div>
          </div>
          <div class="rounded-lg bg-white/5 p-3 border border-white/10">
            <div class="text-[#9fb0c5]">Deposited ({days}d)</div>
            <div class="text-xl font-semibold">{fmtTon(talc.depositsTonSince)} t</div>
          </div>
          <div class="rounded-lg bg-white/5 p-3 border border-white/10">
            <div class="text-[#9fb0c5]">Received ({days}d)</div>
            <div class="text-xl font-semibold">{fmtTon(talc.receivedTonSince)} t</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick links to deeper boards -->
    <nav class="grid gap-2 sm:grid-cols-3">
      <a href="/dashboard/trucks" class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">Trucks / Transport</a>
      <a href="/dashboard/in-transit" class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">In-Transit Aging</a>
      <a href="/dashboard/stations" class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">Stations Snapshot</a>
      <a href="/dashboard/grades" class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">Grade Mix</a>
      <a href="/dashboard/suppliers" class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">Suppliers (Ore)</a>
      <a href="/dashboard/traceability" class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">Traceability</a>
    </nav>
  </div>
</div>
