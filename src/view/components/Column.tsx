import { Paper, Typography, Box } from '@mui/material'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Column as ColumnType } from '../../types'
import { useBoardStore } from '../../store/useBoardStore'
import SortableCard from './SortableCard'

interface ColumnProps {
  column: ColumnType
}

function Column({ column }: ColumnProps) {
  const cards = useBoardStore((state) => state.cards)
  const columnCards = column.cardIds.map((id) => cards[id]).filter(Boolean)

  return (
    <Paper
      elevation={2}
      sx={{
        minWidth: 280,
        maxWidth: 280,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {column.title}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          pb: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <SortableContext
          items={column.cardIds}
          strategy={verticalListSortingStrategy}
        >
          {columnCards.map((card) => (
            <SortableCard key={card.id} card={card} />
          ))}
        </SortableContext>
      </Box>
    </Paper>
  )
}

export default Column
