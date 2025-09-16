<!-- src/lib/components/DD.svelte -->
<script>
    import { createEventDispatcher } from 'svelte';
  
    // Props
    export let id = '';
    export let name = '';         // optional: for form posting
    export let label = '';        // optional: accessible label
    export let items = [];        // [{ label, value }, ...]
    export let value = '';        // controlled value (string/number ok)
    export let placeholder = 'Select…';
    export let disabled = false;
    export let onSelect = null;   // callback (value, item)
  
    const dispatch = createEventDispatcher();
  
    // Normalize to string for the <select>
    $: sValue = value == null ? '' : String(value);
  
    function handleChange(e) {
      const v = e.target.value;
      const item = items.find(i => String(i.value) === v) ?? null;
  
      // Update local binding
      value = v;
  
      // Fire prop callback (if provided)
      if (typeof onSelect === 'function') {
        try { onSelect(v, item); } catch (err) { console.error(err); }
      }
  
      // Also dispatch a Svelte event for idiomatic usage
      dispatch('select', { value: v, item });
    }
  </script>
  
  <div class="dd">
    {#if label}
      <label class="dd-label" for={id || name}>{label}</label>
    {/if}
  
    <div class="select-wrap">
      <select
        id={id || name}
        name={name}
        class="dd-select"
        bind:value={sValue}
        on:change={handleChange}
        disabled={disabled}
        aria-label={label || placeholder}
      >
        {#if placeholder}
          <option value="" disabled selected={sValue === ''}>{placeholder}</option>
        {/if}
        {#each items as it (it.value)}
          <option value={String(it.value)}>{it.label}</option>
        {/each}
      </select>
      <span class="chev" aria-hidden="true">▾</span>
    </div>
  </div>
  
  <style>
    /* Layout wrapper */
    .dd {
      display: block;
      width: 100%;
    }
  
    /* Label */
    .dd-label {
      display: block;
      margin-bottom: var(--space-1, 0.25rem);
      font-size: var(--font-size-2, 0.875rem);
      color: var(--text-2, var(--color-muted, #6b7280));
      font-weight: var(--weight-regular, 500);
    }
  
    /* Select container (for custom arrow) */
    .select-wrap {
      position: relative;
      width: 100%;
    }
  
    /* The select */
    .dd-select {
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      width: 100%;
      min-height: 44px; /* thumb-friendly */
      font-size: var(--font-size-3, 1rem);
      line-height: 1.25;
      padding: var(--space-2, 0.5rem) var(--space-8, 2rem) var(--space-2, 0.5rem) var(--space-3, 0.75rem);
  
      color: var(--text-1, var(--color-text, #e5e7eb));
      background: var(--field-bg, var(--surface-1, var(--color-surface, #0b0f19)));
      border: 1px solid var(--border-1, var(--color-border, #334155));
      border-radius: var(--radius-md, 12px);
      box-shadow: var(--shadow-1, 0 1px 1px rgba(0,0,0,0.05));
    }
  
    .dd-select:hover {
      border-color: var(--border-2, var(--color-border-strong, #475569));
    }
  
    .dd-select:focus {
      outline: none;
      border-color: var(--focus, var(--brand-5, #3b82f6));
      box-shadow: 0 0 0 3px var(--focus-ring, rgba(59,130,246,0.25));
    }
  
    .dd-select:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  
    /* Custom caret */
    .chev {
      position: absolute;
      right: var(--space-3, 0.75rem);
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      font-size: var(--font-size-3, 1rem);
      opacity: 0.7;
    }
  </style>
  