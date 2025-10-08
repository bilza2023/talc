<script>
    // segments: [{ label, value }]
    export let segments = [];
    export let size = 140;
    export let thickness = 14;
    export let showTotal = true;
  
    $: total = segments.reduce((s, x) => s + Number(x.value || 0), 0);
    $: radius = (size - thickness) / 2;
    $: circ = 2 * Math.PI * radius;
  
    // assign hues deterministically
    $: palette = segments.map((_, i) => `hsl(${(i * 57) % 360} 80% 60%)`);
  
    $: withOffsets = (() => {
      let acc = 0;
      return segments.map((s) => {
        const frac = total ? (s.value / total) : 0;
        const len = frac * circ;
        const from = acc;
        acc += len;
        return { ...s, len, from };
      });
    })();
  </script>
  
  <div class="wrap" style={`--size:${size}px; --th:${thickness}px`}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Donut chart">
      <g transform={`translate(${size/2},${size/2}) rotate(-90)`}>
        {#each withOffsets as s, i}
          <circle
            r={radius}
            cx="0" cy="0"
            fill="none"
            stroke={palette[i]}
            stroke-width={thickness}
            stroke-dasharray={`${s.len} ${circ - s.len}`}
            stroke-dashoffset={-s.from}
            pathLength={circ}
          />
        {/each}
        <!-- background ring -->
        <circle r={radius} cx="0" cy="0" fill="none" stroke="color-mix(in oklab, white 4%, transparent)" stroke-width={thickness} opacity="0.25"/>
      </g>
      {#if showTotal}
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="total">
          {total.toLocaleString()}
        </text>
      {/if}
    </svg>
  
    {#if segments?.length}
      <div class="legend">
        {#each segments as s, i}
          <div class="row">
            <span class="sw" style={`background:${palette[i]}`}></span>
            <span class="lab">{s.label}</span>
            <span class="val">{s.value?.toLocaleString?.() ?? s.value}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
  <style>
    .wrap {
      display: grid;
      grid-template-columns: var(--size) 1fr;
      gap: .75rem;
      align-items: center;
    }
    @media (max-width: 600px) {
      .wrap { grid-template-columns: 1fr; justify-items: center; }
    }
    .total {
      fill: var(--primaryText, #e9e9ea);
      font-size: 1rem;
      opacity: .9;
    }
    .legend { width: 100%; }
    .row {
      display: grid;
      grid-template-columns: 14px auto auto;
      gap: .5rem .75rem;
      align-items: center;
      padding: .25rem 0;
    }
    .sw {
      width: 14px; height: 14px; border-radius: 3px;
      border: 1px solid color-mix(in oklab, black 20%, transparent);
    }
    .lab { color: var(--mutedText, #a3a3a3); }
    .val { justify-self: end; }
  </style>
  