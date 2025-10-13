<script>
  import Card from '$lib/components/Card.svelte';
  export let data;

  const stationCode = data.stationCode ?? 'PSS';
  const stationName = data.stationName ?? 'Peshawar (PSS)';

  // PSS hard-coded MMAs (no loops)
  const MMA1 = { code: 'PSS_SCREENED', label: 'Screened' };
  const MMA2 = { code: 'PSS_SORTED',   label: 'Sorted'   };
</script>

<br/>
<header class="station-header">
  <h1>{stationCode}</h1>
</header>


<section style="margin-top:1rem;">

  <!-- No loops: three explicit cards -->
  <div class="actions-flex">
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

  .station-header {
    text-align: center;
    margin: 1.5rem 0;
  }

  .station-header h1 {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--primaryText);
    margin: 0;
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
