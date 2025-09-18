<script>
    // Text or Number input (no dynamic type with bind — we branch)
    export let name = '';
    export let label = '';
    export let id = '';
    export let type = 'text'; // 'text' | 'number'
    export let value = '';
    export let required = false;
    export let disabled = false;
    export let placeholder = '';
    export let min = undefined;   // number | string
    export let max = undefined;   // number | string
    export let step = undefined;  // number | string
    export let autocomplete = 'off';
    export let inputmode = undefined; // e.g., 'numeric', 'decimal' (for number UX)
    export let inputClass = '';
    export let labelClass = '';
    export let containerClass = '';
  
    const fid = id || (name ? `fi-${name}` : `fi-${Math.random().toString(36).slice(2)}`);
  </script>
  
  <div class={`field ${containerClass}`}>
    {#if label}
      <label class={`label ${labelClass}`} for={fid}>{label}</label>
    {/if}
  
    {#if type === 'number'}
      <input
        id={fid}
        class={`input ${inputClass}`}
        name={name}
        type="number"
        bind:value
        {required}
        {disabled}
        {placeholder}
        {autocomplete}
        {min}
        {max}
        {step}
        {inputmode}
      />
    {:else}
      <input
        id={fid}
        class={`input ${inputClass}`}
        name={name}
        type="text"
        bind:value
        {required}
        {disabled}
        {placeholder}
        {autocomplete}
        {min}
        {max}
        {step}
        {inputmode}
      />
    {/if}
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
  