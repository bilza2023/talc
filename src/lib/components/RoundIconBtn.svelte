<!-- src/lib/components/RoundIconBtn.svelte -->
<script>
    
    // Props
    export let label = '';
    export let icon = '';           // emoji or short text (e.g., "🏷️")
    export let href = '';           // if set → renders <a>; else <button>
    export let type = 'button';
    export let disabled = false;
  
    // Style
    export let variant = 'solid';   // 'solid' | 'outline'
    export let size = 'md';         // 'sm' | 'md' | 'lg'
    export let active = false;      // optional pressed state
  
    // Optional width control
    export let block = false;       // full-width when true
  </script>
  
  {#if href}
    <a
      class="rib {variant} {size} {active ? 'active' : ''} {block ? 'block' : ''}"
      href={href}
      aria-disabled={disabled}
      on:click|preventDefault={disabled ? () => {} : null}
    >
      {#if icon}<span class="i" aria-hidden="true">{icon}</span>{/if}
      {#if label}<span class="t">{label}</span>{/if}
      <slot />
    </a>
  {:else}
    <button
      class="rib {variant} {size} {active ? 'active' : ''} {block ? 'block' : ''}"
      type={type}
      {disabled}
    >
      {#if icon}<span class="i" aria-hidden="true">{icon}</span>{/if}
      {#if label}<span class="t">{label}</span>{/if}
      <slot />
    </button>
  {/if}
  
  <style>
    .rib {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem; /* 6px - better for mobile touch */
      border-radius: 9999px;
      border: 1px solid var(--borderColor);
      background: var(--surfaceColor);
      color: var(--primaryText);
      text-decoration: none;
      font-weight: 600;
      line-height: 1;
      transition: transform 0.06s ease, box-shadow 0.12s ease, background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      /* Mobile-first: default to sm size for better mobile UX */
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      min-height: 44px; /* iOS accessibility minimum */
    }
    
    .rib.block { 
      display: flex; 
      width: 100%; 
    }
    
    .rib .i { 
      font-size: 1.1em; 
      display: inline-block; 
    }
    
    .rib .t { 
      white-space: nowrap; 
    }
  
    /* Variants */
    .rib.solid {
      background: var(--primaryColor);
      border-color: var(--primaryColor);
      color: var(--backgroundColor); /* Use token instead of hardcoded white */
    }
    
    .rib.outline {
      background: var(--surfaceColor);
      border-color: var(--borderColor);
      color: var(--primaryText);
    }
  
    /* Size overrides - mobile-first approach */
    .rib.sm { 
      padding: 0.375rem 0.625rem; 
      font-size: 0.8125rem;
      min-height: 40px;
    }
    
    .rib.md { 
      padding: 0.5rem 0.75rem;  
      font-size: 0.875rem;
      min-height: 44px;
    }
    
    .rib.lg { 
      padding: 0.625rem 0.875rem; 
      font-size: 0.9375rem;
      min-height: 48px;
    }
    
    .rib.sm .i { 
      font-size: 1rem; 
    }
    
    .rib.lg .i { 
      font-size: 1.25em; 
    }
  
    /* Interactions - enhanced for mobile */
    .rib:hover {
      box-shadow: 0 2px 8px color-mix(in oklab, var(--primaryText) 12%, transparent);
    }
    
    .rib:active { 
      transform: translateY(1px); 
    }
    
    .rib.active { 
      box-shadow: 0 0 0 2px color-mix(in oklab, var(--primaryColor) 30%, transparent); 
    }
    
    .rib[aria-disabled="true"], 
    .rib:disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    /* Tablet and up - larger sizes for better desktop experience */
    @media (min-width: 768px) {
      .rib {
        gap: 0.5rem;
        padding: 0.5rem 0.9rem;
        font-size: 1rem;
        min-height: auto; /* Remove mobile minimum on larger screens */
      }
      
      .rib.sm { 
        padding: 0.35rem 0.6rem; 
        font-size: 0.9rem; 
      }
      
      .rib.lg { 
        padding: 0.7rem 1.1rem; 
        font-size: 1.1rem; 
      }
    }
  </style>