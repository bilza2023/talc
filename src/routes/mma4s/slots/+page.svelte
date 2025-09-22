<script>
  // Receives { mmaCode, supplierId, slots } from +page.server.js
  export let data;
  const { mmaCode, supplierId, slots } = data;

  // Build a querystring from an object
  const qs = (obj) => new URLSearchParams(obj).toString();

  // Build a prefilled query for a given slot
  const slotQuery = (slot) =>
    qs({
      mma: mmaCode,
      shade: slot.shade,
      size: slot.size,
      supplierId // keep lineage on dispatch/actions that need supplier context
    });

  const linkFor = (base, slot) => `${base}?${slotQuery(slot)}`;
</script>

<svelte:head>
  <title>Slots · {mmaCode} · Supplier #{supplierId}</title>
</svelte:head>

<section class="page">
  <header class="topbar">
    <div class="titles">
      <h1 class="h1">Slots</h1>
      <p class="sub">MMA: <strong>{mmaCode}</strong> · Supplier: <strong>#{supplierId}</strong></p>
    </div>
  </header>

  {#if !slots || slots.length === 0}
    <div class="empty">
      <p>No active slots for this supplier at <strong>{mmaCode}</strong>.</p>
    </div>
  {:else}
    <ul class="slots">
      {#each slots as slot}
        <li class="slot">
          <div class="slot-main">
            <div class="slot-title">
              <span class="tag shade">{slot.shade}</span>
              <span class="dot">·</span>
              <span class="tag size">{slot.size}</span>
            </div>
            <div class="qty">{slot.qty}</div>
          </div>

          <nav class="actions">
            <a class="btn" href={linkFor('/mma4s/dispatch', slot)}>Dispatch</a>
            <a class="btn" href={linkFor('/process/screen', slot)}>Screen</a>
            <a class="btn" href={linkFor('/process/sort', slot)}>Sort</a>
          </nav>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .page {
    padding: 1rem;
    max-width: 900px;
    margin: 0 auto;
  }
  .topbar {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: .75rem;
    margin-bottom: 1rem;
  }
  .h1 { font-size: 1.25rem; margin: 0; }
  .sub { opacity: .8; margin: 0; }

  .empty {
    opacity: .8;
    padding: 1rem;
    border: 1px dashed var(--borderColor, #3a3a3a);
    border-radius: 12px;
    text-align: center;
  }

  .slots {
    display: grid;
    grid-template-columns: 1fr;
    gap: .75rem;
  }

  @media (min-width: 720px) {
    .slots { grid-template-columns: 1fr 1fr; }
  }

  .slot {
    background: color-mix(in oklab, var(--panelBg, #111) 92%, white 8%);
    border: 1px solid var(--borderColor, #2b2b2b);
    border-radius: 14px;
    padding: .85rem;
    display: grid;
    gap: .75rem;
  }

  .slot-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .75rem;
  }

  .slot-title {
    display: flex;
    align-items: center;
    gap: .4rem;
    font-weight: 600;
  }
  .tag {
    padding: .18rem .5rem;
    border-radius: 999px;
    border: 1px solid var(--borderColor, #2b2b2b);
    opacity: .95;
  }
  .dot { opacity: .6; }

  .qty {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
  }

  .actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: .5rem;
  }
  .btn {
    display: inline-block;
    text-align: center;
    padding: .55rem .65rem;
    border-radius: 10px;
    border: 1px solid var(--borderColor, #2b2b2b);
    text-decoration: none;
    font-weight: 600;
    transition: transform .06s ease;
  }
  .btn:active { transform: translateY(1px) scale(0.99); }
</style>
