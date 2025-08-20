<script>
    export let data;
    const { stocks = [], inTransitList = [], totals = {}, at } = data;
  
    const ft = (n) =>
      Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  
    const timeAgo = (iso) => {
      if (!iso) return '—';
      const ms = Date.now() - new Date(iso).getTime();
      const mins = Math.floor(ms / 60000);
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    };
  </script>
  
  <div class="min-h-screen bg-slate-950 text-slate-100 px-4 py-6">
    <div class="mx-auto max-w-6xl space-y-6">
      <header class="flex items-end justify-between">
        <div>
          <p class="text-sm uppercase tracking-wide text-slate-400">System Overview</p>
          <h1 class="text-3xl font-bold">Ore Dashboard</h1>
        </div>
        <div class="text-xs text-slate-400">Updated {new Date(at).toLocaleString()}</div>
      </header>
  
      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow">
          <div class="text-xs font-medium text-slate-400">On Ground (All Stations)</div>
          <div class="mt-1 flex items-baseline gap-2">
            <div class="text-3xl font-semibold">{ft(totals.totalStock)}</div>
            <div class="text-slate-400 text-sm">tons</div>
          </div>
        </div>
  
        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow">
          <div class="text-xs font-medium text-slate-400">In Transit (Fleet)</div>
          <div class="mt-1 flex items-baseline gap-2">
            <div class="text-3xl font-semibold">{ft(totals.inTransitTons)}</div>
            <div class="text-slate-400 text-sm">tons</div>
          </div>
        </div>
  
        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow">
          <div class="text-xs font-medium text-slate-400">Total Ore (Ground + Transit)</div>
          <div class="mt-1 flex items-baseline gap-2">
            <div class="text-3xl font-semibold">{ft(totals.systemTotal)}</div>
            <div class="text-slate-400 text-sm">tons</div>
          </div>
        </div>
      </section>
  
      <section class="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow">
        <div class="mb-4">
          <h2 class="text-xl font-semibold">Per-Station (On Ground Only)</h2>
          <p class="text-sm text-slate-400">Deposits + Received − Dispatched = On-Ground Stock.</p>
        </div>
  
        {#if !stocks.length}
          <p class="text-slate-400 text-sm">No ore data yet.</p>
        {:else}
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="text-slate-300">
                <tr class="border-b border-slate-800">
                  <th scope="col" class="py-2 pr-4 text-left font-medium">Station</th>
                  <th scope="col" class="py-2 px-4 text-right font-medium">Deposits (t)</th>
                  <th scope="col" class="py-2 px-4 text-right font-medium">Received (t)</th>
                  <th scope="col" class="py-2 px-4 text-right font-medium">Dispatched (t)</th>
                  <th scope="col" class="py-2 pl-4 text-right font-medium">On Ground (t)</th>
                </tr>
              </thead>
              <tbody class="text-slate-200">
                {#each stocks as s (s.stationCode)}
                  <tr class="border-b border-slate-800/60 hover:bg-slate-800/50">
                    <th scope="row" class="py-2 pr-4 font-semibold text-slate-100">{s.stationCode}</th>
                    <td class="py-2 px-4 text-right">{ft(s.deposits)}</td>
                    <td class="py-2 px-4 text-right">{ft(s.received)}</td>
                    <td class="py-2 px-4 text-right">{ft(s.dispatched)}</td>
                    <td class="py-2 pl-4 text-right">{ft(s.stock)}</td>
                  </tr>
                {/each}
              </tbody>
              <tfoot class="text-slate-100">
                <tr>
                  <th scope="row" class="py-2 pr-4 font-semibold">Total</th>
                  <td class="py-2 px-4 text-right">
                    {ft(stocks.reduce((a,s)=>a+Number(s.deposits||0),0))}
                  </td>
                  <td class="py-2 px-4 text-right">
                    {ft(stocks.reduce((a,s)=>a+Number(s.received||0),0))}
                  </td>
                  <td class="py-2 px-4 text-right">
                    {ft(stocks.reduce((a,s)=>a+Number(s.dispatched||0),0))}
                  </td>
                  <td class="py-2 pl-4 text-right">{ft(totals.totalStock)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        {/if}
      </section>
  
      <section class="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow">
        <div class="mb-4">
          <h2 class="text-xl font-semibold">In Transit (Live Shipments)</h2>
          <p class="text-sm text-slate-400">Each row is a truck currently moving ore between stations.</p>
        </div>
  
        {#if !inTransitList.length}
          <p class="text-slate-400 text-sm">No shipments in transit.</p>
        {:else}
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="text-slate-300">
                <tr class="border-b border-slate-800">
                  <th class="py-2 pr-4 text-left font-medium">From</th>
                  <th class="py-2 px-4 text-left font-medium">To</th>
                  <th class="py-2 px-4 text-left font-medium">Truck</th>
                  <th class="py-2 px-4 text-right font-medium">Weight (t)</th>
                  <th class="py-2 px-4 text-left font-medium">Departed</th>
                  <th class="py-2 pl-4 text-left font-medium">Age</th>
                </tr>
              </thead>
              <tbody class="text-slate-200">
                {#each inTransitList as t (t.id)}
                  <tr class="border-b border-slate-800/60 hover:bg-slate-800/50">
                    <td class="py-2 pr-4 font-semibold">{t.fromStation}</td>
                    <td class="py-2 px-4">{t.toStation}</td>
                    <td class="py-2 px-4">{t.truckNo}</td>
                    <td class="py-2 px-4 text-right">{ft(t.weightTon)}</td>
                    <td class="py-2 px-4">{new Date(t.departedAt).toLocaleString()}</td>
                    <td class="py-2 pl-4">{timeAgo(t.departedAt)}</td>
                  </tr>
                {/each}
              </tbody>
              <tfoot class="text-slate-100">
                <tr>
                  <th colspan="3" class="py-2 pr-4 text-right font-semibold">Total In Transit</th>
                  <td class="py-2 px-4 text-right">{ft(totals.inTransitTons)}</td>
                  <td class="py-2 px-4"></td>
                  <td class="py-2 pl-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        {/if}
      </section>
    </div>
  </div>
  