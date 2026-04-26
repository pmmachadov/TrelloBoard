import { useRef } from 'react'
import { Paper, Typography, Box } from '@mui/material'
import { useVirtualizer } from '@tanstack/react-virtual'
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
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: columnCards.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const useVirtual = virtualItems.length > 0 && columnCards.length > 10

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
        ref={parentRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          pb: 2,
        }}
      >
        <SortableContext
          items={column.cardIds}
          strategy={verticalListSortingStrategy}
        >
          {useVirtual ? (
            <Box sx={{ position: 'relative', height: virtualizer.getTotalSize() }}>
              {virtualItems.map((virtualItem) => {
                const card = columnCards[virtualItem.index]
                if (!card) return null
                return (
                  <Box
                    key={card.id}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <SortableCard card={card} />
                  </Box>
                )
              })}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {columnCards.map((card) => (
                <SortableCard key={card.id} card={card} />
              ))}
            </Box>
          )}
        </SortableContext>
      </Box>
    </Paper>
  )
}

export default Column
