
<script>
  import { enhance } from '$app/forms';
  import { createEventDispatcher } from 'svelte';

  // Public API: <FormUi {config} />
  export let config = {
    id: 'form',
    title: '',
    description: '',
    action: '',
    method: 'post',
    encType: undefined,
    layout: 'stack',          // 'stack' | 'grid-2'
    labelPosition: 'top',     // 'top' | 'left'
    initial: {},
    items: [],                // [{ type, name, label, ... }]
    submit: { label: 'Save', disabledWhen: null },
    clearOnSuccess: false,    // true | function() => initialValues
    showErrorsList: false
  };

  const dispatch = createEventDispatcher();

  // Local state
  let values = { ...(config.initial || {}) };
  let isSubmitting = false;
  let serverMessage = '';
  let serverErrors = [];

  // Helpers
  const fid = (n) => `${config.id || 'form'}__${n}`;
  const isDisabled = () => {
    try {
      return !!(config.submit?.disabledWhen && config.submit.disabledWhen(values));
    } catch {
      return false;
    }
  };
  const optsOf = (item) => {
    const raw = typeof item.options === 'function' ? item.options() : (item.options || []);
    return Array.isArray(raw) ? raw : [];
  };
  const val = (name, def = '') => (values[name] ?? def);

  function update(e, item) {
    const t = e?.target;
    if (!t || !item?.name) return;
    if (t.type === 'checkbox') values[item.name] = !!t.checked;
    else values[item.name] = t.value;
  }

  function clearAfterSuccess() {
    if (typeof config.clearOnSuccess === 'function') {
      values = config.clearOnSuccess();
    } else if (config.clearOnSuccess) {
      values = { ...(config.initial || {}) };
    }
  }

  // SvelteKit enhance handler
  function onEnhance() {
    return async ({ result }) => {
      isSubmitting = false;
      serverErrors = [];
      serverMessage = '';

      if (result.type === 'failure') {
        // result.data shape may vary across actions; handle common keys
        const data = result.data || {};
        serverMessage = data.message || 'Failed to save. Please fix the errors and try again.';
        serverErrors = Array.isArray(data.errors) ? data.errors : [];
        // If action returns sticky values, prefer them; otherwise keep existing
        if (data.values && typeof data.values === 'object') {
          values = { ...values, ...data.values };
        }
        dispatch('failure', data);
        return;
      }

      // success
      const data = result.data || {};
      serverMessage = data.message || '';
      dispatch('success', data);

      if (config.clearOnSuccess) clearAfterSuccess();
    };
  }

  // Form submit start (to set submitting state early)
  function onSubmitStart() {
    isSubmitting = true;
    serverMessage = '';
    serverErrors = [];
  }
</script>

<!-- REPLACE lines 98–114 with this -->
{#if serverMessage}
  <div
    class="fu-alert {serverErrors.length ? 'fu-alert--error' : 'fu-alert--success'}"
    role={serverErrors.length ? 'alert' : 'status'}
  >
    {serverMessage}
  </div>
{/if}

{#if config.showErrorsList && serverErrors.length}
  <ul class="fu-errors">
    {#each serverErrors as err}
      <li>{err}</li>
    {/each}
  </ul>
{/if}


<form
  method={config.method || 'post'}
  action={config.action}
  enctype={config.encType}
  class="fu-form {config.layout === 'grid-2' ? 'fu-grid2' : 'fu-stack'} {config.labelPosition === 'left' ? 'fu-label-left' : 'fu-label-top'}"
  use:enhance={onEnhance}
  on:submit={onSubmitStart}
>
  {#each config.items as item (item.name ?? item.label ?? item.type)}
    {#if item.type === 'hidden'}
      <input
        id={fid(item.name || 'hidden')}
        name={item.name}
        type="hidden"
        value={item.value ?? val(item.name, '')}
      />
    {:else if item.type === 'note'}
      <div class="fu-note">{item.text}</div>

    {:else}
      <div class="fu-field">
        {#if item.label}
          <label class="fu-label" for={fid(item.name)}>{item.label}</label>
        {/if}

        <!-- TEXT -->
        {#if item.type === 'text'}
          <input
            id={fid(item.name)}
            name={item.name}
            type="text"
            placeholder={item.placeholder}
            value={val(item.name, '')}
            required={item.required}
            on:input={(e)=>update(e,item)}
            {...(item.props || {})}
          />

        <!-- NUMBER -->
        {:else if item.type === 'number'}
          <input
            id={fid(item.name)}
            name={item.name}
            type="number"
            min={item.min}
            max={item.max}
            step={item.step}
            placeholder={item.placeholder}
            value={val(item.name, '')}
            required={item.required}
            on:input={(e)=>update(e,item)}
            {...(item.props || {})}
          />

        <!-- PASSWORD -->
        {:else if item.type === 'password'}
          <input
            id={fid(item.name)}
            name={item.name}
            type="password"
            placeholder={item.placeholder}
            value={val(item.name, '')}
            required={item.required}
            on:input={(e)=>update(e,item)}
            {...(item.props || {})}
          />

        <!-- TEXTAREA -->
        {:else if item.type === 'textarea'}
          <textarea
            id={fid(item.name)}
            name={item.name}
            rows={item.rows ?? 4}
            placeholder={item.placeholder}
            required={item.required}
            on:input={(e)=>update(e,item)}
            {...(item.props || {})}
          >{val(item.name, '')}</textarea>

        <!-- SELECT -->
        {:else if item.type === 'select'}
          <select
            id={fid(item.name)}
            name={item.name}
            required={item.required}
            on:change={(e)=>update(e,item)}
            {...(item.props || {})}
          >
            {#if item.placeholder}
              <option value="" disabled selected={val(item.name, '') === ''}>{item.placeholder}</option>
            {/if}
            {#each optsOf(item) as opt}
              <option value={opt.value} selected={String(val(item.name, '')) === String(opt.value)}>{opt.label}</option>
            {/each}
          </select>

        <!-- CHECKBOX -->
        {:else if item.type === 'checkbox'}
          <input
            id={fid(item.name)}
            name={item.name}
            type="checkbox"
            checked={!!val(item.name, false)}
            on:change={(e)=>update(e,item)}
            {...(item.props || {})}
          />

        <!-- FILE -->
        {:else if item.type === 'file'}
          <input
            id={fid(item.name)}
            name={item.name}
            type="file"
            accept={item.accept}
            required={item.required}
            {...(item.props || {})}
          />

        <!-- NEW: DATE -->
        {:else if item.type === 'date'}
          <input
            id={fid(item.name)}
            name={item.name}
            type="date"
            value={val(item.name, '')}
            required={item.required}
            on:input={(e)=>update(e,item)}
            {...(item.props || {})}
          />

        <!-- NEW: DATETIME-LOCAL -->
        {:else if item.type === 'datetime-local'}
          <input
            id={fid(item.name)}
            name={item.name}
            type="datetime-local"
            value={val(item.name, '')}
            required={item.required}
            on:input={(e)=>update(e,item)}
            {...(item.props || {})}
          />

        <!-- NEW: TIME -->
        {:else if item.type === 'time'}
          <input
            id={fid(item.name)}
            name={item.name}
            type="time"
            value={val(item.name, '')}
            required={item.required}
            on:input={(e)=>update(e,item)}
            {...(item.props || {})}
          />

        <!-- FALLBACK (treat unknown as text) -->
        {:else}
          <input
            id={fid(item.name)}
            name={item.name}
            type="text"
            placeholder={item.placeholder}
            value={val(item.name, '')}
            required={item.required}
            on:input={(e)=>update(e,item)}
            {...(item.props || {})}
          />
        {/if}

        {#if item.help}
          <div class="fu-help">{item.help}</div>
        {/if}
      </div>
    {/if}
  {/each}

  <div class="fu-actions">
    <button
      type="submit"
      class="fu-btn"
      disabled={isSubmitting || isDisabled()}
      aria-busy={isSubmitting}
    >
      {config.submit?.label ?? 'Save'}
    </button>
  </div>
</form>

<style>
  .fu-alert{
  margin:.5rem 0 1rem;
  padding:.75rem 1rem;
  border-radius:12px;
  font-weight:600;
}
.fu-alert--success{ background: var(--secondaryColor); color:#fff; } /* green */
.fu-alert--error{   background: var(--accentColor);    color:#fff; } /* red/magenta */

  /* container */
  .fu-header { margin-bottom: .75rem; }

  

  .fu-alert {
    margin: .5rem 0;
    padding: .6rem .75rem;
    border-radius: 10px;
    border: 1px solid var(--borderColor);
    background: color-mix(in oklab, var(--accentColor) 20%, var(--surfaceColor));
    color: var(--primaryText);
  }
  .fu-alert--error {
    background: color-mix(in oklab, #ff4d4f 24%, var(--surfaceColor));
    color: var(--primaryText);
  }

  .fu-errors {
    margin: .5rem 0;
    padding-left: 1rem;
    color: var(--secondaryText);
  }
  .fu-errors li { margin: .15rem 0; }

  form.fu-form {
    width: 100%;
    padding: .75rem;
    border: 1px solid var(--borderColor);
    border-radius: 14px;
    background: var(--surfaceColor);
  }

  .fu-stack { display: grid; gap: .9rem; }
  .fu-grid2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .9rem;
  }
  @media (max-width: 720px) {
    .fu-grid2 { grid-template-columns: 1fr; }
  }

  .fu-field {
    display: grid;
    gap: .35rem;
  }
  .fu-label-top .fu-field { grid-template-columns: 1fr; }
  .fu-label-left .fu-field {
    grid-template-columns: 180px 1fr;
    align-items: center;
  }
  @media (max-width: 720px) {
    .fu-label-left .fu-field { grid-template-columns: 1fr; }
  }

  .fu-label {
    color: var(--secondaryText);
    font-size: .92rem;
  }

  input[type="text"],
  input[type="password"],
  input[type="number"],
  input[type="date"],
  input[type="time"],
  input[type="datetime-local"],
  input[type="file"],
  select,
  textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--borderColor);
    background: var(--backgroundColor);
    color: var(--primaryText);
    border-radius: 10px;
    padding: .55rem .7rem;
    font: inherit;
    outline: none;
  }
  textarea { resize: vertical; }

  .fu-help {
    color: var(--secondaryText);
    font-size: .85rem;
  }

  .fu-note {
    padding: .6rem .75rem;
    border: 1px dashed var(--borderColor);
    border-radius: 10px;
    background: var(--backgroundColor);
    color: var(--secondaryText);
    font-size: .92rem;
  }

  .fu-actions {
    margin-top: .6rem;
    display: flex;
    justify-content: flex-end;
  }

  .fu-btn {
    padding: .55rem 1rem;
    border-radius: 999px;
    border: 1px solid var(--borderColor);
    background: var(--primaryColor);
    color: #0b0f14;
    font-weight: 600;
    cursor: pointer;
  }
  .fu-btn[disabled] {
    opacity: .6;
    cursor: not-allowed;
  }
</style>
