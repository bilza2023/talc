<script>
    import { writable, derived } from 'svelte/store';
  
    // columns: [{ key, label, align?, width? }]
    // rows: Array<Record<string, any>>
    export let columns = [];
    export let rows = [];
    export let stickyHeader = true;
  
    const sortKey = writable(null);
    const sortDir = writable(1); // 1 asc, -1 desc
  
    function toggleSort(key) {
      sortKey.update((k) => {
        if (k !== key) { sortDir.set(1); return key; }
        sortDir.update((d) => -d);
        return key;
      });
    }
  
    const sorted = derived([sortKey, sortDir], ([$k, $d]) => {
      if (!$k) return rows;
      const clone = [...rows];
      clone.sort((a, b) => {
        const av = a?.[$k]; const bv = b?.[$k];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * $d;
        return String(av).localeCompare(String(bv)) * $d;
      });
      return clone;
    });
  </script>
  
  <div class="wrap">
    <table class:sticky={stickyHeader}>
      <thead>
        <tr>
          {#each columns as c}
            <th style={`text-align:${c.align || 'left'};${c.width ? `width:${c.width}` : ''}`}
                on:click={() => toggleSort(c.key)}
                role="button"
                aria-label={`Sort by ${c.label}`}>
              <span>{c.label}</span>
              <span class="sort" aria-hidden="true">↕</span>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#if rows?.length === 0}
          <tr><td class="empty" colspan={columns.length}>No data</td></tr>
        {:else}
          {#each $sorted as r (JSON.stringify(r))}
            <tr>
              {#each columns as c}
                <td style={`text-align:${c.align || 'left'}`}>
                  {#if typeof r[c.key] === 'number'}{r[c.key].toLocaleString()}
                  {:else}{r[c.key]}
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
  
  <style>
    .wrap { width: 100%; overflow-x: auto; }
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: .95rem;
      background: var(--panelBg, #101013);
      border: 1px solid var(--borderColor, #2a2a2e);
      border-radius: 12px;
    }
    thead th, tbody td { padding: .65rem .75rem; }
    thead th {
      position: relative;
      color: var(--mutedText, #a3a3a3);
      font-weight: 600;
      border-bottom: 1px solid var(--borderColor, #2a2a2e);
      user-select: none;
      cursor: pointer;
      background: color-mix(in oklab, var(--panelBg, #101013) 85%, black);
    }
    table.sticky thead th { position: sticky; top: 0; z-index: 2; }
    tbody tr:not(:last-child) td { border-bottom: 1px solid var(--borderColor, #2a2a2e); }
    tbody tr:hover td { background: color-mix(in oklab, var(--panelBg, #101013) 92%, var(--accent, #6ee7ff)); }
    .empty { text-align: center; color: var(--mutedText, #a3a3a3); padding: 1.25rem; }
    .sort { margin-left: .25rem; opacity: .5; font-size: .85em; }
  </style>
  