<script>
  export let data;
  const { stationCode, stationName, cards = [] } = data;
</script>

<h1>{stationName} — Station</h1>

<section aria-label="Quick Actions" class="cards">
  {#each cards as c}
    <a class="card" href={c.href}>
      <span class="icon" aria-hidden="true">{c.icon}</span>
      <span class="label">{c.label}</span>
    </a>
  {/each}
</section>

<style>
  /* light, non-invasive styling (same spirit as ABS home) */
  h1 {
    margin: 0 0 1rem;
    font-size: 1.5rem;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: .75rem;
  }
  .card {
    display: grid;
    grid-template-columns: 2.5rem 1fr;
    align-items: center;
    padding: .75rem .9rem;
    border: 1px solid var(--border, #333);
    border-radius: .5rem;
    text-decoration: none;
  }
  .card:hover { outline: 1px solid currentColor; }
  .icon { font-size: 1.4rem; line-height: 1; }
  .label { font-weight: 600; }
</style>
