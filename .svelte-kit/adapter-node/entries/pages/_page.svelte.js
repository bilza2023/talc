import { c as create_ssr_component, f as createEventDispatcher, e as each, a as add_attribute, b as escape, v as validate_component } from "../../chunks/ssr.js";
/* empty css                  */
import { C as Card } from "../../chunks/Card.js";
const css$1 = {
  code: ".label.svelte-svo5ib{font-size:0.75rem}nav.home-nav{display:flex;flex-wrap:nowrap;align-items:center;justify-content:flex-start;gap:var(--home-nav-gap, 0.5rem);width:100%;max-width:100vw;box-sizing:border-box;padding-inline:var(--spaceSm, 12px);overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;scroll-snap-type:x proximity}nav.home-nav::-webkit-scrollbar{display:none}nav.home-nav .tab{flex:0 0 auto;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:0.35rem;width:var(--navTabW, 84px);padding:0.5rem;min-height:64px;font-size:0.92rem;text-align:center;scroll-snap-align:center;color:var(--primaryText);background:transparent;border:1px solid var(--borderColor);border-radius:9999px}nav.home-nav .tab.is-active{background:color-mix(in srgb, var(--primaryColor) 12%, var(--surfaceColor) 88%);border-color:var(--primaryColor);color:var(--primaryText)}nav.home-nav .tab .icon{width:var(--navIconSize, 1.6rem);height:var(--navIconSize, 1.6rem);font-size:0.95rem;line-height:1;border-radius:9999px;display:inline-grid;place-items:center;background:color-mix(in srgb, var(--surfaceColor) 85%, var(--backgroundColor) 15%);border:1px solid var(--borderColor)}nav.home-nav .tab.is-active .icon{background:color-mix(in srgb, var(--primaryColor) 15%, var(--surfaceColor) 85%);border-color:var(--primaryColor)}@media(min-width: 640px){nav.home-nav{justify-content:center;padding-inline:var(--spaceMd, 16px)}nav.home-nav .tab{min-height:70px}}",
  map: `{"version":3,"file":"HomeNav.svelte","sources":["HomeNav.svelte"],"sourcesContent":["<script>\\n  import { createEventDispatcher } from 'svelte';\\n\\n  // Accept either: ['stations','dashboards',...] or\\n  // [{ name:'stations', label:'Stations', icon:'🏗️' }, ...]\\n  export let items = [];\\n  export let value = '';             // current selected tab name\\n  export let iconMap = {};           // optional: { stations:'🏗️', ... }\\n\\n  const dispatch = createEventDispatcher();\\n\\n  $: list = (items ?? []).map((x) => {\\n    const name  = typeof x === 'string' ? x : (x?.name ?? '');\\n    const label = typeof x === 'string' ? x : (x?.label ?? name);\\n    const icon  = typeof x === 'string'\\n      ? (iconMap?.[name] ?? '')\\n      : (x?.icon ?? iconMap?.[name] ?? '');\\n    return { name, label, icon };\\n  });\\n\\n  function select(name) {\\n    if (value !== name) {\\n      value = name;                 // enables bind:value if used\\n      dispatch('change', name);     // e.detail is a STRING (the name)\\n    }\\n  }\\n<\/script>\\n<nav class=\\"home-nav\\" role=\\"tablist\\" aria-label=\\"Categories\\">\\n  {#each list as it (it.name)}\\n    <button\\n      type=\\"button\\"\\n      class=\\"tab {value === it.name ? 'is-active' : ''}\\"\\n      role=\\"tab\\"\\n      aria-selected={value === it.name}\\n      on:click={() => select(it.name)}\\n      style=\\"display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:.35rem;text-align:center;\\"\\n    >\\n      {#if it.icon}\\n        <span class=\\"icon\\" style=\\"margin:0\\">{it.icon}</span>\\n      {/if}\\n      <span class=\\"label\\">{it.label}</span>\\n    </button>\\n  {/each}\\n</nav>\\n\\n<style>\\n  .label {\\n    font-size: 0.75rem;\\n  }\\n  /* Wrapper: unchanged except tokens only */\\n  .home-nav-wrap {\\n    display: flex;\\n    justify-content: center;\\n    width: 100%;\\n    padding: var(--spaceXs, 8px) var(--spaceSm, 12px);\\n    margin-inline: auto;\\n    overflow: hidden;\\n  }\\n\\n  /* Inner nav */\\n  :global(nav.home-nav) {\\n    display: flex;\\n    flex-wrap: nowrap;\\n    align-items: center;\\n    justify-content: flex-start;   /* center on >=640px below */\\n    gap: var(--home-nav-gap, 0.5rem);\\n    width: 100%;\\n    max-width: 100vw;\\n    box-sizing: border-box;\\n    padding-inline: var(--spaceSm, 12px);\\n\\n    overflow-x: auto;\\n    -webkit-overflow-scrolling: touch;\\n    scrollbar-width: none;\\n    scroll-snap-type: x proximity;\\n  }\\n  :global(nav.home-nav::-webkit-scrollbar){ display:none; }\\n\\n  /* Tabs: stacked (icon over text), tokens only */\\n  :global(nav.home-nav .tab) {\\n    flex: 0 0 auto;\\n    display: inline-flex;\\n    flex-direction: column;         /* icon on top, text under */\\n    align-items: center;\\n    justify-content: center;\\n    gap: 0.35rem;\\n    width: var(--navTabW, 84px);\\n    padding: 0.5rem;\\n    min-height: 64px;\\n    font-size: 0.92rem;\\n    text-align: center;\\n    scroll-snap-align: center;\\n\\n    color: var(--primaryText);\\n    background: transparent;\\n    border: 1px solid var(--borderColor);\\n    border-radius: 9999px;\\n  }\\n\\n  /* Selected: calm, token-mixed background */\\n  :global(nav.home-nav .tab.is-active) {\\n    background: color-mix(in srgb, var(--primaryColor) 12%, var(--surfaceColor) 88%);\\n    border-color: var(--primaryColor);\\n    color: var(--primaryText);\\n  }\\n\\n  /* Icon badge (round) – tokens only */\\n  :global(nav.home-nav .tab .icon) {\\n    width: var(--navIconSize, 1.6rem);\\n    height: var(--navIconSize, 1.6rem);\\n    font-size: 0.95rem;\\n    line-height: 1;\\n    border-radius: 9999px;\\n    display: inline-grid;\\n    place-items: center;\\n\\n    background: color-mix(in srgb, var(--surfaceColor) 85%, var(--backgroundColor) 15%);\\n    border: 1px solid var(--borderColor);\\n  }\\n  :global(nav.home-nav .tab.is-active .icon) {\\n    background: color-mix(in srgb, var(--primaryColor) 15%, var(--surfaceColor) 85%);\\n    border-color: var(--primaryColor);\\n  }\\n\\n  /* Center strip on tablet/desktop */\\n  @media (min-width: 640px) {\\n    :global(nav.home-nav) {\\n      justify-content: center;\\n      padding-inline: var(--spaceMd, 16px);\\n    }\\n    :global(nav.home-nav .tab) {\\n      min-height: 70px;\\n    }\\n  }\\n</style>\\n"],"names":[],"mappings":"AA8CE,oBAAO,CACL,SAAS,CAAE,OACb,CAYQ,YAAc,CACpB,OAAO,CAAE,IAAI,CACb,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,UAAU,CAC3B,GAAG,CAAE,IAAI,cAAc,CAAC,OAAO,CAAC,CAChC,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,UAAU,CACtB,cAAc,CAAE,IAAI,SAAS,CAAC,KAAK,CAAC,CAEpC,UAAU,CAAE,IAAI,CAChB,0BAA0B,CAAE,KAAK,CACjC,eAAe,CAAE,IAAI,CACrB,gBAAgB,CAAE,CAAC,CAAC,SACtB,CACQ,+BAAgC,CAAE,QAAQ,IAAM,CAGhD,iBAAmB,CACzB,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CACd,OAAO,CAAE,WAAW,CACpB,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CACvB,GAAG,CAAE,OAAO,CACZ,KAAK,CAAE,IAAI,SAAS,CAAC,KAAK,CAAC,CAC3B,OAAO,CAAE,MAAM,CACf,UAAU,CAAE,IAAI,CAChB,SAAS,CAAE,OAAO,CAClB,UAAU,CAAE,MAAM,CAClB,iBAAiB,CAAE,MAAM,CAEzB,KAAK,CAAE,IAAI,aAAa,CAAC,CACzB,UAAU,CAAE,WAAW,CACvB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,aAAa,CAAC,CACpC,aAAa,CAAE,MACjB,CAGQ,2BAA6B,CACnC,UAAU,CAAE,UAAU,EAAE,CAAC,IAAI,CAAC,CAAC,IAAI,cAAc,CAAC,CAAC,GAAG,CAAC,CAAC,IAAI,cAAc,CAAC,CAAC,GAAG,CAAC,CAChF,YAAY,CAAE,IAAI,cAAc,CAAC,CACjC,KAAK,CAAE,IAAI,aAAa,CAC1B,CAGQ,uBAAyB,CAC/B,KAAK,CAAE,IAAI,aAAa,CAAC,OAAO,CAAC,CACjC,MAAM,CAAE,IAAI,aAAa,CAAC,OAAO,CAAC,CAClC,SAAS,CAAE,OAAO,CAClB,WAAW,CAAE,CAAC,CACd,aAAa,CAAE,MAAM,CACrB,OAAO,CAAE,WAAW,CACpB,WAAW,CAAE,MAAM,CAEnB,UAAU,CAAE,UAAU,EAAE,CAAC,IAAI,CAAC,CAAC,IAAI,cAAc,CAAC,CAAC,GAAG,CAAC,CAAC,IAAI,iBAAiB,CAAC,CAAC,GAAG,CAAC,CACnF,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,aAAa,CACrC,CACQ,iCAAmC,CACzC,UAAU,CAAE,UAAU,EAAE,CAAC,IAAI,CAAC,CAAC,IAAI,cAAc,CAAC,CAAC,GAAG,CAAC,CAAC,IAAI,cAAc,CAAC,CAAC,GAAG,CAAC,CAChF,YAAY,CAAE,IAAI,cAAc,CAClC,CAGA,MAAO,YAAY,KAAK,CAAE,CAChB,YAAc,CACpB,eAAe,CAAE,MAAM,CACvB,cAAc,CAAE,IAAI,SAAS,CAAC,KAAK,CACrC,CACQ,iBAAmB,CACzB,UAAU,CAAE,IACd,CACF"}`
};
const HomeNav = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let list;
  let { items = [] } = $$props;
  let { value = "" } = $$props;
  let { iconMap = {} } = $$props;
  createEventDispatcher();
  if ($$props.items === void 0 && $$bindings.items && items !== void 0) $$bindings.items(items);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
  if ($$props.iconMap === void 0 && $$bindings.iconMap && iconMap !== void 0) $$bindings.iconMap(iconMap);
  $$result.css.add(css$1);
  list = (items ?? []).map((x) => {
    const name = typeof x === "string" ? x : x?.name ?? "";
    const label = typeof x === "string" ? x : x?.label ?? name;
    const icon = typeof x === "string" ? iconMap?.[name] ?? "" : x?.icon ?? iconMap?.[name] ?? "";
    return { name, label, icon };
  });
  return `<nav class="home-nav" role="tablist" aria-label="Categories">${each(list, (it) => {
    return `<button type="button" class="${"tab " + escape(value === it.name ? "is-active" : "", true)}" role="tab"${add_attribute("aria-selected", value === it.name, 0)} style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:.35rem;text-align:center;">${it.icon ? `<span class="icon" style="margin:0">${escape(it.icon)}</span>` : ``} <span class="label svelte-svo5ib">${escape(it.label)}</span> </button>`;
  })} </nav>`;
});
const css = {
  code: ".home-nav-wrap.svelte-1i1hofo{display:flex;justify-content:center;padding:var(--spaceSm, 12px);margin-inline:auto;width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:thin}nav.home-nav{justify-content:center}.cards.svelte-1i1hofo{display:flex;flex-wrap:wrap;justify-content:center;align-content:flex-start;gap:var(--spaceSm, 12px) var(--spaceMd, 16px);padding:5%;margin:0 5%;border:1px solid var(--borderColor, #2b3a36);border-radius:var(--radiusXl, 16px);background:color-mix(in srgb, var(--surfaceColor, #0f1a16) 10%, transparent);box-shadow:var(--shadowLg, 0 6px 20px rgba(0,0,0,.25));backdrop-filter:blur(var(--blurSm, 6px)) saturate(115%);-webkit-backdrop-filter:blur(var(--blurSm, 6px)) saturate(115%)}",
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\n  import { onMount } from 'svelte';\\n  import '$lib/styles/tokens.css';\\n  import HomeNav from '$lib/components/HomeNav.svelte';\\n  import Card from '$lib/components/Card.svelte';\\n\\n  const entries = [\\n    { category: 'stations', title: 'ABS', url: '/stations/abs', icon: '🗺️' },\\n    { category: 'stations', title: 'PSS', url: '/stations/pss', icon: '🚠' },\\n    { category: 'stations', title: 'KEF', url: '/stations/kef', icon: '📦' },\\n\\n    { category: 'reports', title: 'Stock', url: '/reports/stock', icon: '🧼' },\\n    { category: 'reports', title: 'Supplier Ledger', url: '/reports/supplier_ledger', icon: '🪨' },\\n    { category: 'reports', title: 'Slots', url: '/reports/slot', icon: '🍿' },\\n    { category: 'reports', title: 'Reconciliation', url: '/reports/reconciliation', icon: '⛏️' },\\n    { category: 'reports', title: 'In Transit', url: '/reports/in-transit', icon: '🚎' },\\n    { category: 'reports', title: 'Screening', url: '/reports/screening', icon: '🪜' },\\n    { category: 'reports', title: 'Sorting', url: '/reports/sorting', icon: '💊' },\\n    // { category: 'reports', title: 'Procurement', url: '/reports/procurement', icon: '🎯' },\\n\\n    { category: 'admin', title: 'Purchase', url: '/procurement', icon: '🚚' },\\n    { category: 'admin', title: 'Suppliers', url: '/suppliers', icon: '👥' },\\n    { category: 'admin', title: 'Help', url: '/help', icon: '❓' },\\n\\n  ];\\n\\n  const categories = [...new Set(entries.map(e => e.category))];\\n  const iconMap = { stations:'🏗️', reports:'🚀', dashboard:'🖥️', admin:'⚙️' };\\n\\n  // PERSISTED TAB\\n  let activeTab = 'stations'; // default\\n\\n  onMount(() => {\\n    const saved = localStorage.getItem('homeTab');\\n    const fallback = categories.includes('stations') ? 'stations' : (categories[0] ?? '');\\n    activeTab = categories.includes(saved) ? saved : fallback;\\n  });\\n\\n  function selectTab(tab) {\\n    activeTab = tab;\\n    localStorage.setItem('homeTab', tab);\\n  }\\n\\n  $: visible = activeTab ? entries.filter(e => e.category === activeTab) : entries;\\n<\/script>\\n\\n<!-- rename wrapper to avoid CSS collision -->\\n<div class=\\"home-nav-wrap\\">\\n  <HomeNav\\n  items={categories}\\n  iconMap={iconMap}\\n  value={activeTab}\\n  on:change={(e) => selectTab(e.detail)}\\n/>\\n\\n</div>\\n\\n<div class=\\"cards\\">\\n  {#each visible as it}\\n    <Card icon={it.icon} label={it.title} href={it.url} />\\n  {/each}\\n</div>\\n\\n<style>\\n  /* Center the component wrapper */\\n  .home-nav-wrap {\\n    display: flex;\\n    justify-content: center;\\n    padding: var(--spaceSm, 12px);\\n    margin-inline: auto;\\n    width: 100%;\\n    overflow-x: auto;               /* keeps single-row scroll if needed */\\n    -webkit-overflow-scrolling: touch;\\n    scrollbar-width: thin;\\n  }\\n\\n  /* OVERRIDE inside the component: center the inner nav contents */\\n  :global(nav.home-nav) {\\n    justify-content: center;        /* key fix: center tabs */\\n  }\\n\\n  .cards {\\n    display: flex;\\n    flex-wrap: wrap;\\n    justify-content: center;\\n    align-content: flex-start;\\n    gap: var(--spaceSm, 12px) var(--spaceMd, 16px);\\n    padding: 5%;\\n    margin: 0 5%;\\n    border: 1px solid var(--borderColor, #2b3a36);\\n    border-radius: var(--radiusXl, 16px);\\n    background: color-mix(in srgb, var(--surfaceColor, #0f1a16) 10%, transparent);\\n    box-shadow: var(--shadowLg, 0 6px 20px rgba(0,0,0,.25));\\n    backdrop-filter: blur(var(--blurSm, 6px)) saturate(115%);\\n    -webkit-backdrop-filter: blur(var(--blurSm, 6px)) saturate(115%);\\n  }\\n</style>\\n"],"names":[],"mappings":"AAiEE,6BAAe,CACb,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,OAAO,CAAE,IAAI,SAAS,CAAC,KAAK,CAAC,CAC7B,aAAa,CAAE,IAAI,CACnB,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,IAAI,CAChB,0BAA0B,CAAE,KAAK,CACjC,eAAe,CAAE,IACnB,CAGQ,YAAc,CACpB,eAAe,CAAE,MACnB,CAEA,qBAAO,CACL,OAAO,CAAE,IAAI,CACb,SAAS,CAAE,IAAI,CACf,eAAe,CAAE,MAAM,CACvB,aAAa,CAAE,UAAU,CACzB,GAAG,CAAE,IAAI,SAAS,CAAC,KAAK,CAAC,CAAC,IAAI,SAAS,CAAC,KAAK,CAAC,CAC9C,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,CAAC,CAAC,EAAE,CACZ,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,aAAa,CAAC,QAAQ,CAAC,CAC7C,aAAa,CAAE,IAAI,UAAU,CAAC,KAAK,CAAC,CACpC,UAAU,CAAE,UAAU,EAAE,CAAC,IAAI,CAAC,CAAC,IAAI,cAAc,CAAC,QAAQ,CAAC,CAAC,GAAG,CAAC,CAAC,WAAW,CAAC,CAC7E,UAAU,CAAE,IAAI,UAAU,CAAC,2BAA2B,CAAC,CACvD,eAAe,CAAE,KAAK,IAAI,QAAQ,CAAC,IAAI,CAAC,CAAC,CAAC,SAAS,IAAI,CAAC,CACxD,uBAAuB,CAAE,KAAK,IAAI,QAAQ,CAAC,IAAI,CAAC,CAAC,CAAC,SAAS,IAAI,CACjE"}`
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let visible;
  const entries = [
    {
      category: "stations",
      title: "ABS",
      url: "/stations/abs",
      icon: "🗺️"
    },
    {
      category: "stations",
      title: "PSS",
      url: "/stations/pss",
      icon: "🚠"
    },
    {
      category: "stations",
      title: "KEF",
      url: "/stations/kef",
      icon: "📦"
    },
    {
      category: "reports",
      title: "Stock",
      url: "/reports/stock",
      icon: "🧼"
    },
    {
      category: "reports",
      title: "Supplier Ledger",
      url: "/reports/supplier_ledger",
      icon: "🪨"
    },
    {
      category: "reports",
      title: "Slots",
      url: "/reports/slot",
      icon: "🍿"
    },
    {
      category: "reports",
      title: "Reconciliation",
      url: "/reports/reconciliation",
      icon: "⛏️"
    },
    {
      category: "reports",
      title: "In Transit",
      url: "/reports/in-transit",
      icon: "🚎"
    },
    {
      category: "reports",
      title: "Screening",
      url: "/reports/screening",
      icon: "🪜"
    },
    {
      category: "reports",
      title: "Sorting",
      url: "/reports/sorting",
      icon: "💊"
    },
    // { category: 'reports', title: 'Procurement', url: '/reports/procurement', icon: '🎯' },
    {
      category: "admin",
      title: "Purchase",
      url: "/procurement",
      icon: "🚚"
    },
    {
      category: "admin",
      title: "Suppliers",
      url: "/suppliers",
      icon: "👥"
    },
    {
      category: "admin",
      title: "Help",
      url: "/help",
      icon: "❓"
    }
  ];
  const categories = [...new Set(entries.map((e) => e.category))];
  const iconMap = {
    stations: "🏗️",
    reports: "🚀",
    dashboard: "🖥️",
    admin: "⚙️"
  };
  let activeTab = "stations";
  $$result.css.add(css);
  visible = entries.filter((e) => e.category === activeTab);
  return ` <div class="home-nav-wrap svelte-1i1hofo">${validate_component(HomeNav, "HomeNav").$$render(
    $$result,
    {
      items: categories,
      iconMap,
      value: activeTab
    },
    {},
    {}
  )}</div> <div class="cards svelte-1i1hofo">${each(visible, (it) => {
    return `${validate_component(Card, "Card").$$render(
      $$result,
      {
        icon: it.icon,
        label: it.title,
        href: it.url
      },
      {},
      {}
    )}`;
  })} </div>`;
});
export {
  Page as default
};
