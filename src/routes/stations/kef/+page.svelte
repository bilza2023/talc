<script>
  import Card from '$lib/components/Card.svelte';
  export let data;

  const stationCode = data.stationCode ?? 'KEF';
  const stationName = data.stationName ?? 'Karachi Export Facility';

  // Hard-coded single MMA
  const MMA1 = { code: 'KEF_SORTED', label: 'Sorted' };
</script>

<h1 style="margin:0.25rem 0 0;">{stationCode}</h1>
<p style="margin:0.25rem 0 1rem; opacity:0.9;">{stationName}</p>

<section style="margin-top:0.5rem;">
  <h2 class="section-title">MMA</h2>
  <div class="mmas">
    <span class="mma">{MMA1.label} <small>({MMA1.code})</small></span>
  </div>
</section>

<section style="margin-top:1rem;">
  <h2 class="section-title">Actions</h2>

  <!-- No loops: two explicit cards -->
  <div class="actions-grid">
    <Card href="/stations/kef/receive_pss_sorted" icon="📥" label="Receive (PSS_SORTED → KEF_SORTED)" />
    <Card href="/stations/kef/kef_sorted"         icon="📦" label="Slots — Sorted" />
  </div>
</section>

<style>
  :global(body) {
    background: var(--backgroundColor);
    color: var(--primaryText);
  }

  h1 { font-size: 1.25rem; line-height: 1.2; }
  p  { font-size: 0.95rem; }

  .section-title {
    font-size: 1rem;
    margin: 0 0 0.5rem;
    opacity: 0.95;
  }

  /* MMA badges */
  .mmas {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .mma {
    background: var(--cardBg, rgba(255,255,255,0.06));
    border: 1px solid var(--cardBorder, rgba(255,255,255,0.12));
    padding: 0.4rem 0.6rem;
    border-radius: 999px;
    font-size: 0.85rem;
  }
  .mma small {
    opacity: 0.75;
    font-size: 0.8em;
    margin-left: 0.25rem;
  }

  /* Mobile-first: two cards centered horizontally */
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
    justify-items: center;
    padding: 0 0.5rem;
  }

  :global(.card) {
    width: 100%;
    max-width: 140px;
    min-height: 90px;
    text-align: center;
  }
</style>
