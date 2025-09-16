<script>
  // Props
  export let title = 'Batch Details';
  // rows: [{ id, gradeCode, createdTon, remainingTon, depositedAt?, createdAt? }]
  export let rows = [];

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
        <div class="batch-row">
          <span class="label">ID</span>
          <span class="value">#{r.id}</span>
        </div>
        <div class="batch-row">
          <span class="label">Date</span>
          <span class="value">{fmtDate(r)}</span>
        </div>
        <div class="batch-row">
          <span class="label">Grade</span>
          <span class="value">{r.gradeCode}</span>
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
  --bg: linear-gradient(180deg, #0b1018, #0a0d13);
  --border: rgba(255,255,255,0.06);
  --text: #e6ebf1;
  --muted: #9aa3af;

  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  margin: 16px;
  color: var(--text);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.count {
  font-size: 0.9rem;
  color: var(--muted);
  font-weight: 500;
}

.batches {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.batch-card {
  background: color-mix(in oklab, var(--bg) 95%, white 5%);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.batch-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
}

.batch-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 0.85rem;
  color: var(--muted);
  letter-spacing: 0.3px;
}

.value {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
}

.value:first-child,
.value:nth-child(3) {
  font-weight: 700;
}

.empty {
  text-align: center;
  padding: 24px;
  font-size: 1rem;
  color: var(--muted);
}

@media (min-width: 640px) {
  .batch-card {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .batch-card {
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
  }
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