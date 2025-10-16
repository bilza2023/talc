<script>
  import '$lib/styles/tokens.css';
  import HomeNav from '$lib/components/HomeNav.svelte';
  import Card from '$lib/components/Card.svelte';
  
  
  const entries = [
  
  { category: 'stations', title: 'ABS', url: '/stations/abs', icon: '🗺️' },
  { category: 'stations', title: 'PSS', url: '/stations/pss', icon: '🗺️' },
  { category: 'stations', title: 'KEF', url: '/stations/kef', icon: '📦' },

  { category: 'reports', title: 'Suppliers Ledger', url: '/reports/supplier_ledger', icon: '🪨' },
  { category: 'reports', title: 'Logistics', url: '/reports/logistics/overview', icon: '🧼' },
  { category: 'reports', title: 'Reconciliation', url: '/reports/reconciliation', icon: '⛏️' },
  { category: 'reports', title: 'In Transit', url: '/reports/in-transit', icon: '🚎' },
  { category: 'reports', title: 'Procurement', url: '/reports/procurement', icon: '🎯' },

  // { category: 'dashboard', title: 'Settings', url: '/dashboard/ore_batches', icon: '📦' },

  { category: 'admin', title: 'Purchase', url: '/procurement', icon: '🚚' },
  { category: 'admin', title: 'Help', url: '/help/dashboard', icon: '❓' },
  { category: 'admin', title: 'Suppliers', url: '/suppliers', icon: '👥' },
];


  const categories = [...new Set(entries.map(e => e.category))];
  let selected = categories[0] ?? '';
  const iconMap = { stations:'🏗️', reports:'🚀', dashboard:'🖥️', admin:'⚙️' };

  $: visible = selected ? entries.filter(e => e.category === selected) : entries;
</script>

<!-- rename wrapper to avoid CSS collision -->
<div class="home-nav-wrap">
  <HomeNav
    items={categories}
    iconMap={iconMap}
    value={selected}
    on:change={(e) => (selected = e.detail)}
  />
</div>

<div class="cards">
  {#each visible as it}
    <Card icon={it.icon} label={it.title} href={it.url} />
  {/each}
</div>

<style>
  /* Center the component wrapper */
  .home-nav-wrap {
    display: flex;
    justify-content: center;
    padding: var(--spaceSm, 12px);
    margin-inline: auto;
    width: 100%;
    overflow-x: auto;               /* keeps single-row scroll if needed */
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  /* OVERRIDE inside the component: center the inner nav contents */
  :global(nav.home-nav) {
    justify-content: center;        /* key fix: center tabs */
  }

  .cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: flex-start;
    gap: var(--spaceSm, 12px) var(--spaceMd, 16px);
    padding: 5%;
    margin: 0 5%;
    border: 1px solid var(--borderColor, #2b3a36);
    border-radius: var(--radiusXl, 16px);
    background: color-mix(in srgb, var(--surfaceColor, #0f1a16) 10%, transparent);
    box-shadow: var(--shadowLg, 0 6px 20px rgba(0,0,0,.25));
    backdrop-filter: blur(var(--blurSm, 6px)) saturate(115%);
    -webkit-backdrop-filter: blur(var(--blurSm, 6px)) saturate(115%);
  }
</style>
