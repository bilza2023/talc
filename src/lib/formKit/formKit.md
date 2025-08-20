# formKit — Final Documentation (v1)

> A tiny, reusable bridge between SvelteKit forms and your domain services. Parse fields, validate, call a service, and return enhance‑friendly results — with almost no boilerplate.

---

## Contents

* `00-Overview.md`
* `01-Installation.md`
* `02-Core-Concepts.md`
* `03-API.md`
* `04-Server-Actions.md`
* `05-Client-Forms.md`
* `06-Patterns-and-Recipes.md`
* `07-Error-Handling.md`
* `08-Testing.md`
* `09-Migration-Guide.md`
* `10-Checklist.md`

---

## 00-Overview\.md

**formKit** is a micro‑framework for SvelteKit actions. It standardizes the boring parts of form handling:

1. **Read & normalize fields** from `FormData` (trim, uppercase, numbers).
2. **Validate** values (required, positive, enums, custom rules).
3. **Call a service** (your pure business logic, framework‑independent).
4. **Return consistent results** to the client (`use:enhance` happy path).
5. **Map errors** (your domain codes + Prisma codes) to friendly payloads.

**Why:** faster forms, fewer mistakes, easier tests.

**Design goals:**

* Tiny: a handful of helpers; no magic.
* Predictable: one response shape across all actions.
* Portable: services stay pure (no SvelteKit types leak in).
* Enhance‑first: no forced redirects; client can decide.

---

## 01-Installation.md

**File layout (suggested):**

```
src/
  lib/
    formKit/
      readers.js
      errors.js
      actionFactory.js
      enhance.js            # optional client helper
```

**Imports:**

```js
import { R } from '$lib/formKit/readers.js';
import { makeAction } from '$lib/formKit/actionFactory.js';
```

No external dependencies beyond SvelteKit itself.

---

## 02-Core-Concepts.md

* **Reader**: a function that pulls and normalizes one field from `FormData` (`R.str`, `R.intId`, `R.num`, `R.$enum`).
* **Spec**: an object mapping field names to readers. `parse(fd, spec)` returns `{ values, errors }`.
* **Action**: created via `makeAction({ spec, prepare, service, success })`.

  * **spec**: field rules.
  * **prepare** *(optional)*: cross‑field logic, value shaping, or removing UI‑only fields.
  * **service**: async function that performs domain work (DB, side‑effects).
  * **success** *(optional)*: derive extra fields for the client (`{ station, id }`).
* **Error mapping**: `mapActionError(e, values)` converts thrown errors to a standard failure payload.
* **Enhance**: client‑side handler to process success/failure without reloading.

---

## 03-API.md

### Readers (`R`)

```js
R.str(name, { trim=true, upper=false, required=false })
```

* Reads a string. Trims, optional uppercase, optional required.

```js
R.intId(name, { required=false })
```

* Positive integer IDs only. Returns `0` if not required and blank.

```js
R.num(name, { required=false, gt=null, gte=null })
```

* Parses a number. Optional `> x` or `≥ x` constraints.

```js
R.$enum(name, allowedArray, { required=false, upper=false })
```

* Validates against an allowed set. Optional uppercase.

```js
parse(fd, spec) => { values, errors }
```

* Runs each reader; collects first‑class `values` and an array of error messages.

### Error mapping

```js
mapActionError(e, values)
```

* Converts domain/prisma errors to `fail(status, { ok:false, code?, message, values })`.
* Extend with your own codes (`e.code = 'YOUR_CODE'`).

### Action factory

```js
makeAction({ spec, prepare?, service, success? })
```

* Returns an SvelteKit action handler: `async ({ request }) => Response`.
* Flow: `FormData` → `parse` → `prepare` → `service` → `{ ok:true, saved, ... }` or `fail(400, {...})`.

### Optional client helper

```js
formEnhance({ onSuccess?, onFail? })
```

* Wraps `$app/forms` `enhance` with consistent UI hooks.

---

## 04-Server-Actions.md

**Example: Deposit**

```js
// src/routes/stations/+page.server.js
import createOreService from '$lib/services/oreService.js';
import { R } from '$lib/formKit/readers.js';
import { makeAction } from '$lib/formKit/actionFactory.js';

const ore = createOreService();

export const actions = {
  deposit: makeAction({
    spec: {
      stationCode: R.str('stationCode', { upper: true, required: true }),
      supplierId:  R.intId('supplierId', { required: true }),
      truckNo:     R.str('truckNo',     { trim: true, required: true }), // UI only
      weightTon:   R.num('weightTon',   { required: true, gt: 0 }),
      gradeCode:   R.str('gradeCode',   { upper: true, required: true })
    },
    prepare: (v) => ({ stationCode: v.stationCode, supplierId: v.supplierId, weightTon: v.weightTon, gradeCode: v.gradeCode }),
    service: (v) => ore.deposit(v),
    success: (_result, v) => ({ station: v.stationCode })
  })
};
```

**Example: Dispatch**

```js
export const actions = {
  dispatch: makeAction({
    spec: {
      fromStation: R.str('fromStation', { upper: true, required: true }),
      toStation:   R.str('toStation',   { upper: true, required: true }),
      truckNo:     R.str('truckNo',     { trim: true, required: true }),
      weightTon:   R.num('weightTon',   { required: true, gt: 0 }),
      gradeCode:   R.str('gradeCode',   { upper: true }) // optional
    },
    prepare: (v) => {
      if (v.fromStation === v.toStation) {
        const err = new Error('fromStation and toStation cannot be the same');
        err.code = 'VALIDATION';
        throw err;
      }
      return v;
    },
    service: (v) => ore.dispatch(v),
    success: (_r, v) => ({ routeFrom: v.fromStation, routeTo: v.toStation })
  })
};
```

**Notes**

* Actions return `{ ok:true, ... }` on success; **no redirect required**. Your client can navigate or revalidate.
* On validation errors, `makeAction` returns `fail(400, { ok:false, message, errors, values })`.

---

## 05-Client-Forms.md

**Component pattern (enhance‑friendly + sticky values)**

```svelte
<script>
  import { enhance } from '$app/forms';
  export let form = null;         // initial form
  export let stationCode = 'JSS'; // page/context props

  let localForm = form;
  const v = (k, d='') => localForm?.values?.[k] ?? d;

  const onEnhance = () => ({ result }) => {
    if (result.type === 'failure') {
      localForm = result.data;    // { ok:false, message, values }
      return;
    }
    if (result.type === 'success') {
      // result.data => { ok:true, saved, ...extra }
      // UI: toast, invalidate, soft‑navigate
    }
  };
</script>

{#if localForm?.message}
  <div role="alert" class="mb-3 rounded-lg border border-red-600/40 bg-red-900/30 px-3 py-2 text-red-200">
    {localForm.message}
  </div>
{/if}

<form method="post" action="/stations?/_action=deposit" use:enhance={onEnhance} class="space-y-4">
  <input type="hidden" name="stationCode" value={stationCode} />
  <!-- other fields; use v('field') for sticky values -->
  <button type="submit" class="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-900">Save</button>
</form>
```

**Alternative:** use a shared `formEnhance({ onSuccess, onFail })` wrapper to centralize UI behaviors.

---

## 06-Patterns-and-Recipes.md

### A) Field‑level error display

* `makeAction` returns the first error as `message` and full list in `errors`.
* Optionally map specific messages to fields in the component for inline hints.

### B) Optional vs required enums

* Use `R.$enum('gradeCode', ['WL','WC','WF','GL','GC','GF'], { required:false, upper:true })`.

### C) Stripping UI‑only fields

* Do it in `prepare` (e.g., `truckNo` kept for display but not stored).

### D) Post‑save navigation

* On success, either `goto(...)`, `invalidateAll()`, or update local state; no server redirect needed.

### E) Multi‑form pages

* Use separate actions (`actions: { a: makeAction(...), b: makeAction(...) }`).
* For each form element, set `action="?/_action=a"` or use `name="/path?_action=a"`.

### F) File uploads

* Readers ignore `File`; read it manually in `prepare` if needed and pass to the service.

### G) Server redirects (optional)

* If you *do* want server‑side redirects, keep them **outside** `try/catch` or re‑throw redirect objects.

---

## 07-Error-Handling.md

* **Domain errors**: throw `{ code: 'INSUFFICIENT_STOCK', message: '...' }`; mapper converts to 400 with `code`.
* **Prisma**: common codes handled (`P2025`, `P2003`). Add more as needed.
* **Validation**: readers produce friendly messages; the first becomes `message`.
* **Logging**: unknown errors log on server via `console.error` in the mapper.

---

## 08-Testing.md

**Unit‑test readers**

* Call readers with fake `FormData` and assert `['OK', value]` or `['ERR', message]`.

**Unit‑test actions** (no SvelteKit needed)

* Call the function returned by `makeAction` with `{ request: { formData: async () => FD } }`.
* Mock `service` to confirm values and error paths.

**Service tests**

* Keep services pure and test against a test DB. The action layer stays thin.

---

## 09-Migration-Guide.md

From an older pattern (manual parsing + `throw redirect`) to formKit:

1. Move field parsing into a **spec** using `R.*` readers.
2. Lift cross‑field checks into **prepare**.
3. Call your existing **service** unchanged.
4. Stop throwing redirects; **return `{ ok:true }`** on success. Let the client navigate.
5. Update the component to use `use:enhance` and display `result.data`.

**Tip:** You can migrate route‑by‑route. formKit works alongside legacy actions.

---

## 10-Checklist.md

* [ ] Define a `spec` for each form with `R.*` readers.
* [ ] Add (optional) `prepare` for cross‑field logic.
* [ ] Call a **pure service** from the action.
* [ ] Return `{ ok:true, saved, ... }` on success.
* [ ] On failure, ensure `fail(400, { ok:false, message, values })`.
* [ ] Component uses `use:enhance` and shows `message`; inputs read sticky `values`.
* [ ] Tests cover readers, action success/failure, and service rules.

---

**End of formKit v1. This document is final and canonical.**
