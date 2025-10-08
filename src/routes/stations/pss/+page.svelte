<script>
  import Card from '$lib/components/Card.svelte';
  export let data;

  const stationCode = data.stationCode ?? 'PSS';
  const stationName = data.stationName ?? 'Peshawar (PSS)';

  // PSS hard-coded MMAs (no loops)
  const MMA1 = { code: 'PSS_SCREENED', label: 'Screened' };
  const MMA2 = { code: 'PSS_SORTED',   label: 'Sorted'   };
</script>

<h1 style="margin:0.25rem 0 0;">{stationCode} — Station Home</h1>
<p style="margin:0.25rem 0 1rem; opacity:0.9;">{stationName}</p>

<section style="margin-top:0.5rem;">
  <h2 class="section-title">MMAs</h2>
  <div class="mmas">
    <span class="mma">{MMA1.label} <small>({MMA1.code})</small></span>
    <span class="mma">{MMA2.label} <small>({MMA2.code})</small></span>
  </div>
</section>

<section style="margin-top:1rem;">
  <h2 class="section-title">Actions</h2>

  <!-- No loops: three explicit cards -->
  <div class="actions-flex">
    <Card href="/stations/pss/receive_abs_screened" icon="📥" label="Receive (ABS → PSS_SCREENED)" />
    <Card href="/stations/pss/pss_screened"         icon="📦" label="Slots — Screened" />
    <Card href="/stations/pss/pss_sorted"           icon="📦" label="Slots — Sorted" />
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

  /* FLEX version of actions container */
  .actions-flex {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
    padding: 0 0.5rem;
  }

  /* Ensure each Card stays compact and centered */
  :global(.card) {
    flex: 0 1 120px;
    max-width: 140px;
    min-height: 90px;
    text-align: center;
  }
</style>
