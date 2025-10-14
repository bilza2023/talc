<script>
  import Slots from '$lib/components/Slots.svelte';
  export let data; // { mmaCode:'PSS_SCREENED', slots:[...] }

  const rows = data?.slots ?? [];

  const actions = [
    {
      label: 'Sort ➜ SORTED',
      icon: '🧪',
      href: (r) => `/stations/pss/sort?supplierId=${r.supplierId}&shade=${r.shade}&size=${r.size}&qty=${r.qty}`
    }
  ];
</script>

<Slots
  title="PSS — Screened Slots"
  rows={rows}
  actions={actions}
/>
