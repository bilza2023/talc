<script>
  import Receive from '$lib/components/Receive.svelte';
  export let data;

  const rows = data?.rows ?? [];
  const lane =
    data?.lane ??
    { from: '', to: '' };

  const stationCode = data?.stationCode;
  const stationName = data?.stationName;
</script>

<Receive
  rows={rows}
  lane={lane}
  stationCode={stationCode}
  stationName={stationName}
/>
