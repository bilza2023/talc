<script>
  export let data;
  const { stationCode, stationName, cards } = data;
</script>

<h1>{stationName} — Station</h1>

<section>
  <ul>
    {#each cards as c}
      <li>
        <a href={c.href}>{c.icon} {c.label}</a>
      </li>
    {/each}
  </ul>
</section>
