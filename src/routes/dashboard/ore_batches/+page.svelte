<script>
  import { createSvelteTable } from '@tanstack/svelte-table'
  import { flexRender } from '@tanstack/table-core'

  import { columns } from './columns.js'
  import Table from '$lib/components/Table.svelte'

  export let data
  const rows = data?.rows ?? []

  const table = createSvelteTable({
    data: rows,
    columns,
    getCoreRowModel: true,
    getSortedRowModel: true
  })
</script>

<Table>
  <thead>
    {#each table.getHeaderGroups() as hg}
      <tr>
        {#each hg.headers as header}
          <th on:click={header.column.getToggleSortingHandler()}>
            {#if !header.isPlaceholder}
              {flexRender(header.column.columnDef.header, header.getContext())}
            {/if}
          </th>
        {/each}
      </tr>
    {/each}
  </thead>
  <tbody>
    {#each table.getRowModel().rows as row}
      <tr>
        {#each row.getVisibleCells() as cell}
          <td>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</Table>
