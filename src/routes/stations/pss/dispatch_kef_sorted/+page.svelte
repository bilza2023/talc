<script>
  import Dispatch from '$lib/components/Dispatch.svelte';

  export let data;

  const form = data?.form ?? {};
  // Component prefers lane as an object {from, to}
  const lane =
    data?.lane ??
    {
      from: form.fromMmaCode ?? form.fromMma ?? form.from ?? '',
      to:   form.toMmaCode   ?? form.toMma   ?? form.to   ?? ''
    };
</script>

<Dispatch
  {...form}
  lane={lane}
  stationCode={data?.stationCode}
  stationName={data?.stationName}
  fromUrl={data?.fromUrl}
/>
