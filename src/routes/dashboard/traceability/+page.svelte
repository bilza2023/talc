<script>
  import { page } from '$app/stores';

  export let data;
  const { days, since, status, filter, rows, totals } = data;

  const fmtTon = (x) => (Math.round(Number(x || 0) * 10) / 10).toLocaleString();
  const fmtPct = (x) => `${(Math.round(Number(x || 0) * 10) / 10).toLocaleString()}%`;
  const fmtHrs = (x) => (x == null ? '—' : (Math.round(Number(x || 0) * 10) / 10).toLocaleString());
  const fmtDT  = (iso) => (iso ? new Date(iso).toLocaleString() : '—');

  // SSR-safe link builder (clones current query from $page.url.searchParams)
  function link(params) {
    const usp = new URLSearchParams($page.url.searchParams);
    for (const [k, v] of Object.entries(params)) {
      if (v == null || v === '') usp.delete(k);
      else usp.set(k, v);
    }
    return `?${usp.toString()}`;
  }
</script>

<div class="min-h-screen bg-[#0b1018] text-[#e6ebf1]">
  <div class="mx-auto max-w-6xl p-6 space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold">Traceability (Ore → Talc)</h1>
      <p class="text-sm text-[#9fb0c5]">Window: last {days} days (since {new Date(since).toLocaleDateString()})</p>

      <!-- Filters -->
      <div class="flex flex-wrap gap-2 items-center">
        <div class="inline-flex gap-2">
          <a href={link({ days: 7 })}  class="rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/5 {days===7  ? 'bg-white/10' : ''}">7d</a>
          <a href={link({ days: 30 })} class="rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/5 {days===30 ? 'bg-white/10' : ''}">30d</a>
          <a href={link({ days: 90 })} class="rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/5 {days===90 ? 'bg-white/10' : ''}">90d</a>
        </div>

        <div class="inline-flex gap-2 ml-3">
          <a href={link({ status: 'received' })} class="rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/5 {status==='received' ? 'bg-white/10' : ''}">Received</a>
          <a href={link({ status: 'all' })}      class="rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/5 {status==='all' ? 'bg-white/10' : ''}">All</a>
        </div>

        <form method="GET" class="ml-auto flex gap-2 items-center">
          <input name="from" placeholder="From station" value={filter?.fromStation || ''} class="bg-transparent border border-white/10 rounded-md px-2 py-1 text-sm outline-none" />
          <input name="to"   placeholder="To station"   value={filter?.toStation   || ''} class="bg-transparent border border-white/10 rounded-md px-2 py-1 text-sm outline-none" />
          <input type="hidden" name="days" value={days} />
          <input type="hidden" name="status" value={status} />
          <button class="rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/5">Apply</button>
        </form>
      </div>
    </header>

    <!-- Head stats -->
    <section class="grid gap-4 sm:grid-cols-4">
      <div class="rounded-xl bg-white/5 p-4 border border-white/10"><div class="text-xs text-[#9fb0c5]">Transports</div><div class="text-3xl font-semibold">{totals.transports}</div></div>
      <div class="rounded-xl bg-white/5 p-4 border border-white/10"><div class="text-xs text-[#9fb0c5]">Send (t)</div><div class="text-3xl font-semibold">{fmtTon(totals.sendTon)}</div></div>
      <div class="rounded-xl bg-white/5 p-4 border border-white/10"><div class="text-xs text-[#9fb0c5]">Linked Talc (t)</div><div class="text-3xl font-semibold">{fmtTon(totals.linkedTon)}</div></div>
      <div class="rounded-xl bg-white/5 p-4 border border-white/10"><div class="text-xs text-[#9fb0c5]">Avg Coverage %</div><div class="text-3xl font-semibold">{fmtPct(totals.sendTon > 0 ? (totals.linkedTon / totals.sendTon) * 100 : 0)}</div></div>
    </section>

    <!-- Table -->
    <div class="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
      <table class="min-w-full text-sm">
        <thead class="text-left text-[#9fb0c5]">
          <tr>
            <th class="px-3 py-2">Route</th>
            <th class="px-3 py-2">Send Grade</th>
            <th class="px-3 py-2">Send (t)</th>
            <th class="px-3 py-2">Linked Talc (t)</th>
            <th class="px-3 py-2">Coverage %</th>
            <th class="px-3 py-2">Lag (h)</th>
            <th class="px-3 py-2">Received At</th>
          </tr>
        </thead>
        <tbody>
          {#if rows.length === 0}
            <tr><td colspan="7" class="px-3 py-4 text-center text-[#9fb0c5]">No transports in this window.</td></tr>
          {:else}
            {#each rows as r}
              <tr class="border-t border-white/10">
                <td class="px-3 py-2">{r.route}</td>
                <td class="px-3 py-2">{r.sendGrade}</td>
                <td class="px-3 py-2">{fmtTon(r.sendTon)}</td>
                <td class="px-3 py-2">{fmtTon(r.linkedTalcTon)}</td>
                <td class="px-3 py-2">{fmtPct(r.coveragePct)}</td>
                <td class="px-3 py-2">{fmtHrs(r.lagHrs)}</td>
                <td class="px-3 py-2 whitespace-nowrap">{fmtDT(r.receivedAt)}</td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>
