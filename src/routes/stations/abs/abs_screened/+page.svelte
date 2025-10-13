<script>
  import Slots from '$lib/components/Slots.svelte';
  export let data; // { mmaCode:'ABS_SCREENED', slots:[...] }

  const rows = data?.slots ?? [];

  // Actions for ABS_SCREENED
  const actions = [
    {
      label: 'Dispatch ➜ PSS (Screened)',
      icon: '🚚',
      href: (r) =>
        `/stations/abs/dispatch_pss_screened?supplierId=${r.supplierId}&shade=${r.shade}&size=${r.size}&qty=${r.qty}`
    }
  ];
</script>

<Slots
  title="ABS — Screened Slots"
  rows={rows}
  actions={actions}
/>
