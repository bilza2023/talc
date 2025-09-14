# ListTable Lite v1 — Fast, Reusable Data Tables

A tiny, generic Svelte table with **local search**, **local sort**, **row click**, and **action buttons**. No server mode or pagination. Copy, wire, ship.&#x20;

---

## Why this exists

- Standardize **row shape**, **column schema**, **events**.
- Keep lists **payload-light** and client-fast.
- Zero hidden refetch logic. All filtering/sorting is local.&#x20;

---

## Component location

```
/src/lib/listTable/ListTable.svelte
```

Generic. No app imports.&#x20;

---

## Public API

### Props

| Prop            | Type                    |                       Default | Notes                                                                                                                                                                                                        |
| --------------- | ----------------------- | ----------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `items`         | `any[]`                 |                          `[]` | Current page rows only. Normalize before passing.                                                                                                                                                            |
| `columns`       | `Column[]`              |                          `[]` | Declarative schema. `accessor` must exist on every row.                                                                                                                                                      |
| `rowKey`        | `string`                |                        `"id"` | Unique per row (e.g. `"id"` or `"slug"`).                                                                                                                                                                    |
| `searchable`    | `boolean`               |                        `true` | Show/hide the search bar.                                                                                                                                                                                    |
| `searchKeys`    | `string[] \| undefined` |                   `undefined` | **Search scope.** If omitted, the table searches all columns whose `kind` is **`text`** (by their `accessor`). To include non-text columns (e.g. `badge`, `number`, `date`), supply `searchKeys` explicitly. |
| `thumbBaseUrl`  | `string`                |                          `""` | Prefix for filename thumbs. Full URLs or `/absolute` paths are used as-is.                                                                                                                                   |
| `fallbackThumb` | `string`                | `"/media/images/taleem.webp"` | Used when no thumb is present.                                                                                                                                                                               |
| `emptyMessage`  | `string`                |          `"Nothing here yet"` | Shown when filtered list is empty.                                                                                                                                                                           |

### Column schema

```ts
type Column = {
  id: string;
  label: string;
  accessor: string; // e.g. "name"
  kind?: "text" | "badge" | "date" | "thumbnail" | "number" | "actions";
  primary?: boolean;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
  format?: "relative" | "date" | "datetime"; // for kind:'date'
  action?: string[]; // for kind:'actions'
};
```

> Rule: `accessor` must be a real key on your row objects.&#x20;

### Events

- `rowClick` → emits the **row** when the primary cell is clicked.
- `action` → emits `{ actionId, row }` for action buttons.&#x20;

---

## The Row Shape (normalize in your page)

Recommended keys:

```ts
{
  id: string,
  slug: string,
  name: string,            // title/display
  type: string,            // 'note' | 'deck' | ...
  tcode: string,
  chEx: string,            // "Ch 3 · Ex 2" or '—'
  status: string,          // 'draft' | 'ready' | 'published' | 'archived' | '—'
  editedAt: string|Date|null,
  thumbnail?: string
}
```

Keep rows light. Do not include heavy bodies.&#x20;

---

## Search — how it works and how to control it

### Behavior

- **Case-insensitive contains** match on selected fields.
- If you do **not** pass `searchKeys`, the table searches **all columns whose `kind` is `text`** by using their `accessor` names. Columns with other kinds (`badge`, `date`, `number`, `thumbnail`, `actions`) are **not** searched by default.&#x20;
- Non-string values are stringified; provide strings for best results.&#x20;

### Common setups

**A) Title-only search**

```svelte
<ListTable searchable={true} searchKeys={['name']} ... />
```

**B) Multi-column search (title, slug, subject, chapter/ex)**

```svelte
<ListTable searchable={true} searchKeys={['name','slug','tcode','chEx']} ... />
```

**C) Include non-text columns like `status` (badge) and `type`**

```svelte
<ListTable searchable={true} searchKeys={['name','slug','tcode','chEx','status','type']} ... />
```

**D) No search bar**

```svelte
<ListTable searchable={false} ... />
```

**E) Date search tip**
Dates often render as `kind:'date'` and are excluded by default. If you need date text search, add a string field (e.g., `editedAtIso`) during row mapping and include it in `searchKeys`:

```js
// when normalizing rows
editedAtIso: r?.editedAt
  ? new Date(r.editedAt).toISOString().slice(0, 10)
  : "—";
```

```svelte
<ListTable searchable={true} searchKeys={['name','editedAtIso']} ... />
```

**F) Force a column into default search**
Change the column `kind` to `'text'` if you want it included without `searchKeys`:

```js
{ id:'status', label:'Status', accessor:'status', kind:'text' }
```

### Links and Buttons (navigation patterns)

**Row → link (primary click)**

```svelte
<script>
  import { goto } from '$app/navigation';
  function hrefFor(row){
    if (row.type === 'note')  return `/notes?filename=${row.slug}`;
    if (row.type === 'deck')  return `/player?filename=${row.slug}`;
    if (row.type === 'course')return `/syllabus?tcode=${row.slug}`;
    return '';
  }
  function handleRowClick(e){
    const row = e.detail;
    const href = hrefFor(row);
    if (href) goto(href);
  }
</script>

<ListTable on:rowClick={handleRowClick} ... />
```

**Single button per row**

```svelte
const columns = [
  /* …other cols… */
  { id:'act', label:'', accessor:'__', kind:'actions', action:['chapters'], align:'right', width:'120px' }
];

function handleAction(e){
  const { actionId, row } = e.detail;
  if (actionId === 'chapters') goto(`/admin/syllabus/chapters?slug=${row.slug}`);
}
```

**Multiple buttons per row**

```svelte
{ id:'act', label:'', accessor:'__', kind:'actions', action:['preview','edit','delete'] }
function handleAction(e){
  const { actionId, row } = e.detail;
  if (actionId === 'preview') goto(`/player?filename=${row.slug}`);
  else if (actionId === 'edit') goto(`/admin/${row.type}/edit?slug=${row.slug}`);
  else if (actionId === 'delete') console.log('delete', row.slug);
}
```

**Disable row click**

- Omit `on:rowClick`, or bind a no-op: `function handleRowClick(_) {}`.

**External link**

```svelte
function handleRowClick(e){
  const url = computeExternalUrl(e.detail); // e.g., row.sourceUrl
  if (url) window.open(url, '_blank', 'noopener');
}
```

**Notes**

- Buttons come from a column with `kind:'actions'` and `action:['id', …]`. Handle them in `on:action`.&#x20;
- Row clicks emit the full row; you decide navigation.&#x20;

### Quick diagnosis

- “Search only matches the title” → You omitted `searchKeys` and only the `name` column is `kind:'text'`. Add `searchKeys` or set more columns to `kind:'text'`.
- “Searching ‘published’ finds nothing” → `status` is `kind:'badge'`. Add `'status'` to `searchKeys` (or switch to `kind:'text'`).
- “Searching dates doesn’t work” → Add a string field like `editedAtIso` and include it in `searchKeys`.&#x20;

---

## Sort

Single-column local sort. Enable per column with `sortable:true`. Date columns respect `format`.&#x20;

---

## Quick Start

Loader + page wiring example is unchanged; see sample in this doc for questions list, including actions and navigation.&#x20;

---

## Troubleshooting

- Undefined cells → accessor mismatch.
- Empty table → bad/duplicate `rowKey`.
- Search “not working” → `searchKeys` missing the fields you expect or values not strings.
- Clicks do nothing → you didn’t bind `on:rowClick` / `on:action`.
- Thumbs missing → set `thumbBaseUrl` for filenames.&#x20;

---

## Done definition

- Title shows.
- Primary click navigates.
- Actions emit and post.
- Search filters as designed.
- Sort toggles on declared columns.
- No console errors.&#x20;

---
