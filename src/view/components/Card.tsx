import { useState, useRef, useEffect } from 'react'
import { Paper, Typography, TextField, Box, LinearProgress, Checkbox } from '@mui/material'
import type { Card as CardType } from '../../types'
import { useBoardStore } from '../../store/useBoardStore'

interface CardProps {
  card: CardType
}

function Card({ card }: CardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(card.title)
  const inputRef = useRef<HTMLInputElement>(null)
  const editCardTitle = useBoardStore((state) => state.editCardTitle)
  const selectCard = useBoardStore((state) => state.selectCard)
  const selectedCardId = useBoardStore((state) => state.selectedCardId)
  const selectedCardIds = useBoardStore((state) => state.selectedCardIds)
  const toggleCardSelection = useBoardStore((state) => state.toggleCardSelection)
  const toggleSubtask = useBoardStore((state) => state.toggleSubtask)
  const isSelected = selectedCardId === card.id || selectedCardIds.includes(card.id)

  const progress = card.subtasks.length
    ? Math.round((card.subtasks.filter((st) => st.completed).length / card.subtasks.length) * 100)
    : 0

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== card.title) {
      editCardTitle(card.id, trimmed)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(card.title)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const multi = e.shiftKey || e.ctrlKey || e.metaKey
    toggleCardSelection(card.id, multi)
    selectCard(card.id)
  }

  if (isEditing) {
    return (
      <Paper elevation={1} sx={{ p: 1.5 }}>
        <TextField
          inputRef={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          size="small"
          fullWidth
          variant="outlined"
        />
      </Paper>
    )
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: 1.5,
        cursor: 'pointer',
        border: isSelected ? 2 : 0,
        borderColor: 'primary.main',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
      onClick={handleClick}
      onDoubleClick={() => setIsEditing(true)}
    >
      <Typography variant="body2">{card.title}</Typography>

      {card.subtasks.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 1 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
            {card.subtasks.map((st) => (
              <Box key={st.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Checkbox
                  checked={st.completed}
                  size="small"
                  sx={{ p: 0 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSubtask(card.id, st.id)
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ textDecoration: st.completed ? 'line-through' : 'none', opacity: st.completed ? 0.6 : 1 }}
                >
                  {st.title}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  )
}

export default Card
