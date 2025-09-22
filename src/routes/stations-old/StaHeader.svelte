<!-- src/lib/components/StaHeader.svelte -->
<script>
  export let stationCode = "";
  export let description = "";
</script>

<header class="sta-header">
  <h1 class="title">{stationCode}</h1>
  {#if description}<p class="subtitle">{description}</p>{/if}
</header>

<style>
  .sta-header {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--borderColor);
    background-color: var(--surfaceColor);
  }

  .title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--primaryText);
  }

  .subtitle {
    margin: 0.25rem 0 0;
    font-size: 0.9rem;
    color: var(--secondaryText);
  }
</style>
