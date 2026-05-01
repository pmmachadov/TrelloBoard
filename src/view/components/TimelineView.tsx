import { useMemo } from 'react'
import { Paper, Typography, Box, LinearProgress } from '@mui/material'
import { format, compareAsc } from 'date-fns'
import Fuse from 'fuse.js'
import { useBoardStore } from '../../store/useBoardStore'

function TimelineView() {
  const cards = useBoardStore((state) => state.cards)
  const searchQuery = useBoardStore((state) => state.searchQuery)

  const sortedCards = useMemo(() => {
    let list = Object.values(cards).filter((c) => c.dueDate)
    if (searchQuery.trim()) {
      const fuse = new Fuse(list, {
        keys: ['title'],
        threshold: 0.4,
      })
      list = fuse.search(searchQuery).map((r) => r.item)
    }
    return list.sort((a, b) => compareAsc(new Date(a.dueDate!), new Date(b.dueDate!)))
  }, [cards, searchQuery])

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Timeline
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sortedCards.map((card) => {
          const progress =
            card.subtasks.length > 0
              ? Math.round((card.subtasks.filter((st) => st.completed).length / card.subtasks.length) * 100)
              : 0

          return (
            <Paper key={card.id} elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">{card.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {card.dueDate ? format(new Date(card.dueDate), 'MMM d, yyyy') : ''}
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {progress}% complete
              </Typography>
            </Paper>
          )
        })}
      </Box>
    </Box>
  )
}

export default TimelineView
