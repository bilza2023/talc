
<!-- /src/routes/stations/kef/+page.svelte -->
<script>
  export let data;

  const {
    stationCode, stationName,
    mmas = [], inboundCounts = {},
    cards = []
  } = data;
</script>

<h1>{stationCode} — Station Home</h1>
<p>{stationName}</p>

<section>
  <h2>Material Management Areas</h2>
  <ul>
    {#each mmas as m}
      <li>
        <code>{m.mmaCode}</code> — {m.label}
        {#if inboundCounts?.[m.mmaCode] > 0}
          <em>({inboundCounts[m.mmaCode]} inbound)</em>
        {/if}
      </li>
    {/each}
  </ul>
</section>

<section style="margin-top:1rem;">
  <h2>Actions</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0.75rem;">
    {#each cards as c}
      <a href={c.href} style="display:flex;gap:0.5rem;align-items:center;padding:0.75rem;border:1px solid #444;border-radius:12px;text-decoration:none;">
        <span style="font-size:1.25rem;line-height:1;">{c.icon}</span>
        <span>{c.label}</span>
      </a>
    {/each}
  </div>
</section>
