import { useMemo } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import Fuse from 'fuse.js'
import { useBoardStore } from '../../store/useBoardStore'

function TableView() {
  const cards = useBoardStore((state) => state.cards)
  const columns = useBoardStore((state) => state.columns)
  const searchQuery = useBoardStore((state) => state.searchQuery)

  const rows = useMemo(() => {
    const cardList = Object.values(cards)
    if (!searchQuery.trim()) return cardList
    const fuse = new Fuse(cardList, {
      keys: ['title', 'description'],
      threshold: 0.4,
    })
    return fuse.search(searchQuery).map((r) => r.item)
  }, [cards, searchQuery])

  const cols = [
    { field: 'title', headerName: 'Title', flex: 1 },
    {
      field: 'column',
      headerName: 'Column',
      width: 150,
      valueGetter: (_: unknown, row: typeof cards[string]) => columns[row.columnId]?.title ?? '',
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 150,
      valueGetter: (_: unknown, row: typeof cards[string]) =>
        row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '',
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 120,
      valueGetter: (_: unknown, row: typeof cards[string]) => {
        if (row.subtasks.length === 0) return '0%'
        const done = row.subtasks.filter((st) => st.completed).length
        return `${Math.round((done / row.subtasks.length) * 100)}%`
      },
    },
  ]

  return (
    <DataGrid
      rows={rows}
      columns={cols}
      getRowId={(row) => row.id}
      density="compact"
      disableRowSelectionOnClick
      sx={{ bgcolor: 'background.paper' }}
    />
  )
}

export default TableView
