<!-- /src/lib/components/Receive.svelte -->
<script>
    // Props:
    // lane: { fromMmaCode: string, toMmaCode: string }
    // rows: Array<{ transportId:string, supplierId:number, shade:string, size:string, dispatchedQty:number, createdAt?:string }>
    // showAmount?: boolean
    export let lane = { fromMmaCode: '', toMmaCode: '' };
    export let rows = [];
    export let showAmount = false;
  
    // Local working list (rows removed after success)
    let localRows = rows.map(r => ({ ...r }));
    $: if (rows !== undefined) localRows = rows.map(r => ({ ...r }));
  
    // Per-row UI state
    let st = {};
    function ensure(id) {
      return st[id] ?? { qty: '', amount: '', posting: false, error: '' };
    }
    function update(id, patch) {
      const prev = ensure(id);
      st = { ...st, [id]: { ...prev, ...patch } };
    }
    function get(id) {
      return st[id] ?? {};
    }
  
    function fmtQty(v) {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    }
  
    async function submitRow(r) {
      const s = get(r.transportId);
      update(r.transportId, { error: '' });
  
      const qty = Number.isFinite(Number(s.qty)) && Number(s.qty) > 0
        ? Number(s.qty)
        : Number(r.dispatchedQty);
  
      if (!(qty > 0)) {
        update(r.transportId, { error: 'Enter a valid quantity (> 0).' });
        return;
      }
      if (qty > Number(r.dispatchedQty)) {
        update(r.transportId, { error: `Qty cannot exceed dispatched (${r.dispatchedQty}).` });
        return;
      }
  
      const params = new URLSearchParams({
        transportId: r.transportId,
        toMmaCode: lane.toMmaCode,
        supplierId: String(r.supplierId),
        qty: String(qty),
        shade: r.shade || ''
      });
      const amtNum = Number(get(r.transportId).amount);
      if (showAmount && get(r.transportId).amount !== '' && Number.isFinite(amtNum)) {
        params.set('amount', String(amtNum));
      }
  
      update(r.transportId, { posting: true });
      try {
        const res  = await fetch(`/api/receive?${params.toString()}`, { method: 'POST' });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || 'Unknown error');
  
        // Success → remove row
        localRows = localRows.filter(x => x.transportId !== r.transportId);
        const { [r.transportId]: _, ...rest } = st;
        st = rest;
      } catch (e) {
        update(r.transportId, { error: `Receive failed — ${e.message}` });
      } finally {
        update(r.transportId, { posting: false });
      }
    }
  </script>
  
  <section class="wrap">
    <h1>Receive — {lane.fromMmaCode} → {lane.toMmaCode}</h1>
    <p class="lane">Lane: {lane.fromMmaCode} → {lane.toMmaCode}</p>
  
    {#if !localRows.length}
      <p class="banner neutral">No inbound dispatches to receive.</p>
    {/if}
  
    {#each localRows as r (r.transportId)}
      <div class="row">
        <div class="row-head">
          <div class="left">
            <div class="kv"><span class="k">Transport</span><span class="v mono">{r.transportId}</span></div>
            <div class="kv"><span class="k">Supplier</span><span class="v">{r.supplierId}</span></div>
            <div class="kv"><span class="k">Shade</span><span class="v">{r.shade}</span></div>
            <div class="kv"><span class="k">Size</span><span class="v">{r.size}</span></div>
          </div>
          <div class="right">
            <div class="kv"><span class="k">Dispatched</span><span class="v">{fmtQty(r.dispatchedQty)} t</span></div>
            {#if r.createdAt}
              <div class="kv"><span class="k">Dispatched At</span><span class="v">{r.createdAt}</span></div>
            {/if}
          </div>
        </div>
  
        {#if get(r.transportId).error}
          <p class="banner error">{get(r.transportId).error}</p>
        {/if}
  
        <form class="mini" on:submit|preventDefault={() => submitRow(r)}>
          <div class="field">
            <label for={"qty-" + r.transportId}>Receive Qty (t)</label>
            <input
              id={"qty-" + r.transportId}
              type="number"
              value={get(r.transportId).qty ?? ''}
              placeholder={String(r.dispatchedQty)}
              min="0.0001"
              step="any"
              on:input={(e) => update(r.transportId, { qty: e.currentTarget.value })}
            />
          </div>
  
          {#if showAmount}
            <div class="field">
              <label for={"amt-" + r.transportId}>Amount (optional)</label>
              <input
                id={"amt-" + r.transportId}
                type="number"
                value={get(r.transportId).amount ?? ''}
                min="0"
                step="any"
                on:input={(e) => update(r.transportId, { amount: e.currentTarget.value })}
              />
            </div>
          {/if}
  
          <div class="actions">
            <button type="submit" disabled={get(r.transportId).posting}>
              {get(r.transportId).posting ? 'Receiving…' : 'Receive'}
            </button>
          </div>
        </form>
      </div>
    {/each}
  </section>
  
  <style>
     .mini {
    display: grid;
    grid-template-columns: repeat(3, minmax(0,1fr));
    gap: 0.75rem;
    align-items: end;
    background: var(--surface, #1a1a1a);
    border: 1px solid var(--border, rgba(255,255,255,0.1));
    border-radius: 8px;
    padding: 0.75rem;
  }

  .field {
    display: grid;
    gap: 0.25rem;
  }

  label {
    font-size: 0.85rem;
    color: var(--text-secondary, rgba(255,255,255,0.7));
  }

  input {
    width: 100%;
    background: var(--surface-hover, #222);
    color: var(--text, #fff);
    border: 1px solid var(--border, rgba(255,255,255,0.2));
    border-radius: 6px;
    padding: 0.4rem 0.55rem;
    font-size: 0.95rem;
    transition: background 0.15s, border 0.15s;
  }

  input:focus {
    outline: none;
    background: var(--surface-active, #2b2b2b);
    border-color: var(--accent, #0099ff);
  }

  input::placeholder {
    color: var(--text-muted, rgba(255,255,255,0.4));
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
  }

  button {
    background: var(--accent, #0099ff);
    color: var(--on-accent, #fff);
    border: none;
    border-radius: 6px;
    padding: 0.45rem 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  button:hover {
    background: var(--accent-hover, #00aaff);
  }

  button[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
  }
    .wrap { max-width: 900px; margin: 0 auto; display: grid; gap: 0.75rem; }
    h1 { margin: 0.25rem 0 0; }
    .lane { opacity: 0.8; margin: 0; }
    .banner.neutral { background: rgba(255,255,255,0.04); padding: 0.5rem 0.75rem; border-radius: 6px; }
    .banner.error { background: #3b0e0e; color: #f8d7da; padding: 0.5rem 0.75rem; border-radius: 6px; }
  
    .row { border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.75rem; display: grid; gap: 0.5rem; }
    .row-head { display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: start; }
    .left, .right { display: grid; grid-auto-flow: column; gap: 1rem; align-items: center; }
    .kv { display: grid; gap: 0.15rem; }
    .k { font-size: 0.8rem; opacity: 0.7; }
    .v { font-variant-numeric: tabular-nums; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
  
    .mini { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 0.5rem; align-items: end; }
    .field { display: grid; gap: 0.25rem; }
    input { width: 100%; }
    .actions { display: flex; justify-content: flex-end; }
    button[disabled] { opacity: 0.6; cursor: not-allowed; }
  </style>
  