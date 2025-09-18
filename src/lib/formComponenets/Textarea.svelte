<script>
    export let name = '';
    export let label = '';
    export let id = '';
    export let value = '';
    export let required = false;
    export let disabled = false;
    export let placeholder = '';
    export let rows = 3;
    export let maxlength = undefined;
    export let inputClass = '';
    export let labelClass = '';
    export let containerClass = '';
  
    const fid = id || (name ? `fi-${name}` : `fi-${Math.random().toString(36).slice(2)}`);
  </script>
  
  <div class={`field ${containerClass}`}>
    {#if label}
      <label class={`label ${labelClass}`} for={fid}>{label}</label>
    {/if}
    <textarea
      id={fid}
      class={`input textarea ${inputClass}`}
      name={name}
      bind:value
      {required}
      {disabled}
      {placeholder}
      {rows}
      {maxlength}
    />
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
    .textarea{ min-height: 2.5rem; }
    .input:focus{ outline:2px solid var(--primaryColor); outline-offset:1px; }
    .input:disabled{ opacity:.65; cursor:not-allowed; }
  </style>
  