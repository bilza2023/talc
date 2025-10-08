
<script>
    import ReportShell from '$lib/components/reports/ReportShell.svelte';
    import KPIBar from '$lib/components/reports/KPIBar.svelte';
    import FacetPanel from '$lib/components/reports/FacetPanel.svelte';
    import SmartTable from '$lib/components/reports/SmartTable.svelte';
    import Sparkline from '$lib/components/reports/Sparkline.svelte';
    import Donut from '$lib/components/reports/Donut.svelte';
    import { goto } from '$app/navigation';
  
    export let data;
  
    const tabs = [
      { label: 'Overview',  href: '/reports/procurement/overview' },
      { label: 'Suppliers', href: '/reports/procurement/suppliers' },
      { label: 'Trends',    href: '/reports/procurement/trends' },
    ];
  
    const { filters, options, kpis } = data;
  
    // Facets
    const facets = [
      { key: 'station',    label: 'Station',    type: 'chips',  options: [''].concat(options.stations || []), value: filters.station },
      { key: 'family',     label: 'Family',     type: 'chips',  options: [''].concat(options.families || []), value: filters.family },
      { key: 'shade',      label: 'Shade',      type: 'select', options: [''].concat(options.shades   || []), value: filters.shade },
      { key: 'size',       label: 'Size',       type: 'select', options: [''].concat(options.sizes    || []), value: filters.size },
      { key: 'supplierId', label: 'Supplier',   type: 'select', options: [''].concat(options.supOpts  || []), value: filters.supplierId },
      { key: 'days',       label: 'Lookback',   type: 'chips',  options: options.daysOpts || [], value: filters.days || '90' },
      { key: 'group',      label: 'Group By',   type: 'chips',  options: options.groupOpts || ['day','week','month'], value: filters.group || 'week' },
    ];
    function pretty(opt) { return opt === '' ? 'All' : opt; }
    facets.forEach(f => {
      // show proper labels for chips/selects
      f.options = (f.options || []).map(pretty);
    });
  
    function onFacetChange(e) {
      const next = e.detail || {};
      for (const k of Object.keys(next)) if (next[k] === 'All') next[k] = '';
      const qs = new URLSearchParams();
      if (next.station)    qs.set('station', next.station);
      if (next.family)     qs.set('family',  next.family);
      if (next.shade)      qs.set('shade',   next.shade);
      if (next.size)       qs.set('size',    next.size);
      if (next.supplierId) qs.set('supplierId', next.supplierId);
      if (next.days)       qs.set('days', next.days);
      if (next.group)      qs.set('group', next.group);
      const q = qs.toString();
      goto(q ? `?${q}` : '?', { replaceState: true });
    }
  
    // Trend series table
    const trendCols = [
      { key: 'label', label: 'Period', align: 'left' },
      { key: 'qty',   label: 'Qty (t)', align: 'right' },
    ];
    const trendRows = (data.series || []).map(r => ({ label: r.label, qty: r.qty }));
  
    // Shade mix donut
    const segments = data.shadeMix || [];
    const points = data.points || [];
  </script>
  
  <ReportShell title="Procurement — Trends" dateRange="Live Data" {tabs}>
    <KPIBar items={kpis} />
  
    <div style="margin:1rem 0;">
      <FacetPanel facets={facets} on:change={onFacetChange} />
    </div>
  
    <h2 style="margin:1.25rem 0 .5rem;">Purchases Over Time</h2>
    <div style="padding:.5rem; border:1px solid var(--borderColor, #2a2a2e); border-radius:12px; background:var(--panelBg, #151518);">
      <Sparkline points={points} />
    </div>
  
    <h2 style="margin:1.25rem 0 .5rem;">Period Rollup</h2>
    <SmartTable columns={trendCols} rows={trendRows} />
  
    <h2 style="margin:1.25rem 0 .5rem;">Shade Mix (in period)</h2>
    <Donut segments={segments} />
  </ReportShell>
  