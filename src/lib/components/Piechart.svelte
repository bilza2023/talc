<script>
    export let data = [
      { label: 'Apples', value: 40, color: '#0088FE' },
      { label: 'Bananas', value: 30, color: '#00C49F' },
      { label: 'Cherries', value: 20, color: '#FFBB28' },
      { label: 'Dates', value: 10, color: '#FF8042' }
    ];
  
    // default = column (stacked)
    export let legendDirection = 'col';
  
    const total = data.reduce((sum, d) => sum + d.value, 0);
  
    function polarToCartesian(cx, cy, r, angleDeg) {
      const rad = (angleDeg - 90) * Math.PI / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    }
  
    function describeArc(cx, cy, r, startAngle, endAngle) {
      const start = polarToCartesian(cx, cy, r, endAngle);
      const end = polarToCartesian(cx, cy, r, startAngle);
      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
    }
  
    // Precompute slices
    let start = 0;
    const slices = data.map(d => {
      const angle = (d.value / total) * 360;
      const slice = {
        ...d,
        path: describeArc(150, 150, 140, start, start + angle)
      };
      start += angle;
      return slice;
    });
  </script>
  
  <div class="pie">
    <svg viewBox="0 0 300 300" width="300" height="300">
      {#each slices as s}
        <path d={s.path} fill={s.color} />
      {/each}
    </svg>
  
    <ul class="legend {legendDirection}">
      {#each slices as s}
        <li>
          <span class="dot" style="background:{s.color}"></span>
          {s.label} ({s.value})
        </li>
      {/each}
    </ul>
  </div>
  
  <style>
    .pie {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .legend {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      font-size: 0.9rem;
    }
    .legend.row {
      flex-direction: row;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    .legend.col {
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
    }
    .dot {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 0.5rem;
    }
  </style>
  