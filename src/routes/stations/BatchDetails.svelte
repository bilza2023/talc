<script>
  // Props
  export let title = 'Batch Details';
  // rows: [{ id, gradeCode, createdTon, remainingTon, depositedAt?, createdAt? }]
  export let rows = [];

  // Track which batches are expanded
  let expandedBatches = new Set();

  const pct = (r) => (Number(r.createdTon) > 0)
    ? (Number(r.remainingTon) / Number(r.createdTon)) * 100
    : 0;

  function fmtDate(r) {
    const raw = r.depositedAt ?? r.createdAt;
    if (!raw) return '';
    const d = new Date(raw);
    return isNaN(d) ? '' :
      `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  function toggleExpand(batchId) {
    if (expandedBatches.has(batchId)) {
      expandedBatches.delete(batchId);
    } else {
      expandedBatches.add(batchId);
    }
    expandedBatches = expandedBatches; // trigger reactivity
  }
</script>

<div class="card">
<header class="head">
  <h2 class="title">{title}</h2>
  <span class="count">{rows?.length || 0} open batch{rows?.length === 1 ? '' : 'es'}</span>
</header>

{#if rows && rows.length}
  <div class="batches">
    {#each rows as r}
      <div class="batch-card">
        <!-- Always visible summary row -->
        <div class="batch-summary" on:click={() => toggleExpand(r.id)} on:keydown={(e) => e.key === 'Enter' && toggleExpand(r.id)} role="button" tabindex="0">
          <div class="summary-content">
            <span class="batch-id">#{r.id}</span>
            <span class="batch-grade">{r.gradeCode}</span>
            <span class="batch-remaining">{Number(r.remainingTon).toFixed(2)}t ({pct(r).toFixed(1)}%)</span>
          </div>
          <div class="expand-icon" class:expanded={expandedBatches.has(r.id)}>▼</div>
        </div>

        <!-- Collapsible details -->
        {#if expandedBatches.has(r.id)}
          <div class="batch-details">
            <div class="batch-row">
              <span class="label">Date</span>
              <span class="value">{fmtDate(r)}</span>
            </div>
            <div class="batch-row">
              <span class="label">Start (t)</span>
              <span class="value">{Number(r.createdTon).toFixed(2)}</span>
            </div>
            <div class="batch-row">
              <span class="label">Present (t)</span>
              <span class="value">{Number(r.remainingTon).toFixed(2)}</span>
            </div>
            <div class="batch-row">
              <span class="label">% Left</span>
              <span class="value">{pct(r).toFixed(1)}%</span>
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
{:else}
  <div class="empty">
    No open batches.
  </div>
{/if}
</div>

<style>
  .card {
    background: var(--backgroundColor);
    border: 1px solid var(--borderColor);
    border-radius: 16px;
    padding: 16px;
    margin: 16px;
    color: var(--primaryText);
    box-shadow: 0 10px 30px color-mix(in oklab, var(--primaryText) 25%, transparent);
  }
  
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--borderColor);
  }
  
  .title {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
    letter-spacing: 0.2px;
  }
  
  .count {
    font-size: 0.9rem;
    color: var(--secondaryText);
    font-weight: 500;
  }
  
  .batches {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .batch-card {
    background: color-mix(in oklab, var(--surfaceColor) 95%, var(--primaryText) 5%);
    border: 1px solid var(--borderColor);
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  
  .batch-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px color-mix(in oklab, var(--primaryText) 25%, transparent);
  }

  .batch-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    cursor: pointer;
    user-select: none;
    transition: background 0.15s ease;
  }

  .batch-summary:hover {
    background: color-mix(in oklab, var(--surfaceColor) 90%, var(--primaryText) 10%);
  }

  .summary-content {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
  }

  .batch-id {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--primaryColor);
    min-width: 60px;
  }

  .batch-grade {
    font-weight: 600;
    color: var(--secondaryColor);
    min-width: 80px;
  }

  .batch-remaining {
    font-weight: 600;
    color: var(--primaryText);
  }

  .expand-icon {
    font-size: 0.8rem;
    color: var(--secondaryText);
    transition: transform 0.2s ease;
  }

  .expand-icon.expanded {
    transform: rotate(180deg);
  }

  .batch-details {
    padding: 0 12px 12px 12px;
    border-top: 1px solid var(--borderColor);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    animation: slideDown 0.2s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .batch-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .label {
    font-size: 0.85rem;
    color: var(--secondaryText);
    letter-spacing: 0.3px;
  }
  
  .value {
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1.3;
  }
  
  .empty {
    text-align: center;
    padding: 24px;
    font-size: 1rem;
    color: var(--secondaryText);
  }
  
  @media (min-width: 640px) {
    .summary-content {
      gap: 24px;
    }
    .batch-id {
      min-width: 80px;
    }
    .batch-grade {
      min-width: 100px;
    }
    .batch-details {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .title {
      font-size: 1.6rem;
    }
    .value {
      font-size: 1.2rem;
    }
    .label {
      font-size: 0.9rem;
    }
  }
</style>