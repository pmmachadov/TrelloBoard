import { useState, useRef, useEffect } from 'react'
import { Paper, Typography, TextField } from '@mui/material'
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
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
      onClick={() => setIsEditing(true)}
    >
      <Typography variant="body2">{card.title}</Typography>
    </Paper>
  )
}

export default Card
