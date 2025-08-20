# How to Process Forms in Svelte (AB-Project style)

> **Goal**: Add forms like LEGO bricks — submit, validate, show errors **on the same page**, and redirect on success — with minimal wiring.

This guide documents the pattern we now use across the app (stations, dispatch, unload, etc.). It’s based on the working files in this repo and uses **SvelteKit actions + `use:enhance`**.

---

## Core Principles

1. **Always use `use:enhance`**  
   Submissions are intercepted on the client, so we stay on the same page on error (no route bounce).

2. **Return `fail(400, { message, values })` on validation/domain errors**  
   The action returns a `form`-shaped object. We render `form.message` and re-fill inputs from `form.values` (sticky values).

3. **Redirect on success**  
   When the action succeeds, `throw redirect(303, "/target")`. The client calls `update()` to follow it.

4. **Four-part LEGO architecture**  
   - **Page:** `+page.svelte` — hosts the form component and passes `form` down.  
   - **Component:** `FormX.svelte` — fields + `use:enhance` + inline error banner.  
   - **Server:** `+page.server.js` — named action: validate → call service → `fail` or `redirect`.  
   - **Service:** Business logic & DB; throws domain errors (e.g., `INSUFFICIENT_STOCK`).

---

## File Structure (example)

```
src/
  lib/
    components/
      DispatchOre.svelte
  routes/
    stations/
      +page.server.js           # central actions (deposit, dispatch, unload)
    stations/jss/ore_dispatch/
      +page.svelte              # renders the form component
```

---

## Component Pattern (`use:enhance` + inline error)

**Key idea**: Capture action failures in the component, display `message`, and keep inputs sticky.

```svelte
<!-- src/lib/components/DispatchOre.svelte -->
<script>
  import { enhance } from '$app/forms';

  export let form = null;
  export let stationCode = 'JSS';
  export let stations = ['JSS', 'PSS', 'KEF'];
  export let grades = ['WL', 'WC', 'WF', 'GL', 'GC', 'GF'];

  let localForm = form;

  $: destinationOptions = stations.filter((s) => s !== stationCode);
  const v = (k, d = '') => localForm?.values?.[k] ?? d;

  const onEnhance = () => {
    return async ({ result, update }) => {
      if (result.type === 'failure') {
        localForm = result.data;   // { message, values }
        return;
      }
      await update();               // follow redirect on success
    };
  };
</script>

{#if localForm?.message}
  <div role="alert" class="mb-3 rounded-lg border border-red-600/40 bg-red-900/30 px-3 py-2 text-red-200">
    {localForm.message}
  </div>
{/if}

<form method="post" action="/stations?/dispatch" use:enhance={onEnhance} class="space-y-4">
  <input type="hidden" name="fromStation" value={stationCode} />

  <label class="flex flex-col gap-1">
    <span class="text-sm text-slate-400">To Station</span>
    <select name="toStation" required class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none focus:border-slate-600 focus:ring-2 focus:ring-sky-400">
      <option value="">-- Select destination --</option>
      {#each destinationOptions as s}
        <option value={s} selected={v('toStation') === s}>{s}</option>
      {/each}
    </select>
  </label>

  <label class="flex flex-col gap-1">
    <span class="text-sm text-slate-400">Truck No</span>
    <input name="truckNo" type="text" required class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none placeholder-slate-500 focus:border-slate-600 focus:ring-2 focus:ring-sky-400" placeholder="e.g. LES-1234" value={v('truckNo')} />
  </label>

  <label class="flex flex-col gap-1">
    <span class="text-sm text-slate-400">Weight (tons)</span>
    <input name="weightTon" type="number" min="0.001" step="0.001" required class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none placeholder-slate-500 focus:border-slate-600 focus:ring-2 focus:ring-sky-400" placeholder="e.g. 20" value={v('weightTon')} />
  </label>

  <label class="flex flex-col gap-1">
    <span class="text-sm text-slate-400">Grade (optional)</span>
    <select name="gradeCode" class="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 outline-none focus:border-slate-600 focus:ring-2 focus:ring-sky-400">
      <option value="" selected={!v('gradeCode')}>-- Optional --</option>
      {#each grades as g}
        <option value={g} selected={v('gradeCode') === g}>{g}</option>
      {/each}
    </select>
  </label>

  <div class="flex justify-end pt-2">
    <button type="submit" class="inline-flex items-center rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-900 shadow hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400">
      Dispatch
    </button>
  </div>
</form>
```

### Why this works
- `use:enhance` prevents full page reloads.  
- On `fail(400, { message, values })`, we set `localForm` and render the banner.  
- Inputs read from `localForm.values` so they stay filled.  
- On success, `update()` follows the server `redirect(303, ...)` automatically.

---

## Page Pattern (host + pass `form`)

Keep the page simple: accept `form` (if the route’s action lives here or we pre-render something) and pass it down.

```svelte
<!-- src/routes/stations/jss/ore_dispatch/+page.svelte -->
<script>
  import DispatchOre from '$lib/components/DispatchOre.svelte';
  export let form;
</script>

<div class="px-4 py-6">
  <div class="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow">
    <h1 class="mb-4 text-2xl font-bold text-slate-100">Dispatch Ore — JSS</h1>
    <DispatchOre stationCode="JSS" {form} />
  </div>
</div>
```

> Note: Because we’re posting to `/stations?/dispatch` (central actions), the page won’t auto-receive `form`. That’s why the component captures it in the `onEnhance` callback, and keeps its own `localForm`.

---

## Server Action Pattern (validate → call service → `fail` or `redirect`)

Example central action (live in `src/routes/stations/+page.server.js`).

```js
import { fail, redirect } from '@sveltejs/kit';
import createOreService from '/services/oreService.js';

const ore = createOreService();

export const actions = {
  async dispatch({ request }) {
    const fd = await request.formData();
    const fromStation = String(fd.get('fromStation') || '').toUpperCase();
    const toStation   = String(fd.get('toStation') || '').toUpperCase();
    const truckNo     = String(fd.get('truckNo') || '').trim();
    const weightTon   = Number(fd.get('weightTon') || 0);
    const gradeCode   = (fd.get('gradeCode') || '').toString().toUpperCase() || null;

    const values = { fromStation, toStation, truckNo, weightTon, gradeCode };

    if (!fromStation || !toStation || !truckNo || !weightTon) {
      return fail(400, { message: 'fromStation, toStation, truckNo, weightTon required', values });
    }
    if (fromStation === toStation) {
      return fail(400, { message: 'fromStation and toStation cannot be the same', values });
    }
    if (!(weightTon > 0)) {
      return fail(400, { message: 'weightTon must be > 0', values });
    }

    try {
      await ore.dispatch(values); // may throw INSUFFICIENT_STOCK
      throw redirect(303, `/stations/${fromStation.toLowerCase()}`);
    } catch (e) {
      if (e?.code === 'INSUFFICIENT_STOCK') {
        return fail(400, { message: e.message, values });
      }
      if (e?.code === 'P2025') {
        return fail(404, { message: 'Record not found', values });
      }
      return fail(400, { message: e?.message || 'Dispatch failed', values });
    }
  }
};
```

### Service contract
- Services throw **domain errors** with a `.code` when business rules fail (e.g., `INSUFFICIENT_STOCK`).  
- Actions catch them and convert to `fail(400, { message, values })` so the UI can render cleanly.  
- Any success flow **must redirect** (never silently return JSON from actions).

---

## Boilerplate: “LEGO Form” template

Use this to create new forms quickly. Replace `myAction` and fields.

**Component**

```svelte
<script>
  import { enhance } from '$app/forms';
  export let form = null;

  let localForm = form;
  const v = (k, d = '') => localForm?.values?.[k] ?? d;

  const onEnhance = () => {
    return async ({ result, update }) => {
      if (result.type === 'failure') {
        localForm = result.data;
        return;
      }
      await update();
    };
  };
</script>

{#if localForm?.message}
  <div role="alert" class="mb-3 rounded-lg border border-red-600/40 bg-red-900/30 px-3 py-2 text-red-200">
    {localForm.message}
  </div>
{/if}

<form method="post" action="/path?/myAction" use:enhance={onEnhance} class="space-y-4">
  <!-- inputs -->
  <button type="submit" class="inline-flex items-center rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-900">Submit</button>
</form>
```

**Page**

```svelte
<script>
  import MyForm from '$lib/components/MyForm.svelte';
  export let form;
</script>

<MyForm {form} />
```

**Server action**

```js
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  async myAction({ request }) {
    const fd = await request.formData();
    // extract fields...
    const values = { /* parsed fields */ };

    // validations...
    // if invalid:
    // return fail(400, { message: 'Explain error', values });

    // call service...
    // await service.doSomething(values);

    throw redirect(303, '/next/page');
  }
};
```

---

## UI & Accessibility Notes

- Always render a visible label or descriptive text per input.  
- Keep units in headers: e.g., `Weight (tons)`.  
- Avoid HTML comments inside markup that might break builds.  
- Use high-contrast colors on dark backgrounds (`bg-slate-900/950`, `text-slate-100`).  
- Prefer real `<th scope="col|row">` in tables; add a visually hidden `<caption>` for screen readers.

---

## Troubleshooting

- **Nothing happens on submit**  
  Ensure `use:enhance={onEnhance}` returns a function receiving `{ result, update }`. Don’t read `result` in the outer call.

- **Error not shown**  
  Action must `return fail(400, { message, values })`. In the component, render `localForm?.message` and use sticky values.

- **“Missing +page.svelte for /route”**  
  Happens when posting to a route without a page while not using `use:enhance`. With enhance + local capture, you don’t need a catch-all page.

- **500 error**  
  Your action threw and didn’t catch. Wrap service calls in `try/catch` and convert to `fail(...)` with a friendly message.

---

## Quick Checklist (copy/paste)

- [ ] Component uses `use:enhance` and captures failures to `localForm`.  
- [ ] Error banner renders from `localForm.message`.  
- [ ] Inputs are sticky via `v('field')`.  
- [ ] Server action validates and returns `fail(400, { message, values })` on error.  
- [ ] Server action redirects on success.  
- [ ] Service throws domain errors with `.code` (e.g., `INSUFFICIENT_STOCK`) and the action maps them to `fail(400, ...)`.

Happy building — forms are LEGO now.