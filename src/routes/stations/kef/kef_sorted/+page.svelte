<script>
  import Slots from '$lib/components/Slots.svelte';
  export let data; // { mmaCode:'KEF_SORTED', slots:[...] }

  const rows = data?.slots ?? [];

  // Actions for KEF_SORTED
  const actions = [
    {
      label: 'Receive ➜ KEF (Sorted)',
      icon: '📦',
      href: (r) =>
        `/stations/kef/receive_sorted?supplierId=${r.supplierId}&shade=${r.shade}&size=${r.size}&qty=${r.qty}`
    }
  ];
</script>

<Slots
  title="KEF — Sorted Slots"
  rows={rows}
  actions={actions}
/>
