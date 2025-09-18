<script>
    // SelectInput.svelte
    export let name = '';
    export let label = '';
    export let id = '';
    export let value = '';          // parent can <SelectInput bind:value>
    export let options = [];        // ['WL','WC'] or [{ value, label, disabled? }]
    export let required = false;
    export let disabled = false;
    export let placeholder = '';    // shows as first disabled option
    export let inputClass = '';
    export let labelClass = '';
    export let containerClass = '';
  
    const fid = id || (name ? `fi-${name}` : `fi-${Math.random().toString(36).slice(2)}`);
  
    // Normalize once, reactively
    const normalize = (o) => {
      if (typeof o === 'string' || typeof o === 'number') {
        const s = String(o);
        return { value: s, label: s, disabled: false };
      }
      return {
        value: String(o.value ?? ''),
        label: o.label ?? String(o.value ?? ''),
        disabled: !!o.disabled
      };
    };
    $: normOptions = (options ?? []).map(normalize);
  </script>
  
  <div class={`field ${containerClass}`}>
    {#if label}
      <label class={`label ${labelClass}`} for={fid}>{label}</label>
    {/if}
  
    <select
      id={fid}
      class={`input ${inputClass}`}
      name={name}
      bind:value
      {required}
      {disabled}
    >
      {#if placeholder}
        <!-- Rely on bind:value === '' to show placeholder; no 'selected' attr -->
        <option value="" disabled>{placeholder}</option>
      {/if}
  
      {#each normOptions as x (x.value)}
        <option value={x.value} disabled={x.disabled}>{x.label}</option>
      {/each}
    </select>
  </div>
  
  <style>
    .field{ display:flex; flex-direction:column; gap:.35rem; margin-bottom:.75rem; }
    .label{ font-size:.9rem; color:var(--secondaryText); }
    .input{
      width:100%;
      padding:.625rem .75rem;
      border:1px solid var(--borderColor);
      background:var(--backgroundColor);
      color:var(--primaryText);
      border-radius:10px;
    }
    .input:focus{ outline:2px solid var(--primaryColor); outline-offset:1px; }
    .input:disabled{ opacity:.65; cursor:not-allowed; }
  </style>
  