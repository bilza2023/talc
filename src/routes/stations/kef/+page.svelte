<script>
  import Card from '$lib/components/Card.svelte';
  import H1 from '$lib/components/H1.svelte';
  export let data;

  const stationCode = data.stationCode ?? 'KEF';
  const stationName = data.stationName ?? 'Karachi Export Facility';

  // Hard-coded single MMA
  const MMA1 = { code: 'KEF_SORTED', label: 'Sorted' };
</script>

<H1 text="KEF" size="2rem" />


<section style="margin-top:1rem;">

  <!-- No loops: two explicit cards -->
  <div class="stack">
    <Card href="/stations/kef/receive_pss_sorted" icon="📥" label="Receive" />
    <Card href="/stations/kef/kef_sorted"         icon="📦" label="Sorted" />
  </div>
</section>

<style>
  :global(body) {
    background: var(--backgroundColor);
    color: var(--primaryText);
  }

  /* stacked layout */
  .stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;              /* space between icons */
    margin-top: 2rem;
  }

  :global(.card) {
    width: 100%;
    max-width: 140px;
    min-height: 90px;
    text-align: center;
  }
</style>
