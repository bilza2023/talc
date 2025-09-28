<script>
  export let data;
  export let form;

  const {
    stationCode, stationName,
    mmas = [], inboundCounts = {},
    cards = []
  } = data;

  const success = form?.success;
  const error   = form?.error;
</script>

<h1>{stationCode} — Station</h1>
{#if success}
  <p class="success" aria-live="polite">OK ✓</p>
{:else if error}
  <p class="error" aria-live="assertive">{error}</p>
{/if}

<section>
  <h2>MMAs</h2>
  <ul>
    {#each mmas as m}
      <li>
        <strong>{m.label}</strong>
        <code>{m.mmaCode}</code>
        — inbound: {inboundCounts[m.mmaCode] ?? 0}
      </li>
    {/each}
  </ul>
</section>

<section>
  <h2>Actions</h2>
  <nav>
    {#each cards as c}
      <a href={c.href} aria-label={c.label} title={c.label}>
        <span class="icon">{c.icon}</span> {c.label}
      </a>
    {/each}
  </nav>
</section>
