<script>
  import '$lib/styles/tokens.css';
  import HomeNav from '$lib/components/HomeNav.svelte';
  import Card from '$lib/components/Card.svelte';
  const iconMap = { dashboards:'🚀', stations:'🏗️', admin:'⚙️' };

  export const entries = [
    // dashboards
    { title: 'Ore',            url: '/dashboard/ore',            icon: '🪨', category: 'dashboards' },
    { title: 'Talc',           url: '/dashboard/talc',           icon: '🧼', category: 'dashboards' },
    { title: 'Transportation', url: '/dashboard/transportation', icon: '🚚', category: 'dashboards' },
    { title: 'Ore Batches',    url: '/dashboard/ore_batches',    icon: '📦', category: 'dashboards' },

    // stations
    { title: 'BS1', url: '/stations/bs1', icon: '🏗️1', category: 'stations' },
    { title: 'BS2', url: '/stations/bs2', icon: '🏗️2', category: 'stations' },
    { title: 'BS3', url: '/stations/bs3', icon: '🏗️3', category: 'stations' },
    { title: 'JSS', url: '/stations/jss', icon: '🚚',  category: 'stations' },
    { title: 'PSS', url: '/stations/pss', icon: '🗺️',  category: 'stations' },
    { title: 'KEF', url: '/stations/kef', icon: '📦',  category: 'stations' },
    { title: 'ABS', url: '/stations/abs', icon: '🗺️',  category: 'stations' },

    // admin
    { title: 'Help',      url: '/help/dashboard', icon: '❓', category: 'admin' },
    { title: 'Mines',     url: '/mines',          icon: '⛏️', category: 'admin' },
    { title: 'Suppliers', url: '/suppliers',      icon: '👥', category: 'admin' },
    { title: 'Settings',  url: '/settings',       icon: '⚙️', category: 'admin' }
  ];

  const categories = Array.from(new Set(entries.map(e => e.category)));
  let selected = categories[0] || '';
  $: visible = selected ? entries.filter(e => e.category === selected) : entries;

  function handleChange(e) { selected = e.detail; }
</script>

 
  <div class="home-nav">
    <HomeNav items={categories} iconMap={iconMap} value={selected} on:change={(e)=>selected=e.detail} />
  </div>
 
 
  <div class="cards">
    {#each visible as it}
      <Card icon={it.icon} label={it.title} href={it.url} />
    {/each}
  </div>

<style>
 
  .cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: flex-start;
    gap: var(--spaceSm, 12px) var(--spaceMd, 16px);
    padding: var(--spaceMd, 16px);
    padding: 5%;
    margin: 0 5%;

    border: 1px solid var(--borderColor, #2b3a36);
    border-radius: var(--radiusXl, 16px);

    background: color-mix(in srgb, var(--surfaceColor, #0f1a16) 10%, transparent);

    box-shadow: var(--shadowLg, 0 6px 20px rgba(0,0,0,.25));
    backdrop-filter: blur(var(--blurSm, 6px)) saturate(115%);
    -webkit-backdrop-filter: blur(var(--blurSm, 6px)) saturate(115%);
  }
  .home-nav {
  display: flex;
  gap: var(--spaceSm, 12px);
  padding: var(--spaceSm, 12px);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;

  justify-content: center;   /* <-- add */
  margin-inline: auto;       /* <-- add */
}

</style>
