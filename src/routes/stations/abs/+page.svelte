<!-- /src/routes/stations/abs/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import '$lib/styles/tokens.css';
  import Card from '$lib/components/Card.svelte'; // adjust if you keep Card elsewhere

  export let data;

  const items = [
    {
      label: 'Purchase — Unscreened',
      href: '/stations/abs/purchase_unscreened',
      icon: '🧾'
    },
    {
      label: 'Purchase — Screened',
      href: '/stations/abs/purchase_screened',
      icon: '🧪'
    },
    {
      label: 'ABS Unscreened (RAW) Slots',
      href: '/stations/abs/abs_unscreened_raw',
      icon: '📦'
    },
    {
      label: 'ABS Screened Slots',
      href: '/stations/abs/abs_screened',
      icon: '🧰'
    }
  ];

  onMount(() => {
    console.log('[ABS] station page data →', data);
  });
</script>

<section class="page">
  <header class="hdr">
    <h1>ABS Station</h1>
    <p class="sub">Quick actions & views</p>
  </header>

  <div class="cards-grid">
    {#each items as it}
      <Card icon={it.icon} label={it.label} href={it.href} />
    {/each}
  </div>
</section>

<style>
  .page {
    max-width: 1100px;
    margin-inline: auto;
    padding: var(--spaceLg, 24px) var(--spaceMd, 16px);
  }
  .hdr {
    text-align: center;
    margin-bottom: var(--spaceLg, 24px);
  }
  h1 {
    font-size: clamp(1.25rem, 3vw, 1.6rem);
    margin: 0 0 var(--spaceXs, 6px) 0;
  }
  .sub {
    margin: 0;
    opacity: .75;
    font-size: .95rem;
  }

  /* Match the card layout style from your uploaded +page.svelte */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: var(--spaceMd, 16px);
    align-items: stretch;
  }
</style>
