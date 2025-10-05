<script>
  import Receive from '$lib/components/Receive.svelte';
  export let data;

  const lane = {
    fromMmaCode: data.fromMmaCode,  // 'PSS_SORTED'
    toMmaCode:   data.toMmaCode     // 'KEF_SORTED'
  };
</script>

<!-- Sorted lanes usually allow amount — toggle as needed -->
<Receive {lane} rows={data.rows} showAmount={true} />
