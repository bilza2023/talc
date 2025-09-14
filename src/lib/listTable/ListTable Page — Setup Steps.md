# ListTable Page — Setup Steps

## Scope

Turn any route into a ListTable view using the template.

## Steps

1. **Remove demo data**

   * Delete the hard-coded `items` array from the template.

2. **Adapt loader data → `items`**

   * If loader returns `items`:

     ```svelte
     export let data;
     const items = data.items ?? [];
     ```
   * If loader returns something else (e.g., `tcodes`), map it:

     ```svelte
     export let data;
     const items = (data.tcodes ?? []).map(x => ({
       id: x.id,
       slug: x.slug,
       name: x.name,
       thumbnail: x.image || '',
       chapterCount: x.chapterCount ?? 0,
       editedAt: x.updatedAt || null
     }));
     ```

3. **Define `columns` for your item shape**

   * Accessors must exist on `items`.
   * Use correct kinds: `text | badge | number | date | thumbnail | actions`.
   * Example:

     ```svelte
     const columns = [
       { id:'thumb',  label:'',         accessor:'thumbnail',    kind:'thumbnail', width:'64px' },
       { id:'name',   label:'Title',    accessor:'name',         kind:'text', primary:true, sortable:true },
       { id:'slug',   label:'Slug',     accessor:'slug',         kind:'text', sortable:true },
       { id:'chap',   label:'Chapters', accessor:'chapterCount', kind:'number', sortable:true, align:'right', width:'96px' }
     ];
     ```

4. **Set search and identity**

   * Strings only in `searchKeys`.
   * `rowKey` must be unique.

     ```svelte
     const searchKeys = ['name','slug']; // add more string fields if needed
     // <ListTable … rowKey="slug" searchable={true} searchKeys={searchKeys} />
     ```

## Optional

5. **Actions and navigation**

   * Add actions column only if you handle events.
   * Handlers:

     ```svelte
     import { goto } from '$app/navigation';
     function handleRowClick(e){ const r=e.detail; /* goto(...) or ignore */ }
     function handleAction(e){ const {actionId,row}=e.detail; /* handle */ }
     ```
   * Attach:

     ```svelte
     <ListTable on:rowClick={handleRowClick} on:action={handleAction} />
     ```

6. **Thumbnails**

   * If filenames, set `thumbBaseUrl="/media/images"`; if full URLs, leave empty.

7. **Dates and numbers**

   * `date` expects ISO strings. Remove date column if absent.
   * `number` must be a number, not a string.

8. **Badges**

   * Use for enum-like strings (`status`, `type`). Don’t use on free text.

## Checklist

* `items` defined once.
* `columns` accessors match `items`.
* `searchKeys` are valid string fields.
* `rowKey` is unique (`slug` or `id`).
* No leftover demo data or debug UI.
