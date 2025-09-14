

# FormUi — Config-Driven Form Renderer

## Purpose

`FormUi.svelte` is a lightweight component that renders forms from a JSON-like config object.
It removes boilerplate: page files only provide **config** + **success handler**.
All markup, CSS (using tokens.css), sticky values, messages, and submit button state are handled inside FormUi.

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
  id: string,                // unique ID for inputs
  title?: string,            // optional header
  description?: string,      // optional subheader
  action: string,            // required, e.g. "?/addTcode"
  method?: "post" | "get",   // default "post"
  encType?: string,          // for file uploads
  layout?: "stack"|"grid-2", // default "stack"
  labelPosition?: "top"|"left", // default "top"
  initial?: Record<string,any>, // initial values
  items: FormItem[],         // field definitions
  submit?: {
    label?: string,
    disabledWhen?: (values)=>boolean
  },
  clearOnSuccess?: boolean | (()=>Record<string,any>),
  showErrorsList?: boolean
}
```

### FormItem Types

* **Text input**

```js
{ type:'text', name:'field', label:'Field', placeholder:'...' }
```

* **Number input**

```js
{ type:'number', name:'count', label:'Count', min:0, step:1 }
```

* **Textarea**

```js
{ type:'textarea', name:'body', label:'Body', rows:4 }
```

* **Select**

```js
{
  type:'select', name:'choice', label:'Choice',
  options: () => [{ value:'a', label:'A' }, { value:'b', label:'B' }]
}
```

* **Checkbox**

```js
{ type:'checkbox', name:'accept', label:'Accept?', placeholder:'Yes' }
```

* **Password**

```js
{ type:'password', name:'pw', label:'Password' }
```

* **File**

```js
{ type:'file', name:'avatar', label:'Upload file' }
```

* **Hidden**

```js
{ type:'hidden', name:'slug', value:'...' }
```

* **Note (static text)**

```js
{ type:'note', text:'This is a helper note' }
```

---

## Events

* `on:success` → fired when the formKit action resolves successfully.
  Payload = whatever your server action’s `success` returns.

* `on:failure` → fired when server action fails.
  Payload = `{ ok:false, message, values, errors? }`.

---

## Styling

* Uses CSS variables from `tokens.css` (loaded in your layout).
* FormUi itself contains layout + component styles.
* Page files should only style **layout wrappers** (e.g. `.wrap { max-width:… }`).

---

## Philosophy

* **Pages = wiring** (import config + `<FormUi>`).
* **Configs = data** (`$lib/forms/…` holds definitions).
* **FormUi = renderer** (no logic duplicated).

This keeps each page \~10 lines, all forms consistent, and styles centralized.

---

Would you like me to also prepare a **starter `$lib/forms/tcode.js`** file with `addTcodeForm`, `editTcodeForm`, `deleteTcodeForm` so you can immediately move configs out of pages?
