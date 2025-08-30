
<!-- /home/bilal-tariq/ab/src/routes/dashboard/talc/+page.svelte -->
<script>
  export let data;

  const { totals, stationSummary, inTransit, gradeTotals, gradeMatrix, asOf } = data ?? {};

  const fmtTon = (n) =>
    n == null ? "—" : Number(n).toLocaleString(undefined, { maximumFractionDigits: 3 });
  const fmtDateTime = (s) => (s ? new Date(s).toLocaleString() : "—");
  const fmtPct = (p) =>
    (p == null || isNaN(p)) ? "—" : `${(Number(p) * 100).toFixed(1)}%`;

  function ageFrom(dispatchedAt) {
    if (!dispatchedAt) return "—";
    const ms = Date.now() - new Date(dispatchedAt).getTime();
    if (ms < 0) return "0h";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  function pctShare(stock) {
    if (!totals || !totals.totalStock) return "—";
    const p = (Number(stock || 0) / Number(totals.totalStock)) * 100;
    return `${p.toFixed(1)}%`;
  }
</script>

<div class="min-h-screen bg-gradient-to-b from-[#0a0d13] to-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-7xl px-4 py-8 space-y-8">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">Talc — Global Dashboard</h1>
      <p class="text-sm text-[#9fb0c5]">
        As of <span class="font-medium text-[#e6ebf1]">{fmtDateTime(asOf)}</span>
      </p>
    </header>

    <!-- Headline Totals -->
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <div class="text-sm text-[#9fb0c5]">Total Stock</div>
        <div class="mt-1 text-3xl font-semibold">
          {fmtTon(totals?.totalStock)} <span class="text-base font-normal">t</span>
        </div>
      </div>
      <div class="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <div class="text-sm text-[#9fb0c5]">In-Transit</div>
        <div class="mt-1 text-3xl font-semibold">
          {fmtTon(totals?.inTransitTons)} <span class="text-base font-normal">t</span>
        </div>
      </div>
      <div class="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <div class="text-sm text-[#9fb0c5]">System Total</div>
        <div class="mt-1 text-3xl font-semibold">
          {fmtTon(totals?.systemTotal)} <span class="text-base font-normal">t</span>
        </div>
      </div>
    </section>

    <!-- Station Summary -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold">Station Summary</h2>
      <div class="overflow-x-auto rounded-xl border border-white/10">
        <table class="min-w-full text-sm">
          <thead class="bg-white/5 text-left text-[#9fb0c5]">
            <tr>
              <th class="px-4 py-3 font-medium">Station</th>
              <th class="px-4 py-3 font-medium">External Deposits (t)</th>
              <th class="px-4 py-3 font-medium">Received (t)</th>
              <th class="px-4 py-3 font-medium">Outbound In-Transit (t)</th>
              <th class="px-4 py-3 font-medium">Current Stock (t)</th>
              <th class="px-4 py-3 font-medium">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {#if stationSummary?.length}
              {#each stationSummary as r}
                <tr class="even:bg-white/[0.03]">
                  <td class="px-4 py-3 font-medium">{r.stationCode}</td>
                  <td class="px-4 py-3">{fmtTon(r.deposits)}</td>
                  <td class="px-4 py-3">{fmtTon(r.received)}</td>
                  <td class="px-4 py-3">{fmtTon(r.inTransit)}</td>
                  <td class="px-4 py-3 font-semibold">{fmtTon(r.stock)}</td>
                  <td class="px-4 py-3">{fmtDateTime(r.lastActivity)}</td>
                </tr>
              {/each}
            {:else}
              <tr>
                <td class="px-4 py-6 text-center text-[#9fb0c5]" colspan="6">No station data.</td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Per-station × Per-grade Matrix -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold">Per-Station by Grade</h2>
      <div class="overflow-x-auto rounded-xl border border-white/10">
        <table class="min-w-full text-sm">
          <thead class="bg-white/5 text-left text-[#9fb0c5]">
            <tr>
              <th class="px-4 py-3 font-medium">Station</th>
              {#each gradeMatrix?.grades ?? [] as g}
                <th class="px-4 py-3 font-medium">{g}</th>
              {/each}
              <th class="px-4 py-3 font-medium">Total (t)</th>
            </tr>
          </thead>
          <tbody>
            {#if gradeMatrix?.rows?.length}
              {#each gradeMatrix.rows as row}
                <tr class="even:bg-white/[0.03] align-top">
                  <td class="px-4 py-3 font-medium">{row.stationCode}</td>
                  {#each gradeMatrix.grades as g}
                    <td class="px-4 py-3 whitespace-nowrap">
                      <div class="font-semibold">
                        {fmtTon(row.byGrade[g])} <span class="text-xs font-normal">t</span>
                      </div>
                      <div class="text-xs text-[#9fb0c5]">({fmtPct(row.byGradePct[g])})</div>
                    </td>
                  {/each}
                  <td class="px-4 py-3 font-semibold">{fmtTon(row.totalStock)}</td>
                </tr>
              {/each}
            {:else}
              <tr>
                <td class="px-4 py-6 text-center text-[#9fb0c5]" colspan={(gradeMatrix?.grades?.length ?? 0) + 2}>
                  No per-grade data.
                </td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    </section>

    <!-- In-Transit Movements -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold">In-Transit Movements</h2>
      <div class="overflow-x-auto rounded-xl border border-white/10">
        <table class="min-w-full text-sm">
          <thead class="bg-white/5 text-left text-[#9fb0c5]">
            <tr>
              <th class="px-4 py-3 font-medium">ID</th>
              <th class="px-4 py-3 font-medium">From → To</th>
              <th class="px-4 py-3 font-medium">Grade</th>
              <th class="px-4 py-3 font-medium">Send Weight (t)</th>
              <th class="px-4 py-3 font-medium">Dispatched At</th>
              <th class="px-4 py-3 font-medium">Age</th>
            </tr>
          </thead>
          <tbody>
            {#if inTransit?.length}
              {#each inTransit as t}
                <tr class="even:bg-white/[0.03]">
                  <td class="px-4 py-3 font-medium">{t.id}</td>
                  <td class="px-4 py-3">
                    <span class="font-medium">{t.fromStation}</span>
                    <span class="text-[#9fb0c5]"> → </span>
                    <span class="font-medium">{t.toStation}</span>
                  </td>
                  <td class="px-4 py-3">{t.sendGradeCode}</td>
                  <td class="px-4 py-3">{fmtTon(t.sendWeightTon)}</td>
                  <td class="px-4 py-3">{fmtDateTime(t.dispatchedAt)}</td>
                  <td class="px-4 py-3">{ageFrom(t.dispatchedAt)}</td>
                </tr>
              {/each}
            {:else}
              <tr>
                <td class="px-4 py-6 text-center text-[#9fb0c5]" colspan="6">No in-transit movements.</td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Grade Totals -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold">Grade Totals (Snapshot)</h2>
      <div class="overflow-x-auto rounded-xl border border-white/10">
        <table class="min-w-full text-sm">
          <thead class="bg-white/5 text-left text-[#9fb0c5]">
            <tr>
              <th class="px-4 py-3 font-medium">Grade</th>
              <th class="px-4 py-3 font-medium">Total Stock (t)</th>
              <th class="px-4 py-3 font-medium">Share</th>
            </tr>
          </thead>
          <tbody>
            {#if gradeTotals?.length}
              {#each gradeTotals as g}
                <tr class="even:bg-white/[0.03]">
                  <td class="px-4 py-3 font-medium">{g.gradeCode}</td>
                  <td class="px-4 py-3">{fmtTon(g.stock)}</td>
                  <td class="px-4 py-3">{pctShare(g.stock)}</td>
                </tr>
              {/each}
            {:else}
              <tr>
                <td class="px-4 py-6 text-center text-[#9fb0c5]" colspan="3">No grade data.</td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    </section>
  </div>
</div>
