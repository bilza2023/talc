
<script>
    import ReportShell from '$lib/components/reports/ReportShell.svelte';
    import KPIBar from '$lib/components/reports/KPIBar.svelte';
    import FacetPanel from '$lib/components/reports/FacetPanel.svelte';
    import SmartTable from '$lib/components/reports/SmartTable.svelte';
    import { goto } from '$app/navigation';
  
    export let data;
  
    const tabs = [
      { label: 'Overview',       href: '/reports/transport/overview' },
      { label: 'In-Transit',     href: '/reports/transport/in-transit' },
      { label: 'Reconciliation', href: '/reports/transport/reconciliation' },
    ];
  
    const { filters, options, kpis, lanes } = data;
  
    // Build facets
    const facets = [
      { key: 'from',       label: 'From MMA',   type: 'select', options: [''].concat(options.fromOpts  || []), value: filters.from },
      { key: 'to',         label: 'To MMA',     type: 'select', options: [''].concat(options.toOpts    || []), value: filters.to },
      { key: 'supplierId', label: 'Supplier',   type: 'select', options: [''].concat(options.supOpts   || []), value: filters.supplierId },
      { key: 'shade',      label: 'Shade',      type: 'select', options: [''].concat(options.shadeOpts || []), value: filters.shade },
      { key: 'size',       label: 'Size',       type: 'select', options: [''].concat(options.sizeOpts  || []), value: filters.size },
      { key: 'ageHrsMin',  label: 'Min Age (h)',type: 'chips',  options: options.ageOpts || [], value: filters.ageHrsMin },
    ];
    function pretty(opt) { return opt === '' ? 'All' : opt; }
    facets.forEach(f => f.options = f.options.map(pretty));
  
    function onFacetChange(e) {
      const next = e.detail || {};
      for (const k of Object.keys(next)) if (next[k] === 'All') next[k] = '';
      const qs = new URLSearchParams();
      if (next.from)       qs.set('from', next.from);
      if (next.to)         qs.set('to', next.to);
      if (next.supplierId) qs.set('supplierId', next.supplierId);
      if (next.shade)      qs.set('shade', next.shade);
      if (next.size)       qs.set('size', next.size);
      if (next.ageHrsMin)  qs.set('ageHrsMin', next.ageHrsMin);
      const q = qs.toString();
      goto(q ? `?${q}` : '?', { replaceState: true });
    }
  
    // Lanes table
    const laneCols = [
      { key: 'from', label: 'From', align: 'left' },
      { key: 'to',   label: 'To',   align: 'left' },
      { key: 'jobs', label: 'Jobs', align: 'right' },
      { key: 'qty',  label: 'Qty (t)', align: 'right' },
    ];
  
    // Dispatch rows table
    const cols = [
      { key: 'createdAt',   label: 'Date',        align: 'left' },
      { key: 'transportId', label: 'Transport',   align: 'left' },
      { key: 'fromMmaCode', label: 'From',        align: 'left' },
      { key: 'toMmaCode',   label: 'To',          align: 'left' },
      { key: 'supplierId',  label: 'Supplier',    align: 'right', width: '90px' },
      { key: 'shade',       label: 'Shade',       align: 'left' },
      { key: 'size',        label: 'Size',        align: 'left' },
      { key: 'qty',         label: 'Qty (t)',     align: 'right' },
      { key: 'ageHrs',      label: 'Age (hrs)',   align: 'right' },
    ];
  
    const rows = (data.rows || []).map(r => ({
      ...r,
      createdAt: new Date(r.createdAt).toISOString().slice(0,10),
    }));
  </script>
  
  <ReportShell title="Transport — In-Transit" dateRange="Live Data" {tabs}>
    <KPIBar items={kpis} />
  
    <div style="margin:1rem 0;">
      <FacetPanel facets={facets} on:change={onFacetChange} />
    </div>
  
    <h2 style="margin:1.25rem 0 .5rem;">Unsettled by Lane</h2>
    <SmartTable columns={laneCols} rows={lanes} />
  
    <h2 style="margin:1.25rem 0 .5rem;">Open Dispatches</h2>
    <SmartTable columns={cols} rows={rows} />
  </ReportShell>
  