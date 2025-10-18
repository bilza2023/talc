<script>
  // Minimal page: no global CSS imports; tokens/forms already loaded app-wide.
  import ReceiveTopLoop from '$lib/components/ReceiveTopLoop.svelte';

  export let data;
  const lanes = data?.lanes ?? [];
  const rows  = data?.rows  ?? [];
</script>

<section class="page">
  <ReceiveTopLoop {lanes} {rows} />
</section>

<style>
  .page {
    max-width: 1100px;
    margin-inline: auto;
    padding: var(--spaceMd, 16px);
    display: grid;
    gap: var(--spaceMd, 16px);
  }
</style>
