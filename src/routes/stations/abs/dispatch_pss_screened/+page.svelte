<script>
  import Dispatch from '$lib/components/Dispatch.svelte';
  export let data;

  const lane = {
    fromMmaCode: data.fromMmaCode,   // 'ABS_SCREENED'
    toMmaCode:   data.toMmaCode,     // 'PSS_SCREENED'
    redirectTo:  '/stations/abs/abs_screened' // after success
  };
</script>

<Dispatch {lane} onHand={data.available ?? null} showAmount={false} />
