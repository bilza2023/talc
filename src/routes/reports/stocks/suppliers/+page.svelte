
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
  
    const { filters, options, kpis, leaderboard, detail } = data;
  
    // Build facets: use chips for station/family, selects for shade/size, and supplierId select
    const facets = [
      { key: 'station',    label: 'Station',    type: 'chips',  options: [''].concat(options.stations || []), value: filters.station },
      { key: 'family',     label: 'Family',     type: 'chips',  options: [''].concat(options.families || []), value: filters.family },
      { key: 'shade',      label: 'Shade',      type: 'select', options: [''].concat(options.shades   || []), value: filters.shade },
      { key: 'size',       label: 'Size',       type: 'select', options: [''].concat(options.sizes    || []), value: filters.size },
      { key: 'supplierId', label: 'Supplier ID',type: 'select', options: [''].concat(options.supplierIds || []), value: filters.supplierId },
    ];
    function pretty(opt) { return opt === '' ? 'All' : opt; }
    facets.forEach(f => f.options = f.options.map(pretty));
  
    function onFacetChange(e) {
      const next = e.detail || {};
      for (const k of Object.keys(next)) if (next[k] === 'All') next[k] = '';
      const qs = new URLSearchParams();
      if (next.station)    qs.set('station', next.station);
      if (next.family)     qs.set('family', next.family);
      if (next.shade)      qs.set('shade', next.shade);
      if (next.size)       qs.set('size', next.size);
      if (next.supplierId) qs.set('supplierId', next.supplierId);
      const q = qs.toString();
      goto(q ? `?${q}` : '?', { replaceState: true });
    }
  
    const lbCols = [
      { key: 'supplierName', label: 'Supplier', align: 'left' },
      { key: 'supplierId',   label: 'ID',       align: 'right', width: '80px' },
      { key: 'qty',          label: 'Qty (t)',  align: 'right' },
    ];
  
    const detCols = [
      { key: 'mmaCode', label: 'MMA',     align: 'left' },
      { key: 'shade',   label: 'Shade',   align: 'left' },
      { key: 'size',    label: 'Size',    align: 'left' },
      { key: 'qty',     label: 'Qty (t)', align: 'right' },
    ];
  </script>
  
  <ReportShell title="Stocks — Suppliers" dateRange="Live Data" {tabs}>
    <KPIBar items={kpis} />
  
    <div style="margin:1rem 0;">
      <FacetPanel facets={facets} on:change={onFacetChange} />
    </div>
  
    <h2 style="margin:1.25rem 0 .5rem;">Supplier Leaderboard</h2>
    <SmartTable columns={lbCols} rows={leaderboard} />
  
    {#if detail?.supplier}
      <h2 style="margin:1.25rem 0 .5rem;">
        Slots for Supplier: {detail.supplier.name} (ID {detail.supplier.id})
      </h2>
      <SmartTable columns={detCols} rows={detail.rows} />
    {/if}
  </ReportShell>
  
