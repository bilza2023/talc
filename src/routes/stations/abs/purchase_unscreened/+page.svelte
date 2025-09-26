<!-- /src/routes/stations/abs/purchase_unscreened/+page.svelte -->
<script>
  import { page } from '$app/stores';
  export let data; // from /stations/abs/+layout.server.js

  $: ok  = $page.url.searchParams.get('ok') === '1';
  $: err = $page.url.searchParams.get('err') || '';
</script>

<h1>{data.stationName} — Purchase (Unscreened)</h1>
<p>MMA: <strong>{data.mmaCode}</strong></p>

{#if ok}
  <div class="alert alert-success" role="alert">Purchase created.</div>
{:else if err}
  <div class="alert alert-error" role="alert">{err}</div>
{/if}

<form method="POST" action="/stations/abs/purchase_unscreened" autocomplete="off">
  <div class="row">
    <label class="req" for="supplierId">Supplier</label>
    <select id="supplierId" name="supplierId" required>
      <option value="">Pick one…</option>
      {#each data.suppliers as s}
        <option value={s.id} selected={Number(data.defaults?.supplierId) === Number(s.id)}>
          {s.name ?? s.id}
        </option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label class="req" for="shade">Shade</label>
    <select id="shade" name="shade" required>
      <option value="">Pick one…</option>
      {#each data.shades as sh}
        <option value={sh} selected={data.defaults?.shade === sh}>{sh}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label class="req" for="size">Size</label>
    <select id="size" name="size" required>
      <option value="">Pick one…</option>
      {#each data.sizes as sz}
        <option value={sz} selected={data.defaults?.size === sz}>{sz}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label class="req" for="qty">Quantity (tons)</label>
    <input id="qty" name="qty" type="number" step="0.001" min="0.001" placeholder="e.g. 2.500"
           value={data.defaults?.qty ?? ''} required />
  </div>

  <input type="hidden" name="meta" value='' />

  <div class="actions">
    <button type="submit">Purchase</button>
    <a href="/stations/abs/slots" style="margin-left:12px;">Back to Slots</a>
  </div>
</form>

<style>
  form { max-width: 520px; display: grid; gap: 12px; }
  .row { display: grid; gap: 6px; }
  .actions { margin-top: 8px; }
  .req::after { content: ' *'; color: #b91c1c; }
  .alert { padding: 8px 10px; border-radius: 6px; }
  .alert-success { border: 1px solid #16a34a; background: color-mix(in oklab, #16a34a 12%, transparent); color: #dce9e2; }
  .alert-error { border: 1px solid #b91c1c; background: color-mix(in oklab, #b91c1c 12%, transparent); color: #fadde1; }
</style>
