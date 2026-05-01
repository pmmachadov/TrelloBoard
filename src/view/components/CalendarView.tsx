import { useMemo, useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  setMonth,
  setYear,
} from 'date-fns'
import { Paper, Typography, Box, IconButton, Select, MenuItem, FormControl } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Fuse from 'fuse.js'
import { useBoardStore } from '../../store/useBoardStore'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const cards = useBoardStore((state) => state.cards)
  const searchQuery = useBoardStore((state) => state.searchQuery)

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

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
    const fuse = new Fuse(dayCards, {
      keys: ['title'],
      threshold: 0.4,
    })
    return fuse.search(searchQuery).map((r) => r.item)
  }

  const today = new Date()
  const currentYear = currentMonth.getFullYear()
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 5 + i)

  return (
    <Box sx={{ flex: 1, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
        <IconButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeftIcon />
        </IconButton>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={currentMonth.getMonth()}
            onChange={(e) => setCurrentMonth(setMonth(currentMonth, Number(e.target.value)))}
            variant="outlined"
          >
            {MONTHS.map((m, i) => (
              <MenuItem key={m} value={i}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 90 }}>
          <Select
            value={currentYear}
            onChange={(e) => setCurrentMonth(setYear(currentMonth, Number(e.target.value)))}
            variant="outlined"
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <IconButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <Typography key={d} variant="caption" sx={{ textAlign: 'center', fontWeight: 600 }}>
            {d}
          </Typography>
        ))}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayCards = filteredCards(cardsByDay[key] ?? [])
          const isCurrentMonth = isSameMonth(day, currentMonth)
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
