<!-- /src/routes/stations/abs/+page.svelte -->
<script>
  export let data;
  export let form;

  const {
    stationCode, ABS_RAW, ABS_PRO, fromUrl,
    raw, pro
  } = data;

  const success = form?.success;
  const error   = form?.error;
</script>

<h1>{stationCode} — Station</h1>
