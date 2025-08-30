<script>
    export let href = '#';
    export let label = '';
    export let icon = '';          // e.g. '📥' or '📤'
    export let sublabel = '';      // optional
    export let disabled = false;
  </script>
  
  <a
    {href}
    aria-label={label}
    role="button"
    class={`rounded-xl p-4 bg-[#111826] hover:bg-[#142136] transition shadow-md
            focus:outline-none focus:ring-2 focus:ring-sky-500/40 inline-flex w-full
            ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
  >
    <span class="flex items-center gap-3 text-[#e6ebf1]">
      <span class="shrink-0 text-xl leading-none">{icon}</span>
      <span class="flex flex-col">
        <span class="text-base font-medium leading-5">{label}</span>
        {#if sublabel}
          <span class="text-xs text-[#9fb0c5] leading-4">{sublabel}</span>
        {/if}
      </span>
    </span>
  </a>
  