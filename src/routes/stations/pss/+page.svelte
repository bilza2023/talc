<script>
  import MmaRecBtn from '$lib/components/MmaRecBtn.svelte';
  export let data;

  const { stationCode, mmas, inboundCounts } = data;

  // Explicit, readable mapping per MMA → receive page
  const recLinks = {
    PSS_PROCESSED: '/stations/pss/receive_abs_screened',   // ABS → PSS_PROCESSED
    PSS_SORTED:    '/stations/pss/receive_pss_screened',  // PSS_PROCESSED → PSS_SORTED (create this page when ready)
  };
</script>

<h1>{stationCode} — Station</h1>

<section class="panel">
  <h2>Incoming Traffic</h2>
  <div class="rec-grid">
    {#each mmas as m}
      <MmaRecBtn
        label={m.label}
        inboundCount={inboundCounts?.[m.mmaCode] ?? 0}
        href={recLinks[m.mmaCode] || '#'}
      />
    {/each}
  </div>
</section>

<style>
  .panel {
    border: 1px solid var(--border, #333);
    border-radius: 0.75rem;
    padding: 0.9rem;
    margin-top: 0.5rem;
    background: var(--panel, rgba(255,255,255,0.02));
  }
  .rec-grid { display:flex; flex-wrap:wrap; gap:.75rem; }
</style>
