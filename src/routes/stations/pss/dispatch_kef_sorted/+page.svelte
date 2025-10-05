<script>
  import Dispatch from '$lib/components/Dispatch.svelte';
  export let data;

  const lane = {
    fromMmaCode: data.fromMmaCode,   // 'PSS_SORTED'
    toMmaCode:   data.toMmaCode,     // 'KEF_SORTED'
    redirectTo:  '/stations/pss/pss_sorted'
  };
</script>

<Dispatch {lane} onHand={data.onHand ?? null} showAmount={true} />
