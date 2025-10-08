<script>
    import ReportShell from '$lib/components/reports/ReportShell.svelte';
    import KPIBar from '$lib/components/reports/KPIBar.svelte';
    import SmartTable from '$lib/components/reports/SmartTable.svelte';
    import FacetPanel from '$lib/components/reports/FacetPanel.svelte';
    import { goto } from '$app/navigation';
  
    export let data;
  
    const tabs = [
      { label: 'Overview',  href: '/reports/process/overview' },
    ];
  
    const { filters, kpis } = data;
  
    // single facet: lookback window
    const facets = [
      { key: 'days', label: 'Lookback', type: 'chips', options: ['', '7', '30', '90', '180', '365'], value: filters.days || '30' },
    ];
    function pretty(opt) { return opt === '' ? 'All' : opt; }
    facets.forEach(f => f.options = f.options.map(pretty));
  
    function onFacetChange(e) {
      const next = e.detail || {};
      for (const k of Object.keys(next)) if (next[k] === 'All') next[k] = '';
      const qs = new URLSearchParams();
      if (next.days) qs.set('days', next.days);
      const q = qs.toString();
      goto(q ? `?${q}` : '?', { replaceState: true });
    }
  
    const cols = [
      { key: 'date',       label: 'Date',       align: 'left' },
      { key: 'id',         label: 'Run ID',     align: 'right', width: '100px' },
      { key: 'qty',        label: 'Qty (t)',    align: 'right' },
      { key: 'wastagePct', label: 'Wastage %',  align: 'right' },
      { key: 'ht',         label: 'HT',         align: 'right' },
      { key: 'status',     label: 'Status',     align: 'left' },
    ];
  
    const rows = (data.latest || []).map(r => ({
      ...r,
      date: new Date(r.date).toISOString().slice(0, 10),
      wastagePct: r.wastagePct == null ? '—' : Number(r.wastagePct).toFixed(1),
      ht: r.ht == null ? '—' : Number(r.ht).toFixed(1),
    }));
  </script>
  
  <ReportShell title="Process — Overview" dateRange="Live Data" {tabs}>
    <KPIBar items={kpis} />
  
    <div style="margin:1rem 0;">
      <FacetPanel facets={facets} on:change={onFacetChange} />
    </div>
  
    <SmartTable columns={cols} rows={rows} />
  </ReportShell>
  