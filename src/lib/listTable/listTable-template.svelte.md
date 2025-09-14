<script>
    import '$lib/styles/tokens.css';
    import ListTable from '$lib/listTable/ListTable.svelte';
  
    // --- Demo data (keep rows light) ---
    const items = [
      {
        id: 1,
        slug: 'what-is-percentage',
        name: 'What is Percentage',
        type: 'note',
        tcode: 'blog',
        chEx: '—',
        status: 'published',
        views: 1542,
        editedAt: '2025-09-01T11:04:00.000Z',
        editedAtIso: '2025-09-01',
        thumbnail: '/media/images/taleem.webp'
      },
      {
        id: 2,
        slug: 'algebra-basics-intro',
        name: 'Algebra Basics — Intro',
        type: 'deck',
        tcode: 'fbise9math',
        chEx: 'Ch 2 · Ex 1',
        status: 'ready',
        views: 892,
        editedAt: '2025-08-27T07:35:00.000Z',
        editedAtIso: '2025-08-27',
        thumbnail: ''
      },
      {
        id: 3,
        slug: 'physics-kinematics-overview',
        name: 'Kinematics Overview',
        type: 'note',
        tcode: 'fbise9physics',
        chEx: 'Ch 2 · Ex 0',
        status: 'draft',
        views: 143,
        editedAt: '2025-09-09T15:10:00.000Z',
        editedAtIso: '2025-09-09',
        thumbnail: '/media/images/taleem.webp'
      },
      {
        id: 4,
        slug: 'course-fbise9math',
        name: 'Course: Class 9 Math',
        type: 'course',
        tcode: 'fbise9math',
        chEx: '—',
        status: 'published',
        views: 2210,
        editedAt: '2025-08-10T10:00:00.000Z',
        editedAtIso: '2025-08-10',
        thumbnail: ''
      },
      {
        id: 5,
        slug: 'percent-word-problems',
        name: 'Percent Word Problems',
        type: 'deck',
        tcode: 'blog',
        chEx: '—',
        status: 'archived',
        views: 45,
        editedAt: '2025-07-30T09:00:00.000Z',
        editedAtIso: '2025-07-30',
        thumbnail: '/media/images/taleem.webp'
      },
      {
        id: 6,
        slug: 'triangles-congruency',
        name: 'Triangles Congruency',
        type: 'note',
        tcode: 'fbise9math',
        chEx: 'Ch 10 · Ex 3',
        status: 'ready',
        views: 678,
        editedAt: '2025-09-11T18:22:00.000Z',
        editedAtIso: '2025-09-11',
        thumbnail: ''
      }
    ];
  
    // --- Columns exercise all kinds: text, badge, date, thumbnail, number, actions ---
    const columns = [
      { id: 'thumb',    label: '',        accessor: 'thumbnail', kind: 'thumbnail', width: '64px' },
      { id: 'name',     label: 'Title',   accessor: 'name',      kind: 'text',  primary: true, sortable: true },
      { id: 'slug',     label: 'Slug',    accessor: 'slug',      kind: 'text',  sortable: true },
      { id: 'type',     label: 'Type',    accessor: 'type',      kind: 'badge', sortable: true, align: 'center' },
      { id: 'tcode',    label: 'Tcode',   accessor: 'tcode',     kind: 'text',  sortable: true },
      { id: 'chEx',     label: 'Ch · Ex', accessor: 'chEx',      kind: 'text' },
      { id: 'status',   label: 'Status',  accessor: 'status',    kind: 'badge', sortable: true },
      { id: 'views',    label: 'Views',   accessor: 'views',     kind: 'number', sortable: true, align: 'right', width: '96px' },
      { id: 'editedAt', label: 'Edited',  accessor: 'editedAt',  kind: 'date', format: 'relative', sortable: true, width: '120px' },
      { id: 'actions',  label: '',        accessor: '__',        kind: 'actions', action: ['preview','edit','delete'], align: 'right', width: '160px' }
    ];
  
    // Search across text + non-text columns
    const searchKeys = ['name','slug','tcode','chEx','status','type'];
  
    let lastEvent = '';
  
    function handleRowClick(ev) {
      const r = ev.detail;
      lastEvent = `rowClick → ${r.slug}`;
    }
    function handleAction(ev) {
      const { actionId, row } = ev.detail;
      lastEvent = `action:${actionId} → ${row.slug}`;
      // In real pages, route by actionId here.
    }
  </script>
  
  <section class="wrap">
    <h1>Example — ListTable Template</h1>
  
    <ListTable
      items={items}
      columns={columns}
      rowKey="slug"
      searchable={true}
      searchKeys={searchKeys}
      thumbBaseUrl=""
      on:rowClick={handleRowClick}
      on:action={handleAction}
    />
  
    {#if lastEvent}
      <p class="last">{lastEvent}</p>
    {/if}
  </section>
  
  <style>
    .wrap {
      margin-inline: auto;
      padding: 1rem;
      width: min(90vw, 1100px);
      color: var(--primaryText);
    }
    h1 {
      margin: 0 0 .75rem 0;
      font-size: 1.25rem;
      color: var(--primaryText);
    }
    .last{
      margin-top: .75rem;
      padding: .5rem .75rem;
      border: 1px solid var(--borderColor);
      border-radius: 10px;
      background: var(--surfaceColor);
      color: var(--secondaryText);
    }
  </style>
  