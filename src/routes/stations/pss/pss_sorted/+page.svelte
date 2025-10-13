<script>
  import Slots from '$lib/components/Slots.svelte';
  export let data; // { mmaCode:'PSS_SORTED', slots:[...] }

  const rows = data?.slots ?? [];

  // Row actions for PSS_SORTED
  const actions = [
    {
      label: 'Dispatch ➜ KEF (Sorted)',
      icon: '🚚',
      href: (r) =>
        `/stations/pss/dispatch_kef_sorted?supplierId=${r.supplierId}&shade=${r.shade}&size=${r.size}&qty=${r.qty}`
    }
  ];
</script>

<Slots
  title="PSS — Sorted Slots"
  rows={rows}
  actions={actions}
/>
