<!-- /src/routes/stations/abs/+page.svelte -->
<script>
  import Card from '$lib/components/Card.svelte';
  export let data = {};

  const stationCode = data.stationCode ?? 'ABS';
  const stationName = data.stationName ?? 'Abbottabad';
</script>

<header class="station-header">
  <h1>{stationCode}</h1>
  <p class="subtitle">{stationName}</p>
</header>

<!-- Row 1: Raw / Unscreened -->
<section class="row">
  <h2 class="row-title">Raw/Unscreened</h2>
  <div class="actions-row">
    <div class="item">
      <Card icon="🧾" label="Purchase (Unscreened)" href="/stations/abs/purchase_unscreened" />
    </div>
    <div class="item">
      <Card icon="📦" label="Slots Unscreened" href="/stations/abs/abs_unscreened_raw" />
    </div>
  </div>
</section>

<!-- Row 2: Screened -->
<section class="row">
  <h2 class="row-title">Screened</h2>
  <div class="actions-row">
    <div class="item">
      <Card icon="🧾" label="Purchase (Screened)" href="/stations/abs/purchase_screened" />
    </div>
    <div class="item">
      <Card icon="📦" label="Slots Screened" href="/stations/abs/abs_screened" />
    </div>
  </div>
</section>

<style>
  :global(body) {
    background: var(--backgroundColor);
    color: var(--primaryText);
  }

  .row {
    padding: 0 12px;     /* comfy side padding on mobile */
    margin-top: 1rem;
  }

  .row-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    opacity: 0.95;
  }

  /* Mobile-first: center the two fixed buttons per row */
  .actions-row {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  /* Flexible, tappable size without getting huge */
  .item {
    flex: 0 1 140px;
    min-width: 120px;
    display: flex;
  }

  /* Ensure Card fills its wrapper width */
  .item :global(a),
  .item :global(button),
  .item :global(.card) {
    width: 100%;
  }

  .station-header {
    text-align: center;
    margin-top: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .station-header h1 {
    font-size: 1.35rem;
    font-weight: 700;
    margin: 0;
    color: var(--primaryAccent, var(--primaryText));
    letter-spacing: 0.5px;
  }

  .station-header .subtitle {
    margin-top: 0.25rem;
    font-size: 0.95rem;
    font-weight: 400;
    opacity: 0.8;
  }

  @media (min-width: 640px) {
    .station-header h1 { font-size: 1.6rem; }
    .station-header .subtitle { font-size: 1.05rem; }
  }
</style>
