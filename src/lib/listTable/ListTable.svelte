<script>
    import { createEventDispatcher } from 'svelte';
  
    // Minimal, generic API
    export let items = [];                 // rows (current page data only)
    export let columns = [];               // [{ id, label, accessor, kind?, primary?, sortable?, align?, width?, action?[], format? }]
    export let rowKey = 'id';              // e.g. 'id' or 'slug'
    export let searchable = true;          // show/hide the search bar
    export let searchKeys = undefined;     // fields to scan; default: all text columns
    export let thumbBaseUrl = '';          // prefix for filename thumbnails
    export let fallbackThumb = '/media/images/taleem.webp';
    export let emptyMessage = 'Nothing here yet';
  
    const dispatch = createEventDispatcher();
  
    // Normalize columns: ensure we have an accessor; set defaults
    $: cols = columns.map((c) => {
      const accessor = c.accessor || c.field || c.prop || c.key || c.id;
      return { kind: 'text', sortable: false, ...c, accessor };
    });
  
    // Search state
    let query = '';
    $: activeSearchKeys =
      Array.isArray(searchKeys) && searchKeys.length
        ? searchKeys
        : cols.filter((c) => (c.kind ?? 'text') === 'text' && c.accessor).map((c) => c.accessor);
  
    // Sort state (single-column)
    let sort = { id: null, dir: 'none' }; // 'asc' | 'desc' | 'none'
  
    function keyOf(row) {
      if (rowKey && row?.[rowKey] != null) return row[rowKey];
      if (row?.id != null) return row.id;
      if (row?.slug != null) return row.slug;
      return JSON.stringify(row);
    }
  
    function valueAt(row, accessor) {
      if (!accessor) return undefined;
      const parts = String(accessor).split('.');
      let v = row;
      for (const p of parts) {
        if (v == null) return undefined;
        v = v[p];
      }
      return v;
    }
  
    function imgSrc(v) {
      if (!v) return fallbackThumb;
      const s = String(v);
      if (s.startsWith('http') || s.startsWith('/')) return s;
      const base = (thumbBaseUrl || '/media/images').replace(/\/$/, '');
      return `${base}/${s}`;
    }
  
    function fmt(col, v) {
      if (col.kind === 'date') {
        if (!v) return '—';
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return String(v);
        if (col.format === 'relative') {
          const diff = Date.now() - d.getTime();
          const s = Math.round(diff / 1000);
          if (s < 60) return `${s}s ago`;
          const m = Math.round(s / 60);
          if (m < 60) return `${m}m ago`;
          const h = Math.round(m / 60);
          if (h < 24) return `${h}h ago`;
          const day = Math.round(h / 24);
          return `${day}d ago`;
        }
        if (col.format === 'date') return d.toLocaleDateString();
        return d.toLocaleString();
      }
      return v == null || v === '' ? '—' : v;
    }
  
    function onHeaderClick(col) {
      if (!col?.sortable) return;
      let dir = 'asc';
      if (sort.id === col.id && sort.dir === 'asc') dir = 'desc';
      else if (sort.id === col.id && sort.dir === 'desc') dir = 'none';
      sort = { id: col.id, dir };
    }
  
    function onPrimary(row) {
      dispatch('rowClick', row);
    }
    function onActionClick(actionId, row) {
      dispatch('action', { actionId, row });
    }
  
    // Local search + sort
    $: displayed = (() => {
      let arr = items.slice();
  
      // search
      if (searchable && query.trim()) {
        const needle = query.trim().toLowerCase();
        arr = arr.filter((r) =>
          activeSearchKeys.some((k) => String(valueAt(r, k) ?? '').toLowerCase().includes(needle))
        );
      }
  
      // sort
      if (sort.id && sort.dir !== 'none') {
        const col = cols.find((c) => c.id === sort.id);
        const acc = col?.accessor;
        arr.sort((a, b) => {
          if (col?.kind === 'date') {
            const an = valueAt(a, acc) ? new Date(valueAt(a, acc)).getTime() : 0;
            const bn = valueAt(b, acc) ? new Date(valueAt(b, acc)).getTime() : 0;
            return sort.dir === 'asc' ? an - bn : bn - an;
          }
          const av = String(valueAt(a, acc) ?? '');
          const bv = String(valueAt(b, acc) ?? '');
          const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' });
          return sort.dir === 'asc' ? cmp : -cmp;
        });
      }
  
      return arr;
    })();
  </script>
  
  <div class="lt">
    {#if searchable}
      <div class="toolbar">
        <input
          class="search"
          type="search"
          placeholder="Search..."
          bind:value={query}
          aria-label="Search"
        />
      </div>
    {/if}
  
    <div class="tableWrap">
      <table class="list">
        <thead>
          <tr>
            {#each cols as col}
              <th
                class:sortable={col.sortable}
                class:selected={sort.id === col.id}
                on:click={() => onHeaderClick(col)}
                style={col.width ? `width:${col.width}` : ''}
              >
                {col.label || col.id}
                {#if col.sortable}
                  <span class="sort">
                    {sort.id === col.id ? (sort.dir === 'asc' ? '▲' : sort.dir === 'desc' ? '▼' : '·') : '·'}
                  </span>
                {/if}
              </th>
            {/each}
          </tr>
        </thead>
  
        <tbody>
          {#if displayed.length === 0}
            <tr><td class="empty" colspan={cols.length}>{emptyMessage}</td></tr>
          {:else}
            {#each displayed as row (keyOf(row))}
              <tr>
                {#each cols as col}
                  <td class={col.align === 'right' ? 'ta-r' : col.align === 'center' ? 'ta-c' : ''}>
                    {#if col.kind === 'thumbnail'}
                      <img class="thumb" alt="" src={imgSrc(valueAt(row, col.accessor))} />
                    {:else if col.kind === 'actions'}
                      <div class="actions">
                        {#each (col.action || []) as act}
                          <button class="btn sm" on:click={() => onActionClick(act, row)}>{act}</button>
                        {/each}
                      </div>
                    {:else if col.primary}
                      <button class="linklike" on:click={() => onPrimary(row)}>
                        {fmt(col, valueAt(row, col.accessor))}
                      </button>
                    {:else}
                      {fmt(col, valueAt(row, col.accessor))}
                    {/if}
                  </td>
                {/each}
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
  
  <style>
    .lt { color: var(--primaryText); }
    .toolbar { display:flex; gap:.5rem; margin: .25rem 0 .5rem; }
    .search {
      width: 260px; max-width: 100%;
      padding: .45rem .6rem; border-radius: .5rem;
      border: 1px solid var(--divider, #334);
      background: var(--panelBg, #111827); color: inherit;
    }
    .tableWrap { overflow-x: auto; }
    table.list { width: 100%; border-collapse: collapse; }
    thead th {
      text-align:left; font-weight:600; font-size:.9rem;
      border-bottom:1px solid var(--divider,#334); padding:.5rem .5rem;
      color:var(--secondaryText,#aab); user-select:none;
    }
    th.sortable { cursor:pointer; }
    th .sort { font-size:.8em; margin-left:.25rem; opacity:.6; }
    tbody td { padding:.5rem .5rem; border-bottom:1px solid var(--divider,#233); vertical-align:middle; }
    .thumb { width:44px; height:44px; object-fit:cover; border-radius:.4rem; }
    .linklike { display:inline-block; text-align:left; background:transparent; border:0; padding:0; color:inherit; cursor:pointer; }
    .btn { display:inline-block; padding:.35rem .6rem; border-radius:.5rem; background: var(--buttonBg,#89f); color:#0b1220; font-weight:700; text-decoration:none; }
    .btn.sm { font-size:.85rem; padding:.25rem .5rem; }
    .ta-r { text-align:right; } .ta-c { text-align:center; }
    .empty { text-align:center; opacity:.8; padding:.75rem 0; }
    @media (max-width: 720px) {
      thead th:nth-child(3), tbody td:nth-child(3), /* Subject */
      thead th:nth-child(6), tbody td:nth-child(6)  /* Edited  */
      { display: none; }
    }
  </style>
  