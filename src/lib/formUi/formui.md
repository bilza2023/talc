
# FormUi — Config-Driven Form Renderer

## Purpose

`FormUi.svelte` is a lightweight component that renders forms from a JSON-like config object. It removes boilerplate: page files only provide **config** + **success handler**. All markup, CSS (using tokens.css), sticky values, messages, and submit button state are handled inside FormUi.&#x20;

---

## Usage

### Import

```svelte
<script>
  import FormUi from '$lib/formUi/FormUi.svelte';
</script>
```

### Basic Example

```svelte
<script>
  const addTcodeConfig = {
    id: 'addTcode',
    title: 'Add Tcode',
    action: '?/addTcode',
    initial: { name: '', description: '', image: '' },
    items: [
      { type: 'text', name: 'name', label: 'Name', required: true },
      { type: 'text', name: 'description', label: 'Description' },
      { type: 'text', name: 'image', label: 'Image URL' }
    ],
    submit: { label: 'Add', disabledWhen: v => !v.name?.trim() },
    clearOnSuccess: true,
    showErrorsList: true
  };

  function handleSuccess(ev) {
    console.log('Success payload:', ev.detail);
  }
</script>

<FormUi config={addTcodeConfig} on:success={handleSuccess}/>
```

---

## Config Schema

Top-level object:

```ts
{
  id: string,                    // unique ID for inputs
  title?: string,                // optional header
  description?: string,          // optional subheader
  action: string,                // required, e.g. "?/addTcode"
  method?: "post" | "get",       // default "post"
  encType?: string,              // for file uploads
  layout?: "stack" | "grid-2",   // default "stack"
  labelPosition?: "top" | "left",// default "top"
  initial?: Record<string, any>, // initial values
  items: FormItem[],             // field definitions
  submit?: {
    label?: string,
    disabledWhen?: (values)=>boolean
  },
  clearOnSuccess?: boolean | (()=>Record<string,any>),
  showErrorsList?: boolean
}
```

---

## FormItem Types

### Text input

```js
{ type:'text', name:'field', label:'Field', placeholder:'...' }
```

### Number input

```js
{ type:'number', name:'count', label:'Count', min:0, step:1 }
```

### Textarea

```js
{ type:'textarea', name:'body', label:'Body', rows:4 }
```

### Select

```js
{
  type:'select', name:'choice', label:'Choice',
  options: () => [{ value:'a', label:'A' }, { value:'b', label:'B' }]
}
```

### Checkbox

```js
{ type:'checkbox', name:'accept', label:'Accept?', placeholder:'Yes' }
```

### Password

```js
{ type:'password', name:'pw', label:'Password' }
```

### File

```js
{ type:'file', name:'avatar', label:'Upload file' }
```

### Hidden

```js
{ type:'hidden', name:'slug', value:'...' }
```

### Note (static text)

```js
{ type:'note', text:'This is a helper note' }
```

### Date (new)

* Renders a native `<input type="date">`.
* Accepts `min`, `max` (ISO `YYYY-MM-DD`) and `step` (days).

```js
{ type:'date', name:'startDate', label:'Start Date', min:'2024-01-01', max:'2030-12-31', step:1, required:true }
```

### Time (new)

* Renders `<input type="time">`.
* Accepts `min`, `max` (e.g. `"09:00"`, `"17:30"`) and `step` (seconds).

```js
{ type:'time', name:'startTime', label:'Start Time', min:'08:00', max:'20:00', step:60 }
```

### Datetime (new)

* Renders `<input type="datetime-local">`.
* Accepts `min`, `max` (e.g. `"2025-09-17T09:00"`) and `step` (seconds).

```js
{ type:'datetime', name:'startsAt', label:'Starts At', min:'2025-01-01T00:00', step:60 }
```

> Notes on date/time fields
>
> * Values post as strings. Normalize in your **formKit** `spec`/`prepare` as needed (e.g., convert to ISO or combine date+time).
> * `initial` should match the input’s expected format (e.g., `YYYY-MM-DD` for `date`, `HH:MM` for `time`, `YYYY-MM-DDTHH:MM` for `datetime`).

---

## Events

* `on:success` → fired when the formKit action resolves successfully. Payload = whatever your server action’s `success` returns.
* `on:failure` → fired when server action fails. Payload = `{ ok:false, message, values, errors? }`.

---

## Styling

* Uses CSS variables from `tokens.css` (loaded in your layout).
* FormUi ships layout + component styles; page files should only style **layout wrappers** (e.g. `.wrap { max-width:… }`).

---

## Philosophy

* **Pages = wiring** (import config + `<FormUi>`).
* **Configs = data** (`$lib/forms/...` holds definitions).
* **FormUi = renderer** (no logic duplicated).

This keeps each page \~10 lines, all forms consistent, and styles centralized.

---

### Tiny example with date+time

```svelte
<script>
  const config = {
    id: 'scheduleJob',
    title: 'Schedule Job',
    action: '?/save',
    initial: { date:'2025-09-17', time:'09:00', note:'' },
    items: [
      { type:'date', name:'date', label:'Date', required:true },
      { type:'time', name:'time', label:'Time', step:60, required:true },
      { type:'textarea', name:'note', label:'Note' }
    ],
    submit: { label:'Save', disabledWhen: v => !v.date || !v.time }
  };
</script>

<FormUi config={config}/>
```

---
