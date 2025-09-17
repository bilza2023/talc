# FormUi + FormKit — Submit & Date Input Quick Guide

This is a concise, **battle‑tested** reference for wiring FormUi (client) to SvelteKit actions (server via FormKit) without surprises.

---

## Postmortem (what went wrong today)

1. **Wrong `action` target**
   We posted to the page itself (`/ore/deposit`) instead of a SvelteKit action endpoint. In SvelteKit, **page actions** are addressed with a query‑style suffix: `'?/actionName'`.
   **Fix:** `action: '?/deposit'` and ensure `+page.server.js` exports `actions.deposit`.

2. **Button stuck disabled**
   FormUi evaluates `submit.disabledWhen(formValues)` *and* basic `required` flags. Our condition wasn’t returning `false` when filled.
   **Debug Fix:** force‑enable during triage: `disabledWhen: () => false`.
   **Proper Fix:** `disabledWhen: (v) => !(v.stationCode && v.gradeCode && Number(v.createdTon) > 0)`.

3. **Date input lost its calendar**
   We swapped `{ type:'date' }` to a plain text field while debugging.
   **Fix:** keep `{ type:'date', name:'depositedAt' }` to preserve native calendar picker.

4. **Method shape**
   FormUi expects lowercase: `method: 'post'`.
   **Fix:** use `'post'` (not `'POST'`).

5. **No visible result**
   There were no handlers logging success/failure.
   **Fix:** add `on:success` / `on:failure` and `console.log(ev.detail)`.

---

## The contract (client ↔ server)

### Client (FormUi config)

```js
const config = {
  id: 'myForm',
  title: 'My Form',
  action: '?/doThing',     // ← MUST be '?/actionName'
  method: 'post',          // ← lowercase
  initial: { /* flat object of defaults */ },
  items: [ /* see types below */ ],
  submit: {
    label: 'Save',
    // Return true to disable the button. Keep simple, pure, synchronous.
    disabledWhen: (v) => false
  },
  clearOnSuccess: (v) => ({ /* return new initial */ }),
  showErrorsList: true
};
```

**Events emitted by `<FormUi>`**

* `success` → `ev.detail` carries server payload (e.g., `{ success:true, ... }`).
* `failure` → `ev.detail` carries `{ success:false, errors }` or error shape.

### Server (`+page.server.js`)

```js
// Minimal SvelteKit action contract
export const actions = {
  doThing: async ({ request /*, locals */ }) => {
    const formData = await request.formData();
    // NOTE: numbers arrive as strings → parse as needed
    const createdTon = parseFloat(formData.get('createdTon') || '0');
    const gradeCode  = String(formData.get('gradeCode') || '');

    // Validate & perform work...
    if (!gradeCode || !(createdTon > 0)) {
      return { success: false, errors: { gradeCode: 'Required', createdTon: 'Must be > 0' } };
    }

    // Return your success payload
    return { success: true, message: 'Saved', id: 123 };
  }
};
```

> **Shape note:** FormUi doesn’t require a specific shape beyond reading `success` boolean for routing errors to `on:failure`. Keep it `{ success: true|false, ... }`.

---

## Supported item types (quick reference)

* `text` — `{ type:'text', name, label, placeholder, required }`
* `number` — `{ type:'number', name, label, min, max, step, required }`
* `select` — `{ type:'select', name, label, required, options }`

  * `options` can be an **array** `[ { value, label } ]` or a **function** `() => [...]` (computed at render).
* `hidden` — `{ type:'hidden', name, value }`
* `date` — `{ type:'date', name, label }` (native calendar)
* `time` — `{ type:'time', name, label }`
* `datetime-local` — `{ type:'datetime-local', name, label }`
* `textarea` — `{ type:'textarea', name, label, rows }`
* `file` — `{ type:'file', name, label, accept }` (ensure `enctype: 'multipart/form-data'` if used; FormUi supports `config.enctype`).

> **Numbers arrive as strings.** Parse on the server with `parseFloat`/`parseInt`.

---

## Button logic (how enabling/disabled works)

FormUi computes:

1. **Requireds:** if any `required:true` field is empty → button disabled.
2. **Custom rule:** `submit.disabledWhen(values)` → if returns `true` → disabled.

**Debugging trick:**

```js
submit: { label: 'Save', disabledWhen: () => false }
```

If the button then enables, your previous rule or `required` fields were the blocker.

---

## Troubleshooting checklist (fast)

* ✅ `action` is `'?/name'` and there is `export const actions = { name: ... }` in `+page.server.js`.
* ✅ `method: 'post'` (lowercase).
* ✅ At least one **submit handler** attached: `on:success`, `on:failure` and logging `ev.detail`.
* ✅ `required:true` only where truly needed. For numbers, ensure they’re > 0 when your rule checks.
* ✅ If stuck, drop to `disabledWhen: () => false` to confirm wiring is fine.
* ✅ For date pickers, keep `{ type: 'date' }` (don’t swap to `text`).
* ✅ Select `options` array shape is `{ value, label }` and values are strings.
* ✅ Hidden fields (e.g., `stationCode`) have a concrete `value`.
* ✅ If uploading files, set `config.enctype = 'multipart/form-data'`.

---

## Example: Ore Deposit (final wiring)

```js
const config = {
  id: 'oreDepositForm',
  title: `Deposit Ore — ${stationCode}`,
  action: '?/deposit',
  method: 'post',
  initial: { stationCode, gradeCode:'', createdTon:'', supplierId:'', amount:'', depositedAt:'' },
  items: [
    { type:'hidden', name:'stationCode', value: stationCode },
    { type:'select', name:'gradeCode', label:'Grade', required:true,
      options: () => (grades ?? []).map(g => ({ value:g, label:g })) },
    { type:'number', name:'createdTon', label:'Tons', required:true, min:0.001, step:0.001 },
    { type:'select', name:'supplierId', label:'Supplier',
      options: () => (suppliers ?? []).map(s => ({ value:String(s.id), label:s.name || `#${s.id}` })) },
    { type:'number', name:'amount', label:'Amount (PKR)', min:1, step:1 },
    { type:'date',   name:'depositedAt', label:'Deposit Date' }
  ],
  submit: {
    label: 'Deposit',
    disabledWhen: (v) => !(v.stationCode && v.gradeCode && Number(v.createdTon) > 0)
  },
  showErrorsList: true,
  clearOnSuccess: () => ({ stationCode, gradeCode:'', createdTon:'', supplierId:'', amount:'', depositedAt:'' })
};
```

**Client hooks**

```js
function handleSuccess(ev){ console.log('[deposit] SUCCESS', ev.detail); }
function handleFailure(ev){ console.log('[deposit] FAILURE', ev.detail); }
```

---

## “Important points” to append to docs

* Always prefer `'?/actionName'` (never bare `'actionName'` or absolute paths) for page actions.
* Keep `method: 'post'` (lowercase).
* For quick diagnosis, set `disabledWhen: () => false` and add `on:success`/`on:failure` logs.
* Numbers come in as strings; always parse on the server.
* Use native date/time types (`date`, `time`, `datetime-local`) when you want OS pickers.
* `select.options` may be a function to capture latest data; return `{ value, label }`.
* Keep page files tiny: **import config, render `<FormUi>`**. Move reusable configs to `$lib/forms/` when stable.
* Return `{ success: true|false, ... }` from actions; FormUi routes to the right handler automatically.

---

### Done. This should prevent the “button won’t click” class of bugs and preserve the calendar input behavior going forward.

---

## Clarification: Action target mapping (`action` → `actions.*`)

Use the query‑style suffix to select a **named page action** precisely:

* `action: '?/deposit'` → `+page.server.js` must export `export const actions = { deposit: async (event) => { … } }`.
* `action: '?/default'` (rare) → maps to `actions.default`.
* Posting to the bare page URL (e.g., `/ore/deposit` without `?/*`) only reaches `actions.default`. If you don’t have it, **nothing handles the submit**. That’s the root cause of “click does nothing.”

No full page reload occurs because the client is enhanced (see below). The action returns `{ success: true|false, … }`, and the client shows a flash bar + field errors inline.

---

## Enhance, same‑page flow, and flash handlers (drop‑in block)

`<FormUi>` already wires a progressive‑enhancement flow similar to SvelteKit’s `use:enhance`: it intercepts submit, performs a `fetch`, and keeps you on the **same page**, calling `on:success`/`on:failure` with the server response. You **do not** add `use:enhance` in your page when you use `<FormUi>`; if you used a plain HTML `<form>`, that’s when you’d add `use:enhance` yourself.

Here’s the standard flash pattern we’ll reuse across forms:

```svelte
<script>
  import FormUi from '$lib/formUi/FormUi.svelte';

  export let data;
  const { stationCode, suppliers = [], grades = [] } = data;

  let flash = { type: '', message: '' };

  const config = {
    id: 'oreDepositForm',
    title: `Deposit Ore — ${stationCode}`,
    action: '?/deposit',
    method: 'post',
    initial: { stationCode, gradeCode:'', createdTon:'', supplierId:'', amount:'', depositedAt:'' },
    items: [
      { type:'hidden', name:'stationCode', value: stationCode },
      { type:'select', name:'gradeCode', label:'Grade', required:true,
        options: () => (grades ?? []).map(g => ({ value:g, label:g })) },
      { type:'number', name:'createdTon', label:'Tons', required:true, min:0.001, step:0.001 },
      { type:'select', name:'supplierId', label:'Supplier',
        options: () => (suppliers ?? []).map(s => ({ value:String(s.id), label:s.name || `#${s.id}` })) },
      { type:'number', name:'amount', label:'Amount (PKR)', min:1, step:1 },
      { type:'date',   name:'depositedAt', label:'Deposit Date' }
    ],
    submit: { label: 'Deposit', disabledWhen: (v) => !(v.stationCode && v.gradeCode && Number(v.createdTon) > 0) },
    showErrorsList: true,
    clearOnSuccess: () => ({ stationCode, gradeCode:'', createdTon:'', supplierId:'', amount:'', depositedAt:'' })
  };

  function handleSuccess(ev) {
    // ev.detail is your success payload from the action
    flash = { type: 'success', message: ev?.detail?.message ?? 'Saved!' };
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleFailure(ev) {
    // ev.detail may include { errors } which FormUi renders field‑level
    flash = { type: 'error', message: ev?.detail?.message ?? 'Could not save.' };
    scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

{#if flash.message}
  <div class="flash {flash.type}">{flash.message}</div>
{/if}

<FormUi {config} on:success={handleSuccess} on:failure={handleFailure} />

<style>
  .flash { padding: .75rem 1rem; border-radius: .5rem; margin:.5rem 0; }
  .flash.success { background: var(--green-9, #0a0); color: white; }
  .flash.error { background: var(--red-9, #a00); color: white; }
</style>
```

**Key points:**

* Form stays on **the same page** for both success and failure; only a redirect from the server would navigate away.
* Field‑level errors come from `ev.detail.errors` and are rendered automatically since `showErrorsList: true`.
* The flash bar is our minimal default; replace with your toast/snackbar if needed.
