<script>
    // HTML form semantics: when checked, submits `value` (default 'on'); when unchecked, submits nothing.
    // Prefer bind:checked from parent for local UI state.
    export let name = '';
    export let label = '';
    export let id = '';
    export let checked = false;
    export let disabled = false;
    export let required = false;
    export let value = 'on';
    export let inputClass = '';
    export let labelClass = '';
    export let containerClass = '';
  
    const fid = id || (name ? `fi-${name}` : `fi-${Math.random().toString(36).slice(2)}`);
  </script>
  
  <div class={`field row ${containerClass}`}>
    <input
      id={fid}
      class={`checkbox ${inputClass}`}
      type="checkbox"
      name={name}
      bind:checked
      {disabled}
      {required}
      {value}
    />
    {#if label}
      <label class={`label ${labelClass}`} for={fid}>{label}</label>
    {/if}
  </div>
  
  <style>
    .field{ display:flex; align-items:center; gap:.5rem; margin-bottom:.75rem; }
    .row{ flex-direction:row; }
    .label{ font-size:.95rem; color:var(--primaryText); cursor:pointer; }
    .checkbox{
      width:1.1rem; height:1.1rem;
      border:1px solid var(--borderColor);
      border-radius:4px;
      accent-color: var(--primaryColor);
    }
    .checkbox:disabled{ opacity:.65; cursor:not-allowed; }
  </style>
  