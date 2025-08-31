export const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'stationCode', header: 'Station' },
  { accessorKey: 'gradeCode', header: 'Grade' },
  { accessorKey: 'createdTon', header: 'Created (t)' },
  { accessorKey: 'remainingTon', header: 'Remaining (t)' },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ getValue }) => new Date(getValue()).toLocaleString()
  },
  {
    accessorKey: 'closedAt',
    header: 'Closed At',
    cell: ({ getValue }) =>
      getValue() ? new Date(getValue()).toLocaleString() : '—'
  }
]
