<script>
  import '$lib/styles/tokens.css';
  import Dispatch from '$lib/components/Dispatch.svelte';

  export let data;

  // Hardcoded lane (no dependency on +page.server.js for names)
  const FROM_MMA = 'ABS_SCREENED';
  const TO_MMA   = 'PSS_SCREENED';

  // Take whatever the server gave (onHand, supplierId, etc.) but force lane fields
  const form = {
    ...(data?.form ?? {}),
    fromMmaCode: FROM_MMA,
    toMmaCode: TO_MMA,
    fromMma: FROM_MMA,
    toMma: TO_MMA
  };

  // Component expects an object with { from, to }
  const lane = { from: FROM_MMA, to: TO_MMA };
</script>

<!-- Spread everything so the component finds what it needs; lane is explicit -->
<Dispatch
  {...form}
  lane={lane}
  stationCode={data?.stationCode}
  stationName={data?.stationName}
  fromUrl={data?.fromUrl}
/>
