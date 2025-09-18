<script>
    export let name = '';
    export let label = '';
    export let id = '';
    export let value = ''; // 'YYYY-MM-DD'
    export let required = false;
    export let disabled = false;
    export let min = undefined;
    export let max = undefined;
    export let inputClass = '';
    export let labelClass = '';
    export let containerClass = '';
  
    const fid = id || (name ? `fi-${name}` : `fi-${Math.random().toString(36).slice(2)}`);
  </script>
  
  <div class={`field ${containerClass}`}>
    {#if label}
      <label class={`label ${labelClass}`} for={fid}>{label}</label>
    {/if}
    <input
      id={fid}
      class={`input ${inputClass}`}
      type="date"
      name={name}
      bind:value
      {required}
      {disabled}
      {min}
      {max}
      autocomplete="off"
    />
  </div>
  
  <style>
    .field{ display:flex; flex-direction:column; gap:.35rem; margin-bottom:.75rem; }
    .label{ font-size:.9rem; color:var(--secondaryText); }
    .input{
      width:100%;
      padding:.5rem .6rem;
      border:1px solid var(--borderColor);
      background:var(--backgroundColor);
      color:var(--primaryText);
      border-radius:10px;
    }
    .input:focus{ outline:2px solid var(--primaryColor); outline-offset:1px; }
    .input:disabled{ opacity:.65; cursor:not-allowed; }
  </style>
  