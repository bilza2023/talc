
<script>
    import ReportShell from '$lib/components/reports/ReportShell.svelte';
    import KPIBar from '$lib/components/reports/KPIBar.svelte';
    import FacetPanel from '$lib/components/reports/FacetPanel.svelte';
    import SmartTable from '$lib/components/reports/SmartTable.svelte';
    import Sparkline from '$lib/components/reports/Sparkline.svelte';
    import { goto } from '$app/navigation';
  
    export let data;
  
    const tabs = [
      { label: 'Overview',  href: '/reports/process/overview' },
      { label: 'Screening', href: '/reports/process/screening' },
    ];
  
    const { filters, kpis } = data;
  
    // Just one facet (lookback days) to stay schema-safe
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
  
    // Series table & sparkline
    const trendCols = [
      { key: 'label', label: 'Date',   align: 'left' },
      { key: 'qty',   label: 'Qty (t)',align: 'right' },
    ];
    const trendRows = (data.series || []);
    const points = data.points || [];
  
    // Latest runs table
    const latestCols = [
      { key: 'date',   label: 'Date',   align: 'left' },
      { key: 'id',     label: 'Run ID', align: 'right', width: '100px' },
      { key: 'qty',    label: 'Qty (t)',align: 'right' },
      { key: 'ht',     label: 'HT',     align: 'right' },
      { key: 'status', label: 'Status', align: 'left' },
    ];
    const latestRows = (data.latest || []).map(r => ({
      ...r,
      date: new Date(r.date).toISOString().slice(0,10),
      ht: r.ht == null ? '—' : Number(r.ht).toFixed(1),
    }));
  </script>
  
  <ReportShell title="Process — Screening" dateRange="Live Data" {tabs}>
    <KPIBar items={kpis} />
  
    <div style="margin:1rem 0;">
      <FacetPanel facets={facets} on:change={onFacetChange} />
    </div>
  
    <h2 style="margin:1.25rem 0 .5rem;">Screened Qty Over Time</h2>
    <div style="padding:.5rem; border:1px solid var(--borderColor, #2a2a2e); border-radius:12px; background:var(--panelBg, #151518);">
      <Sparkline points={points} />
    </div>
  
    <h2 style="margin:1.25rem 0 .5rem;">Daily Totals</h2>
    <SmartTable columns={trendCols} rows={trendRows} />
  
    <h2 style="margin:1.25rem 0 .5rem;">Latest Screening Runs</h2>
    <SmartTable columns={latestCols} rows={latestRows} />
  </ReportShell>
  