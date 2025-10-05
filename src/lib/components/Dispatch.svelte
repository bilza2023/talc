<!-- /src/lib/components/Dispatch.svelte -->
<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
  
    export let lane = { fromMmaCode: '', toMmaCode: '', redirectTo: '/' };
    export let onHand = null;        // number | null
    export let showAmount = false;   // optional money field
  
    let posting = false;
    let errorMsg = '';
  
    // URL-derived fields (read-only identity)
    $: sp            = $page.url.searchParams;
    $: supplierIdStr = sp.get('supplierId') || '';
    $: shade         = sp.get('shade') || '';
    $: size          = sp.get('size') || '';
    $: qtyStr        = sp.get('qty') || '';
    $: amountStr     = sp.get('amount');
  
    const supplierId = () => (supplierIdStr ? Number(supplierIdStr) : NaN);
  
    // Editable inputs
    let qty = 1;
    $: if (qtyStr && Number.isFinite(Number(qtyStr)) && Number(qtyStr) > 0) qty = Number(qtyStr);
  
    let amount = '';
    $: if (amountStr != null && Number.isFinite(Number(amountStr))) amount = Number(amountStr);
  
    // Missing guard (single reactive block avoids undefined 'missing')
    let missing = [];
    $: {
      missing = [];
      if (!supplierIdStr) missing.push('supplierId');
      if (!shade)         missing.push('shade');
      if (!size)          missing.push('size');
    }
  
    async function submit() {
      errorMsg = '';
  
      if (missing.length) {
        errorMsg = `Missing ${missing.join(', ')} in URL. Open this from the ${lane.fromMmaCode} slots page.`;
        return;
      }
      if (!Number.isFinite(qty) || qty <= 0) {
        errorMsg = 'Enter a valid quantity (> 0).';
        return;
      }
      if (onHand != null && qty > onHand) {
        errorMsg = `Insufficient stock at ${lane.fromMmaCode} (available=${onHand}, requested=${qty}).`;
        return;
      }
  
      const params = new URLSearchParams({
        fromMmaCode: lane.fromMmaCode,
        toMmaCode:   lane.toMmaCode,
        supplierId:  String(supplierId()),
        shade,
        size,
        qty:         String(qty)
      });
      if (showAmount && amount !== '' && Number.isFinite(Number(amount))) {
        params.set('amount', String(Number(amount)));
      }
  
      posting = true;
      try {
        const res  = await fetch(`/api/dispatch?${params.toString()}`, { method: 'POST' });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || 'Unknown error');
        await goto(lane.redirectTo);
      } catch (e) {
        errorMsg = `Dispatch failed — ${e.message}`;
      } finally {
        posting = false;
      }
    }
  </script>
  
  <section class="wrap">
    <h1>Dispatch — {lane.fromMmaCode} → {lane.toMmaCode}</h1>
    <p class="lane">Lane: {lane.fromMmaCode} → {lane.toMmaCode}</p>
  
    {#if missing.length}
      <p class="banner error">Missing supplierId, shade, or size in URL. Open this from the {lane.fromMmaCode} slots page.</p>
    {/if}
    {#if errorMsg}
      <p class="banner error">{errorMsg}</p>
    {/if}
    {#if onHand != null}
      <p class="hint">On hand at {lane.fromMmaCode}: {onHand} t</p>
    {/if}
  
    <div class="grid">
      <div class="kv"><div class="kv-key">Supplier ID</div><div class="kv-val">{supplierIdStr}</div></div>
      <div class="kv"><div class="kv-key">Shade</div><div class="kv-val">{shade}</div></div>
      <div class="kv"><div class="kv-key">Size</div><div class="kv-val">{size}</div></div>
    </div>
  
    <form on:submit|preventDefault={submit} class="form">
      <label for="qty">Quantity (t)</label>
      <input id="qty" type="number" bind:value={qty} min="0.0001" step="any" required />
  
      {#if showAmount}
        <label for="amount">Amount (optional)</label>
        <input id="amount" type="number" bind:value={amount} min="0" step="any" />
      {/if}
  
      <button type="submit" disabled={posting || missing.length > 0}>Dispatch</button>
    </form>
  </section>
  
  <style>
    .wrap { max-width: 720px; margin: 0 auto; display: grid; gap: 0.75rem; }
    h1 { margin: 0.25rem 0 0; }
    .lane { opacity: 0.8; margin: 0; }
    .banner.error { background: #3b0e0e; color: #f8d7da; padding: 0.5rem 0.75rem; border-radius: 6px; }
    .hint { font-size: 0.95rem; opacity: 0.9; }
    .grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.5rem; }
    .kv { background: rgba(255,255,255,0.04); padding: 0.5rem 0.75rem; border-radius: 6px; }
    .kv-key { font-size: 0.8rem; opacity: 0.7; margin-bottom: 0.1rem; }
    .form { display: grid; gap: 0.5rem; margin-top: 0.25rem; }
    input { width: 100%; }
    button[disabled] { opacity: 0.6; cursor: not-allowed; }
  </style>
  