<script>
  import Card from '$lib/components/Card.svelte';
  import H1 from '$lib/components/H1.svelte';
  export let data;

  const stationCode = data.stationCode ?? 'PSS';
  const stationName = data.stationName ?? 'Peshawar (PSS)';

  // PSS hard-coded MMAs (no loops)
  const MMA1 = { code: 'PSS_SCREENED', label: 'Screened' };
  const MMA2 = { code: 'PSS_SORTED',   label: 'Sorted'   };
</script>

<br/>

<H1 text="PSS" size="2rem" />

<section style="margin-top:1rem;">

  <!-- No loops: three explicit cards -->
  <div class="stack">
    <Card href="/stations/pss/receive_abs_screened" icon="📥" label="Receive" />
    <Card href="/stations/pss/pss_screened"         icon="📦" label="Screened" />
    <Card href="/stations/pss/pss_sorted"           icon="📦" label="Sorted" />
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
