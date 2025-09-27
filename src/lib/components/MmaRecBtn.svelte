<script>
    // Keep it dumb: parent provides the exact href.
    export let label;              // e.g. "Processed (SCREENED)"
    export let inboundCount = 0;   // number of incoming rows
    export let href = '#';         // absolute/relative path from parent
  
    $: hasInbound = Number(inboundCount) > 0;
  </script>
  
  <a
    class="mma-rec-btn"
    href={href}
    aria-disabled={!hasInbound}
    tabindex={hasInbound ? '0' : '-1'}
    title={hasInbound ? `Receive → ${label}` : `No inbound for ${label}`}
  >
    <span class="dot" aria-hidden="true"></span>
    <span class="label">{label}</span>
    <span class="spacer" />
    <span class="badge">{inboundCount}</span>
  </a>
  
  <style>
    .mma-rec-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.6rem 0.9rem;
      border: 1px solid var(--border, #444);
      border-radius: 0.75rem;
      text-decoration: none;
      font-weight: 500;
      opacity: 0.55;
      pointer-events: none; /* inert by default */
      user-select: none;
    }
    .mma-rec-btn[aria-disabled="false"] {
      opacity: 1;
      pointer-events: auto; /* clickable when inbound exists */
      border-color: var(--ok, #2d7);
      box-shadow: 0 0 0 2px rgba(45, 215, 120, 0.15);
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #666;
    }
    .mma-rec-btn[aria-disabled="false"] .dot {
      background: var(--ok, #2d7);
    }
    .label { letter-spacing: 0.2px; }
    .spacer { flex: 1; }
    .badge {
      min-width: 1.6rem;
      padding: 0.1rem 0.5rem;
      border-radius: 999px;
      border: 1px solid currentColor;
      text-align: center;
      font-variant-numeric: tabular-nums;
      font-size: 0.9em;
    }
  </style>
  