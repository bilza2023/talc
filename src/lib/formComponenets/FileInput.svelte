<script>
    // Bind files from parent: <FileInput bind:files ... />
    export let name = '';
    export let label = '';
    export let id = '';
    export let files = null;  // FileList
    export let required = false;
    export let disabled = false;
    export let multiple = false;
    export let accept = '';   // e.g., "image/*,.pdf"
    export let capture = undefined; // e.g., "environment"
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
      class={`input file ${inputClass}`}
      type="file"
      name={name}
      bind:files
      {required}
      {disabled}
      {multiple}
      {accept}
      {capture}
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
  