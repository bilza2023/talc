<script>
  import Slots from '$lib/components/Slots.svelte';
  export let data; // { mmaCode:'ABS_RAW', slots:[...] }

  const rows = data?.slots ?? [];

  // Actions for ABS_RAW
  const actions = [
    {
      label: 'Process ➜ Screened',
      icon: '🛠️',
      href: (r) =>
        `/stations/abs/screening?supplierId=${r.supplierId}&shade=${r.shade}&qty=${r.qty}`
    }
  ];
</script>

<Slots
  title="ABS — Raw Slots"
  rows={rows}
  actions={actions}
/>
