
<script>
  import ReportShell from '$lib/components/reports/ReportShell.svelte';
  import KPIBar from '$lib/components/reports/KPIBar.svelte';
  import FacetPanel from '$lib/components/reports/FacetPanel.svelte';
  import SmartTable from '$lib/components/reports/SmartTable.svelte';
  import { goto } from '$app/navigation';

  export let data;

  const tabs = [
    { label: 'Overview',  href: '/reports/stocks/overview' },
    { label: 'Slots',     href: '/reports/stocks/slots' },
    { label: 'Suppliers', href: '/reports/stocks/suppliers' },
  ];

  const { filters, options, kpis, rows } = data;

  // Build facet model for FacetPanel
  const facets = [
    { key: 'station', label: 'Station', type: 'chips',  options: [''].concat(options.stations || []), value: filters.station },
    { key: 'family',  label: 'Family',  type: 'chips',  options: [''].concat(options.families || []), value: filters.family },
    { key: 'shade',   label: 'Shade',   type: 'select', options: [''].concat(options.shades   || []), value: filters.shade },
    { key: 'size',    label: 'Size',    type: 'select', options: [''].concat(options.sizes    || []), value: filters.size },
  ];
  // Display labels for empty = 'All'
  function pretty(opt) { return opt === '' ? 'All' : opt; }
  facets.forEach(f => f.options = f.options.map(pretty));

  // When filters change, push URL query
  function onFacetChange(e) {
    const next = e.detail || {};
    // Convert 'All' back to '' (empty)
    for (const k of Object.keys(next)) if (next[k] === 'All') next[k] = '';
    const qs = new URLSearchParams();
    if (next.station) qs.set('station', next.station);
    if (next.family)  qs.set('family',  next.family);
    if (next.shade)   qs.set('shade',   next.shade);
    if (next.size)    qs.set('size',    next.size);
    const q = qs.toString();
    goto(q ? `?${q}` : '?', { replaceState: true });
  }

  const columns = [
    { key: 'mmaCode',     label: 'MMA', align: 'left' },
    { key: 'supplierName',label: 'Supplier', align: 'left' },
    { key: 'supplierId',  label: 'ID', align: 'right', width: '80px' },
    { key: 'shade',       label: 'Shade', align: 'left' },
    { key: 'size',        label: 'Size', align: 'left' },
    { key: 'qty',         label: 'Qty (t)', align: 'right' },
  ];
</script>

<ReportShell title="Stocks — Slots" dateRange="Live Data" {tabs}>
  <KPIBar items={kpis} />

  <div style="margin:1rem 0;">
    <FacetPanel facets={facets} on:change={onFacetChange} />
  </div>

  <SmartTable {columns} rows={rows} />
</ReportShell>
