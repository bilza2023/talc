<script>
  export let lane = { fromMmaCode: '', toMmaCode: '' };
  export let row  = { transportId: '', supplierId: null, shade: '', size: '', qty: null, amount: null, createdAt: null };

  const sizeLabel = row?.size && row.size !== '' ? row.size : 'ANY';
  const uid = (name) => `${name}-${row?.transportId ?? Math.random().toString(36).slice(2)}`;
  const fmt = (n) => Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 });
</script>

<form method="POST" class="form receive-form" autocomplete="off">
  <input type="hidden" name="transportId" value={row.transportId} />
  <input type="hidden" name="toMmaCode"   value={lane.toMmaCode} />
  <input type="hidden" name="supplierId"  value={row.supplierId} />

  <!-- Header facts (NOT inputs) -->
  <div class="row stack">
    <div class="field">
      <div class="label muted">Transport</div>
      <div class="value code">{row.transportId}</div>
    </div>
    <div class="field">
      <div class="label muted">From → To</div>
      <div class="value mono">{lane.fromMmaCode} → {lane.toMmaCode}</div>
    </div>
    <div class="field">
      <div class="label muted">Supplier</div>
      <div class="value">#{row.supplierId}</div>
    </div>
  </div>

  <!-- Editable overrides -->
  <div class="row stack">
    <div class="field">
      <label for={uid('qty')}>Qty</label>
      <input id={uid('qty')} name="qty" type="number" step="0.001" min="0" placeholder={fmt(row.qty)} />
      <small class="hint">Leave blank to accept full dispatched qty ({fmt(row.qty)}).</small>
    </div>

    <div class="field">
      <label for={uid('amount')}>Amount</label>
      <input id={uid('amount')} name="amount" type="number" step="0.01" min="0"
             placeholder={row.amount != null ? fmt(row.amount) : 'auto'} />
      <small class="hint">Blank keeps original dispatch amount.</small>
    </div>

    <div class="field">
      <label for={uid('shade')}>Shade (optional)</label>
      <input id={uid('shade')} name="shade" type="text" placeholder={row.shade || 'inherit'} />
      <small class="hint">Blank inherits dispatch shade.</small>
    </div>

    <div class="field">
      <div class="label">Size</div>
      <div class="value">{sizeLabel}</div>
    </div>
  </div>

  <div class="row actions">
    <!-- Named RECEIVE -->
    <button type="submit" class="btn primary" formaction="?/receive" formmethod="POST">Receive</button>

    <!-- Named CANCEL -->
    <button type="submit" class="btn danger"  formaction="?/cancel"   formmethod="POST">Cancel</button>

  </div>
</form>

<style>
  .receive-form { padding: var(--spaceMd, 16px); border: 1px solid var(--borderColor, #22312c);
                  border-radius: var(--radiusLg, 12px); background: var(--surface0, #0f1a16); }
  .row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--spaceSm, 10px); }
  .row.stack { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 720px) { .row, .row.stack { grid-template-columns: 1fr; } }

  .field { display: flex; flex-direction: column; min-width: 0; }
  .label { font: 600 0.85rem/1.2 var(--fontSans, system-ui); margin-bottom: 6px; }
  .muted { color: var(--mutedText, #9fb2aa); }

  .value { padding: 10px 12px; border: 1px dashed var(--borderColor, #22312c); border-radius: var(--radius, 8px); }
  .code, .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }

  .hint { margin-top: 4px; opacity: 0.75; }
  .actions { margin-top: var(--spaceSm, 10px); display: flex; gap: 8px; }

  .btn { padding: 10px 14px; border-radius: var(--radius, 8px); border: 1px solid var(--borderColor, #22312c);
         background: var(--brand, #1a7f64); color: #fff; cursor: pointer; }
  .btn.primary { background: var(--accent, #0ba37f); }
  .btn.danger  { background: #b3261e; }
  input[type="number"], input[type="text"] {
    width: 100%; padding: 10px 12px; border: 1px solid var(--borderColor, #22312c);
    border-radius: var(--radius, 8px); background: var(--surface1, #0c1613); color: var(--text, #e6ebf1);
    box-sizing: border-box;
  }
</style>
