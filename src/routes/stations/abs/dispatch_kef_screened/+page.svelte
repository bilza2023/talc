<script>
  import Dispatch from '$lib/components/Dispatch.svelte';
  export let data;

  const lane = {
    fromMmaCode: data.fromMmaCode,   // 'ABS_SCREENED'
    toMmaCode:   data.toMmaCode,     // 'KEF_SCREENED'
    redirectTo:  '/stations/abs/abs_screened'
  };
</script>

<Dispatch {lane} onHand={data.onHand ?? null} showAmount={false} />
