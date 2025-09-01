<script>
    // Props
    export let title = 'Batch Details';
    // rows: [{ id, gradeCode, createdTon, remainingTon, depositedAt?, createdAt? }]
    export let rows = [];
  
    const pct = (r) => (Number(r.createdTon) > 0)
      ? (Number(r.remainingTon) / Number(r.createdTon)) * 100
      : 0;
  
    function fmtDate(r) {
      const raw = r.depositedAt ?? r.createdAt;
      if (!raw) return '';
      const d = new Date(raw);
      return isNaN(d) ? '' :
        `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  </script>
  
  <div class=" bg-[#0f1522]  w-full border-2 border-gray-200 p-8 m-8  rounded-3xl">
    <div class="flex items-center justify-between p-3 sm:p-4">
      <h2 class="text-base sm:text-lg font-semibold text-[#e6ebf1]">{title}</h2>
      <span class="text-xs text-[#9fb0c5]">{rows?.length || 0} open batch{rows?.length === 1 ? '' : 'es'}</span>
    </div>
  
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-xs uppercase text-[#9fb0c5]">
          <tr class="[&>th]:py-2 [&>th]:px-3">
            <th class="text-left">ID</th>
            <th class="text-left">Date</th>
            <th class="text-left">Grade</th>
            <th class="text-right">Start (t)</th>
            <th class="text-right">Present (t)</th>
            <th class="text-right">% Left</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#1b2433] text-[#e6ebf1]">
          {#if rows && rows.length}
            {#each rows as r}
              <tr class="[&>td]:py-2.5 [&>td]:px-3">
                <td class="font-medium">#{r.id}</td>
                <td>{fmtDate(r)}</td>
                <td class="font-medium">{r.gradeCode}</td>
                <td class="text-right">{Number(r.createdTon).toFixed(2)}</td>
                <td class="text-right">{Number(r.remainingTon).toFixed(2)}</td>
                <td class="text-right">{pct(r).toFixed(1)}%</td>
              </tr>
            {/each}
          {:else}
            <tr>
              <td colspan="6" class="py-6 px-3 text-center text-[#9fb0c5]">
                No open batches.
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  </div>
  