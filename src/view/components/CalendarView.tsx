import { useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
} from 'date-fns'
import { Paper, Typography, Box } from '@mui/material'
import { useBoardStore } from '../../store/useBoardStore'

function CalendarView() {
  const cards = useBoardStore((state) => state.cards)
  const searchQuery = useBoardStore((state) => state.searchQuery)

  const today = new Date()

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(today), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(today), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [today])

  const cardsByDay = useMemo(() => {
    const map: Record<string, typeof cards[string][]> = {}
    Object.values(cards).forEach((card) => {
      if (!card.dueDate) return
      const key = format(new Date(card.dueDate), 'yyyy-MM-dd')
      if (!map[key]) map[key] = []
      map[key].push(card)
    })
    return map
  }, [cards])

  const filteredCards = (dayCards: typeof cards[string][]) => {
    if (!searchQuery.trim()) return dayCards
    const Fuse = require('fuse.js')
    const fuse = new Fuse.default(dayCards, {
      keys: ['title'],
      threshold: 0.4,
    })
    return fuse.search(searchQuery).map((r: { item: typeof cards[string] }) => r.item)
  }

  return (
    <Box sx={{ flex: 1, overflow: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {format(today, 'MMMM yyyy')}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <Typography key={d} variant="caption" sx={{ textAlign: 'center', fontWeight: 600 }}>
            {d}
          </Typography>
        ))}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayCards = filteredCards(cardsByDay[key] ?? [])
          const isCurrentMonth = isSameMonth(day, today)
          const isToday = isSameDay(day, today)

          return (
            <Paper
              key={key}
              elevation={1}
              sx={{
                p: 1,
                minHeight: 100,
                opacity: isCurrentMonth ? 1 : 0.5,
                border: isToday ? 1 : 0,
                borderColor: 'primary.main',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: isToday ? 700 : 400 }}>
                {format(day, 'd')}
              </Typography>
              {dayCards.map((card) => (
                <Typography key={card.id} variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  {card.title}
                </Typography>
              ))}
            </Paper>
          )
        })}
      </Box>
    </Box>
  )
}

export default CalendarView
