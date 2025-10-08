<script>
  import ImgCard from '$lib/components/ImgCard.svelte';

  export let data = {};

  const stationCode = data.stationCode ?? 'ABS';
  const stationName = data.stationName ?? 'Abbottabad';
</script>

<br/>
<header class="station-header">
  <h1>{stationCode}</h1>
</header>

<br/>
<!-- stacked icons -->
<div class="stack">
  <ImgCard icon="▦" label="Screened" href="/stations/abs/abs_screened" />
  <ImgCard icon="⛰️" label="Unscreened" href="/stations/abs/abs_unscreened_raw" />
</div>

<style>
  :global(body) {
    background: var(--backgroundColor);
    color: var(--primaryText);
    margin: 0;
  }

  .station-header {
    text-align: center;
    margin: 1.5rem 0;
  }

  .station-header h1 {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--primaryAccent, var(--primaryText));
    margin: 0;
  }

  /* stacked layout */
  .stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;              /* space between icons */
    margin-top: 2rem;
  }

  /* make the cards bigger */
  :global(.card) {
    width: clamp(160px, 60vw, 220px);
    aspect-ratio: 1 / 1;
    font-size: 1.2rem;
  }

  /* enlarge emoji/icon inside the card */
  :global(.card .icon) {
    font-size: clamp(3rem, 12vw, 4rem);
  }

  @media (min-width: 640px) {
    .stack {
      gap: 3rem;
      margin-top: 3rem;
    }
    :global(.card) {
      width: 240px;
    }
  }
</style>
