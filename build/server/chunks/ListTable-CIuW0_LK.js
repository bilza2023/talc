import { c as create_ssr_component, h as createEventDispatcher, d as add_attribute, e as each, f as escape, j as null_to_empty } from './ssr-YOuSP3iu.js';

const css = {
  code: ".lt.svelte-1nwjvoq.svelte-1nwjvoq{color:var(--primaryText);background-color:var(--surfaceColor)}.toolbar.svelte-1nwjvoq.svelte-1nwjvoq{display:flex;gap:.5rem;margin:.25rem 0 .5rem}.search.svelte-1nwjvoq.svelte-1nwjvoq{width:260px;max-width:100%;padding:.45rem .6rem;border-radius:.5rem;border:1px solid var(--divider, #334);background:var(backgroundColor)}.tableWrap.svelte-1nwjvoq.svelte-1nwjvoq{overflow-x:auto}table.list.svelte-1nwjvoq.svelte-1nwjvoq{width:100%;border-collapse:collapse}thead.svelte-1nwjvoq th.svelte-1nwjvoq{text-align:left;font-weight:600;font-size:.9rem;border-bottom:1px solid var(--divider,#334);padding:.5rem .5rem;color:var(--secondaryText,#aab);-webkit-user-select:none;-moz-user-select:none;user-select:none}th.sortable.svelte-1nwjvoq.svelte-1nwjvoq{cursor:pointer}th.svelte-1nwjvoq .sort.svelte-1nwjvoq{font-size:.8em;margin-left:.25rem;opacity:.6}tbody.svelte-1nwjvoq td.svelte-1nwjvoq{padding:.5rem .5rem;border-bottom:1px solid var(--divider,#233);vertical-align:middle}.thumb.svelte-1nwjvoq.svelte-1nwjvoq{width:44px;height:44px;-o-object-fit:cover;object-fit:cover;border-radius:.4rem}.linklike.svelte-1nwjvoq.svelte-1nwjvoq{display:inline-block;text-align:left;background:transparent;border:0;padding:0;color:inherit;cursor:pointer}.btn.svelte-1nwjvoq.svelte-1nwjvoq{display:inline-block;padding:.35rem .6rem;border-radius:.5rem;background:var(--buttonBg,#89f);color:#0b1220;font-weight:700;text-decoration:none}.btn.sm.svelte-1nwjvoq.svelte-1nwjvoq{font-size:.85rem;padding:.25rem .5rem}.ta-r.svelte-1nwjvoq.svelte-1nwjvoq{text-align:right}.ta-c.svelte-1nwjvoq.svelte-1nwjvoq{text-align:center}.empty.svelte-1nwjvoq.svelte-1nwjvoq{text-align:center;opacity:.8;padding:.75rem 0}@media(max-width: 720px){thead.svelte-1nwjvoq th.svelte-1nwjvoq:nth-child(3),tbody.svelte-1nwjvoq td.svelte-1nwjvoq:nth-child(3),thead.svelte-1nwjvoq th.svelte-1nwjvoq:nth-child(6),tbody.svelte-1nwjvoq td.svelte-1nwjvoq:nth-child(6){display:none}}",
  map: `{"version":3,"file":"ListTable.svelte","sources":["ListTable.svelte"],"sourcesContent":["<script>\\n    import { createEventDispatcher } from 'svelte';\\n  \\n    // Minimal, generic API\\n    export let items = [];                 // rows (current page data only)\\n    export let columns = [];               // [{ id, label, accessor, kind?, primary?, sortable?, align?, width?, action?[], format? }]\\n    export let rowKey = 'id';              // e.g. 'id' or 'slug'\\n    export let searchable = true;          // show/hide the search bar\\n    export let searchKeys = undefined;     // fields to scan; default: all text columns\\n    export let thumbBaseUrl = '';          // prefix for filename thumbnails\\n    export let fallbackThumb = '/media/images/taleem.webp';\\n    export let emptyMessage = 'Nothing here yet';\\n  \\n    const dispatch = createEventDispatcher();\\n  \\n    // Normalize columns: ensure we have an accessor; set defaults\\n    $: cols = columns.map((c) => {\\n      const accessor = c.accessor || c.field || c.prop || c.key || c.id;\\n      return { kind: 'text', sortable: false, ...c, accessor };\\n    });\\n  \\n    // Search state\\n    let query = '';\\n    $: activeSearchKeys =\\n      Array.isArray(searchKeys) && searchKeys.length\\n        ? searchKeys\\n        : cols.filter((c) => (c.kind ?? 'text') === 'text' && c.accessor).map((c) => c.accessor);\\n  \\n    // Sort state (single-column)\\n    let sort = { id: null, dir: 'none' }; // 'asc' | 'desc' | 'none'\\n  \\n    function keyOf(row) {\\n      if (rowKey && row?.[rowKey] != null) return row[rowKey];\\n      if (row?.id != null) return row.id;\\n      if (row?.slug != null) return row.slug;\\n      return JSON.stringify(row);\\n    }\\n  \\n    function valueAt(row, accessor) {\\n      if (!accessor) return undefined;\\n      const parts = String(accessor).split('.');\\n      let v = row;\\n      for (const p of parts) {\\n        if (v == null) return undefined;\\n        v = v[p];\\n      }\\n      return v;\\n    }\\n  \\n    function imgSrc(v) {\\n      if (!v) return fallbackThumb;\\n      const s = String(v);\\n      if (s.startsWith('http') || s.startsWith('/')) return s;\\n      const base = (thumbBaseUrl || '/media/images').replace(/\\\\/$/, '');\\n      return \`\${base}/\${s}\`;\\n    }\\n  \\n    function fmt(col, v) {\\n      if (col.kind === 'date') {\\n        if (!v) return '—';\\n        const d = new Date(v);\\n        if (Number.isNaN(d.getTime())) return String(v);\\n        if (col.format === 'relative') {\\n          const diff = Date.now() - d.getTime();\\n          const s = Math.round(diff / 1000);\\n          if (s < 60) return \`\${s}s ago\`;\\n          const m = Math.round(s / 60);\\n          if (m < 60) return \`\${m}m ago\`;\\n          const h = Math.round(m / 60);\\n          if (h < 24) return \`\${h}h ago\`;\\n          const day = Math.round(h / 24);\\n          return \`\${day}d ago\`;\\n        }\\n        if (col.format === 'date') return d.toLocaleDateString();\\n        return d.toLocaleString();\\n      }\\n      return v == null || v === '' ? '—' : v;\\n    }\\n  \\n    function onHeaderClick(col) {\\n      if (!col?.sortable) return;\\n      let dir = 'asc';\\n      if (sort.id === col.id && sort.dir === 'asc') dir = 'desc';\\n      else if (sort.id === col.id && sort.dir === 'desc') dir = 'none';\\n      sort = { id: col.id, dir };\\n    }\\n  \\n    function onPrimary(row) {\\n      dispatch('rowClick', row);\\n    }\\n    function onActionClick(actionId, row) {\\n      dispatch('action', { actionId, row });\\n    }\\n  \\n    // Local search + sort\\n    $: displayed = (() => {\\n      let arr = items.slice();\\n  \\n      // search\\n      if (searchable && query.trim()) {\\n        const needle = query.trim().toLowerCase();\\n        arr = arr.filter((r) =>\\n          activeSearchKeys.some((k) => String(valueAt(r, k) ?? '').toLowerCase().includes(needle))\\n        );\\n      }\\n  \\n      // sort\\n      if (sort.id && sort.dir !== 'none') {\\n        const col = cols.find((c) => c.id === sort.id);\\n        const acc = col?.accessor;\\n        arr.sort((a, b) => {\\n          if (col?.kind === 'date') {\\n            const an = valueAt(a, acc) ? new Date(valueAt(a, acc)).getTime() : 0;\\n            const bn = valueAt(b, acc) ? new Date(valueAt(b, acc)).getTime() : 0;\\n            return sort.dir === 'asc' ? an - bn : bn - an;\\n          }\\n          const av = String(valueAt(a, acc) ?? '');\\n          const bv = String(valueAt(b, acc) ?? '');\\n          const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' });\\n          return sort.dir === 'asc' ? cmp : -cmp;\\n        });\\n      }\\n  \\n      return arr;\\n    })();\\n  <\/script>\\n  \\n  <div class=\\"lt\\">\\n    {#if searchable}\\n      <div class=\\"toolbar\\">\\n        <input\\n          class=\\"search\\"\\n          type=\\"search\\"\\n          placeholder=\\"Search...\\"\\n          bind:value={query}\\n          aria-label=\\"Search\\"\\n        />\\n      </div>\\n    {/if}\\n  \\n    <div class=\\"tableWrap\\">\\n      <table class=\\"list\\">\\n        <thead>\\n          <tr>\\n            {#each cols as col}\\n              <th\\n                class:sortable={col.sortable}\\n                class:selected={sort.id === col.id}\\n                on:click={() => onHeaderClick(col)}\\n                style={col.width ? \`width:\${col.width}\` : ''}\\n              >\\n                {col.label || col.id}\\n                {#if col.sortable}\\n                  <span class=\\"sort\\">\\n                    {sort.id === col.id ? (sort.dir === 'asc' ? '▲' : sort.dir === 'desc' ? '▼' : '·') : '·'}\\n                  </span>\\n                {/if}\\n              </th>\\n            {/each}\\n          </tr>\\n        </thead>\\n  \\n        <tbody>\\n          {#if displayed.length === 0}\\n            <tr><td class=\\"empty\\" colspan={cols.length}>{emptyMessage}</td></tr>\\n          {:else}\\n            {#each displayed as row (keyOf(row))}\\n              <tr>\\n                {#each cols as col}\\n                  <td class={col.align === 'right' ? 'ta-r' : col.align === 'center' ? 'ta-c' : ''}>\\n                    {#if col.kind === 'thumbnail'}\\n                      <img class=\\"thumb\\" alt=\\"\\" src={imgSrc(valueAt(row, col.accessor))} />\\n                    {:else if col.kind === 'actions'}\\n                      <div class=\\"actions\\">\\n                        {#each (col.action || []) as act}\\n                          <button class=\\"btn sm\\" on:click={() => onActionClick(act, row)}>{act}</button>\\n                        {/each}\\n                      </div>\\n                    {:else if col.primary}\\n                      <button class=\\"linklike\\" on:click={() => onPrimary(row)}>\\n                        {fmt(col, valueAt(row, col.accessor))}\\n                      </button>\\n                    {:else}\\n                      {fmt(col, valueAt(row, col.accessor))}\\n                    {/if}\\n                  </td>\\n                {/each}\\n              </tr>\\n            {/each}\\n          {/if}\\n        </tbody>\\n      </table>\\n    </div>\\n  </div>\\n  \\n  <style>\\n    .lt { color: var(--primaryText); background-color: var(--surfaceColor);}\\n    .toolbar { display:flex; gap:.5rem; margin: .25rem 0 .5rem; }\\n    .search {\\n      width: 260px; max-width: 100%;\\n      padding: .45rem .6rem; border-radius: .5rem;\\n      border: 1px solid var(--divider, #334);\\n      background: var(backgroundColor);\\n    }\\n    .tableWrap { overflow-x: auto; }\\n    table.list { width: 100%; border-collapse: collapse; }\\n    thead th {\\n      text-align:left; font-weight:600; font-size:.9rem;\\n      border-bottom:1px solid var(--divider,#334); padding:.5rem .5rem;\\n      color:var(--secondaryText,#aab); -webkit-user-select:none; -moz-user-select:none; user-select:none;\\n    }\\n    th.sortable { cursor:pointer; }\\n    th .sort { font-size:.8em; margin-left:.25rem; opacity:.6; }\\n    tbody td { padding:.5rem .5rem; border-bottom:1px solid var(--divider,#233); vertical-align:middle; }\\n    .thumb { width:44px; height:44px; -o-object-fit:cover; object-fit:cover; border-radius:.4rem; }\\n    .linklike { display:inline-block; text-align:left; background:transparent; border:0; padding:0; color:inherit; cursor:pointer; }\\n    .btn { display:inline-block; padding:.35rem .6rem; border-radius:.5rem; background: var(--buttonBg,#89f); color:#0b1220; font-weight:700; text-decoration:none; }\\n    .btn.sm { font-size:.85rem; padding:.25rem .5rem; }\\n    .ta-r { text-align:right; } .ta-c { text-align:center; }\\n    .empty { text-align:center; opacity:.8; padding:.75rem 0; }\\n    @media (max-width: 720px) {\\n      thead th:nth-child(3), tbody td:nth-child(3), /* Subject */\\n      thead th:nth-child(6), tbody td:nth-child(6)  /* Edited  */\\n      { display: none; }\\n    }\\n  </style>\\n  "],"names":[],"mappings":"AAoMI,iCAAI,CAAE,KAAK,CAAE,IAAI,aAAa,CAAC,CAAE,gBAAgB,CAAE,IAAI,cAAc,CAAE,CACvE,sCAAS,CAAE,QAAQ,IAAI,CAAE,IAAI,KAAK,CAAE,MAAM,CAAE,MAAM,CAAC,CAAC,CAAC,KAAO,CAC5D,qCAAQ,CACN,KAAK,CAAE,KAAK,CAAE,SAAS,CAAE,IAAI,CAC7B,OAAO,CAAE,MAAM,CAAC,KAAK,CAAE,aAAa,CAAE,KAAK,CAC3C,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,SAAS,CAAC,KAAK,CAAC,CACtC,UAAU,CAAE,IAAI,eAAe,CACjC,CACA,wCAAW,CAAE,UAAU,CAAE,IAAM,CAC/B,KAAK,mCAAM,CAAE,KAAK,CAAE,IAAI,CAAE,eAAe,CAAE,QAAU,CACrD,oBAAK,CAAC,iBAAG,CACP,WAAW,IAAI,CAAE,YAAY,GAAG,CAAE,UAAU,KAAK,CACjD,cAAc,GAAG,CAAC,KAAK,CAAC,IAAI,SAAS,CAAC,IAAI,CAAC,CAAE,QAAQ,KAAK,CAAC,KAAK,CAChE,MAAM,IAAI,eAAe,CAAC,IAAI,CAAC,CAAE,oBAAoB,IAAI,CAAE,iBAAiB,IAAI,CAAE,YAAY,IAChG,CACA,EAAE,uCAAU,CAAE,OAAO,OAAS,CAC9B,iBAAE,CAAC,oBAAM,CAAE,UAAU,IAAI,CAAE,YAAY,MAAM,CAAE,QAAQ,EAAI,CAC3D,oBAAK,CAAC,iBAAG,CAAE,QAAQ,KAAK,CAAC,KAAK,CAAE,cAAc,GAAG,CAAC,KAAK,CAAC,IAAI,SAAS,CAAC,IAAI,CAAC,CAAE,eAAe,MAAQ,CACpG,oCAAO,CAAE,MAAM,IAAI,CAAE,OAAO,IAAI,CAAE,cAAc,KAAK,CAAE,WAAW,KAAK,CAAE,cAAc,KAAO,CAC9F,uCAAU,CAAE,QAAQ,YAAY,CAAE,WAAW,IAAI,CAAE,WAAW,WAAW,CAAE,OAAO,CAAC,CAAE,QAAQ,CAAC,CAAE,MAAM,OAAO,CAAE,OAAO,OAAS,CAC/H,kCAAK,CAAE,QAAQ,YAAY,CAAE,QAAQ,MAAM,CAAC,KAAK,CAAE,cAAc,KAAK,CAAE,UAAU,CAAE,IAAI,UAAU,CAAC,IAAI,CAAC,CAAE,MAAM,OAAO,CAAE,YAAY,GAAG,CAAE,gBAAgB,IAAM,CAChK,IAAI,iCAAI,CAAE,UAAU,MAAM,CAAE,QAAQ,MAAM,CAAC,KAAO,CAClD,mCAAM,CAAE,WAAW,KAAO,CAAE,mCAAM,CAAE,WAAW,MAAQ,CACvD,oCAAO,CAAE,WAAW,MAAM,CAAE,QAAQ,EAAE,CAAE,QAAQ,MAAM,CAAC,CAAG,CAC1D,MAAO,YAAY,KAAK,CAAE,CACxB,oBAAK,CAAC,iBAAE,WAAW,CAAC,CAAC,CAAE,oBAAK,CAAC,iBAAE,WAAW,CAAC,CAAC,CAC5C,oBAAK,CAAC,iBAAE,WAAW,CAAC,CAAC,CAAE,oBAAK,CAAC,iBAAE,WAAW,CAAC,CAC3C,CAAE,OAAO,CAAE,IAAM,CACnB"}`
};
function valueAt(row, accessor) {
  if (!accessor) return void 0;
  const parts = String(accessor).split(".");
  let v = row;
  for (const p of parts) {
    if (v == null) return void 0;
    v = v[p];
  }
  return v;
}
function fmt(col, v) {
  if (col.kind === "date") {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    if (col.format === "relative") {
      const diff = Date.now() - d.getTime();
      const s = Math.round(diff / 1e3);
      if (s < 60) return `${s}s ago`;
      const m = Math.round(s / 60);
      if (m < 60) return `${m}m ago`;
      const h = Math.round(m / 60);
      if (h < 24) return `${h}h ago`;
      const day = Math.round(h / 24);
      return `${day}d ago`;
    }
    if (col.format === "date") return d.toLocaleDateString();
    return d.toLocaleString();
  }
  return v == null || v === "" ? "—" : v;
}
const ListTable = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let cols;
  let activeSearchKeys;
  let displayed;
  let { items = [] } = $$props;
  let { columns = [] } = $$props;
  let { rowKey = "id" } = $$props;
  let { searchable = true } = $$props;
  let { searchKeys = void 0 } = $$props;
  let { thumbBaseUrl = "" } = $$props;
  let { fallbackThumb = "/media/images/taleem.webp" } = $$props;
  let { emptyMessage = "Nothing here yet" } = $$props;
  createEventDispatcher();
  let query = "";
  let sort = { id: null };
  function imgSrc(v) {
    if (!v) return fallbackThumb;
    const s = String(v);
    if (s.startsWith("http") || s.startsWith("/")) return s;
    const base = (thumbBaseUrl || "/media/images").replace(/\/$/, "");
    return `${base}/${s}`;
  }
  if ($$props.items === void 0 && $$bindings.items && items !== void 0) $$bindings.items(items);
  if ($$props.columns === void 0 && $$bindings.columns && columns !== void 0) $$bindings.columns(columns);
  if ($$props.rowKey === void 0 && $$bindings.rowKey && rowKey !== void 0) $$bindings.rowKey(rowKey);
  if ($$props.searchable === void 0 && $$bindings.searchable && searchable !== void 0) $$bindings.searchable(searchable);
  if ($$props.searchKeys === void 0 && $$bindings.searchKeys && searchKeys !== void 0) $$bindings.searchKeys(searchKeys);
  if ($$props.thumbBaseUrl === void 0 && $$bindings.thumbBaseUrl && thumbBaseUrl !== void 0) $$bindings.thumbBaseUrl(thumbBaseUrl);
  if ($$props.fallbackThumb === void 0 && $$bindings.fallbackThumb && fallbackThumb !== void 0) $$bindings.fallbackThumb(fallbackThumb);
  if ($$props.emptyMessage === void 0 && $$bindings.emptyMessage && emptyMessage !== void 0) $$bindings.emptyMessage(emptyMessage);
  $$result.css.add(css);
  cols = columns.map((c) => {
    const accessor = c.accessor || c.field || c.prop || c.key || c.id;
    return {
      kind: "text",
      sortable: false,
      ...c,
      accessor
    };
  });
  activeSearchKeys = Array.isArray(searchKeys) && searchKeys.length ? searchKeys : cols.filter((c) => (c.kind ?? "text") === "text" && c.accessor).map((c) => c.accessor);
  displayed = (() => {
    let arr = items.slice();
    if (searchable && query.trim()) {
      const needle = query.trim().toLowerCase();
      arr = arr.filter((r) => activeSearchKeys.some((k) => String(valueAt(r, k) ?? "").toLowerCase().includes(needle)));
    }
    return arr;
  })();
  return `<div class="lt svelte-1nwjvoq">${searchable ? `<div class="toolbar svelte-1nwjvoq"><input class="search svelte-1nwjvoq" type="search" placeholder="Search..." aria-label="Search"${add_attribute("value", query, 0)}></div>` : ``} <div class="tableWrap svelte-1nwjvoq"><table class="list svelte-1nwjvoq"><thead class="svelte-1nwjvoq"><tr>${each(cols, (col) => {
    return `<th${add_attribute("style", col.width ? `width:${col.width}` : "", 0)} class="${[
      "svelte-1nwjvoq",
      (col.sortable ? "sortable" : "") + " " + (sort.id === col.id ? "selected" : "")
    ].join(" ").trim()}">${escape(col.label || col.id)} ${col.sortable ? `<span class="sort svelte-1nwjvoq">${escape(sort.id === col.id ? "·" : "·")} </span>` : ``} </th>`;
  })}</tr></thead> <tbody class="svelte-1nwjvoq">${displayed.length === 0 ? `<tr><td class="empty svelte-1nwjvoq"${add_attribute("colspan", cols.length, 0)}>${escape(emptyMessage)}</td></tr>` : `${each(displayed, (row) => {
    return `<tr>${each(cols, (col) => {
      return `<td class="${escape(
        null_to_empty(col.align === "right" ? "ta-r" : col.align === "center" ? "ta-c" : ""),
        true
      ) + " svelte-1nwjvoq"}">${col.kind === "thumbnail" ? `<img class="thumb svelte-1nwjvoq" alt=""${add_attribute("src", imgSrc(valueAt(row, col.accessor)), 0)}>` : `${col.kind === "actions" ? `<div class="actions">${each(col.action || [], (act) => {
        return `<button class="btn sm svelte-1nwjvoq">${escape(act)}</button>`;
      })} </div>` : `${col.primary ? `<button class="linklike svelte-1nwjvoq">${escape(fmt(col, valueAt(row, col.accessor)))} </button>` : `${escape(fmt(col, valueAt(row, col.accessor)))}`}`}`} </td>`;
    })} </tr>`;
  })}`}</tbody></table></div> </div>`;
});

export { ListTable as L };
//# sourceMappingURL=ListTable-CIuW0_LK.js.map
