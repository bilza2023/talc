<script>
  import Receive from '$lib/components/Receive.svelte';
  export let data;


const FROM_MMA = 'PSS_SORTED';
const TO_MMA   = 'KEF_SORTED';

  const lane = {
    fromMmaCode: FROM_MMA,   // 'PSS_SORTED'
    toMmaCode:   TO_MMA      // 'KEF_SORTED'
  };
</script>

<Receive {lane} rows={data.rows} showAmount={true} />
