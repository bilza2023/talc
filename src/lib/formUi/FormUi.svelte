<script>

  import { enhance } from '$app/forms';
  import { createEventDispatcher } from 'svelte';

  export let config;

  const dispatch = createEventDispatcher();

  let formResult = null;
  let values = {};

  $: actionHref = (config && config.action) || '';
  if (!actionHref) console.warn('[Form] Missing config.action');

  function initValuesFromConfig() {
    const init = { ...(config?.initial ?? {}) };
    const items = Array.isArray(config?.items) ? config.items : [];
    for (const item of items) {
      if (!item) continue;
      if (item.type === 'note') continue;
      if (item.type === 'hidden' && !item.name) continue;
      const k = item.name;
      if (!k) continue;
      if (init[k] === undefined) {
        if (item.value !== undefined) init[k] = item.value;
        else init[k] = item.type === 'checkbox' ? false : '';
      }
    }
    return init;
  }

  $: values = initValuesFromConfig();

  const isFn = (v) => typeof v === 'function';
  const itemVisible = (item) => (item?.visible === undefined ? true : (isFn(item.visible) ? !!item.visible(values) : !!item.visible));
  const itemDisabled = (item) => (item?.disabled === undefined ? false : (isFn(item.disabled) ? !!item.disabled(values) : !!item.disabled));
  const getOptions = (item) => {
    const base = item?.options ?? [];
    return isFn(base) ? (base(values) || []) : base;
  };

  $: submitDisabled = isFn(config?.submit?.disabledWhen) ? !!config.submit.disabledWhen(values) : false;

  function fid(id, name, i) {
    const base = id || 'form';
    const key = name || `f${i}`;
    return `${base}-${key}`;
  }

  function handleEnhance() {
    return ({ result }) => {
      if (result.type === 'failure') {
        formResult = result.data;
        if (formResult?.values) values = { ...values, ...formResult.values };
        dispatch('failure', formResult);
        return;
      }
      if (result.type === 'success') {
        formResult = result.data;
        dispatch('success', formResult);
        const clear = config?.clearOnSuccess;
        if (clear === true) {
          values = initValuesFromConfig();
        } else if (isFn(clear)) {
          const patch = clear();
          values = { ...values, ...(patch || {}) };
        }
      }
    };
  }
</script>

<form
  method={config?.method ?? 'post'}
  action={actionHref}
  enctype={config?.encType}
  use:enhance={handleEnhance}
  class={`f-wrap ${config?.layout === 'grid-2' ? 'grid2' : 'stack'} ${config?.labelPosition === 'left' ? 'label-left' : 'label-top'}`}
  autocomplete="off"
>
  {#if config?.title || config?.description}
    <header class="f-head">
      {#if config?.title}<h2 class="f-title">{config.title}</h2>{/if}
      {#if config?.description}<p class="f-desc">{config.description}</p>{/if}
    </header>
  {/if}

  {#if formResult?.message}
    <div class={formResult.ok ? 'msg ok' : 'msg warn'}>
      {formResult.message}
    </div>
  {/if}

  {#if !formResult?.ok && config?.showErrorsList && Array.isArray(formResult?.errors) && formResult.errors.length}
    <ul class="errors">
      {#each formResult.errors as e}
        <li>{e}</li>
      {/each}
    </ul>
  {/if}

  <div class="f-body">
    {#each (config?.items ?? []) as item, i (item?.name ?? i)}
      {#if item && itemVisible(item)}
        {#if item.type === 'note'}
          <div class="f-note">{item.text}</div>

        {:else if item.type === 'hidden'}
          {#if item.name}
            <input type="hidden" name={item.name} value={values[item.name] ?? item.value ?? ''} />
          {/if}

        {:else}
          <div class="f-row {item?.type}">
            {#if item.label}
              <label class="f-label" for={fid(config?.id, item.name, i)}>
                {item.label}{item.required ? ' *' : ''}
              </label>
            {/if}

            {#if item.type === 'textarea'}
              <textarea
                id={fid(config?.id, item.name, i)}
                name={item.name}
                rows={item.rows ?? 4}
                class="f-input"
                placeholder={item.placeholder}
                bind:value={values[item.name]}
                disabled={itemDisabled(item)}
              />

            {:else if item.type === 'select'}
              <select
                id={fid(config?.id, item.name, i)}
                name={item.name}
                class="f-input"
                bind:value={values[item.name]}
                disabled={itemDisabled(item)}
                on:change={() => dispatch('change', { name: item.name, value: values[item.name] })}
              >
                {#each getOptions(item) as opt}
                  <option value={opt.value} disabled={opt.disabled}>{opt.label}</option>
                {/each}
              </select>

            {:else if item.type === 'number'}
              <input
                id={fid(config?.id, item.name, i)}
                name={item.name}
                type="number"
                class="f-input"
                placeholder={item.placeholder}
                min={item.min}
                max={item.max}
                step={item.step}
                bind:value={values[item.name]}
                disabled={itemDisabled(item)}
              />

            {:else if item.type === 'password'}
              <input
                id={fid(config?.id, item.name, i)}
                name={item.name}
                type="password"
                class="f-input"
                placeholder={item.placeholder}
                bind:value={values[item.name]}
                disabled={itemDisabled(item)}
              />

            {:else if item.type === 'checkbox'}
              <div class="f-check">
                <input
                  id={fid(config?.id, item.name, i)}
                  name={item.name}
                  type="checkbox"
                  class="f-input"
                  bind:checked={values[item.name]}
                  disabled={itemDisabled(item)}
                />
                {#if item.placeholder}<span class="check-label">{item.placeholder}</span>{/if}
              </div>

            {:else if item.type === 'file'}
              <input
                id={fid(config?.id, item.name, i)}
                name={item.name}
                type="file"
                class="f-input"
                disabled={itemDisabled(item)}
              />

            {:else}
              <input
                id={fid(config?.id, item.name, i)}
                name={item.name}
                type="text"
                class="f-input"
                placeholder={item.placeholder}
                bind:value={values[item.name]}
                disabled={itemDisabled(item)}
              />
            {/if}

            {#if item.hint}
              <div class="f-hint">{item.hint}</div>
            {/if}
          </div>
        {/if}
      {/if}
    {/each}
  </div>

  <div class="f-actions">
    <button type="submit" class="btn" disabled={submitDisabled} aria-disabled={submitDisabled}>
      {config?.submit?.label ?? 'Save'}
    </button>
  </div>
</form>

<style>
  .f-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    background: var(--surfaceColor);
    border: 1px solid var(--borderColor);
    border-radius: 14px;
    padding: 1.1rem;
    box-shadow: 0 2px 6px rgba(0,0,0,.25);
  }
  .f-head { display: grid; gap: .25rem; }
  .f-title { margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--primaryText); }
  .f-desc  { margin: 0; font-size: .9rem; color: var(--secondaryText); }

  .msg { padding: .55rem .7rem; border-radius: 10px; font-size: .9rem; }
  .ok   { background: var(--secondaryColor); color: var(--backgroundColor); }
  .warn { background: var(--accentColor); color: var(--backgroundColor); }

  ul.errors { margin: 0; padding-left: 1rem; color: var(--accentColor); }
  ul.errors li { margin: .15rem 0; }

  .f-body { display: grid; gap: .75rem; }
  .stack .f-row { display: grid; gap: .35rem; }
  .grid2 .f-body { grid-template-columns: 1fr 1fr; }
  .grid2 .f-row { display: grid; gap: .35rem; }

  .label-top .f-row { grid-template-columns: 1fr; }
  .label-left .f-row {
    grid-template-columns: 180px 1fr;
    align-items: center;
  }

  .f-label { font-size: .9rem; color: var(--secondaryText); }
  .f-input {
    width: 100%;
    padding: .6rem .8rem;
    background: var(--backgroundColor);
    color: var(--primaryText);
    border: 1px solid var(--borderColor);
    border-radius: 10px;
  }
  .f-input:focus {
    outline: 2px solid var(--primaryColor);
    outline-offset: 1px;
  }

  .f-check { display: flex; align-items: center; gap: .6rem; }
  .check-label { color: var(--secondaryText); font-size: .9rem; }

  .f-hint { font-size: .8rem; color: var(--secondaryText); }

  .f-note {
    background: var(--surfaceColor);
    border: 1px dashed var(--borderColor);
    color: var(--secondaryText);
    padding: .6rem .8rem;
    border-radius: 10px;
    font-size: .9rem;
  }

  .f-actions { display: flex; justify-content: flex-end; margin-top: .2rem; }
  .btn {
    appearance: none;
    border: 0;
    border-radius: 10px;
    padding: .6rem .9rem;
    font-weight: 700;
    color: var(--backgroundColor);
    background: var(--primaryColor);
    cursor: pointer;
  }
  .btn:hover { opacity: 0.9; }
  .btn[disabled] { opacity: .5; cursor: not-allowed; }
</style>
