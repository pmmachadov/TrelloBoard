import { useState, useRef, useEffect } from 'react'
import {
  Paper,
  Typography,
  TextField,
  Box,
  LinearProgress,
  Checkbox,
  Button,
  Link,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import type { Card as CardType } from '../../types'
import { useBoardStore } from '../../store/useBoardStore'

interface CardProps {
  card: CardType
}

function Card({ card }: CardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(card.title)
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const subtaskInputRef = useRef<HTMLInputElement>(null)
  const editCardTitle = useBoardStore((state) => state.editCardTitle)
  const selectCard = useBoardStore((state) => state.selectCard)
  const selectedCardId = useBoardStore((state) => state.selectedCardId)
  const selectedCardIds = useBoardStore((state) => state.selectedCardIds)
  const toggleCardSelection = useBoardStore((state) => state.toggleCardSelection)
  const toggleSubtask = useBoardStore((state) => state.toggleSubtask)
  const toggleCardChecklist = useBoardStore((state) => state.toggleCardChecklist)
  const addSubtask = useBoardStore((state) => state.addSubtask)
  const deleteSubtask = useBoardStore((state) => state.deleteSubtask)
  const deleteCard = useBoardStore((state) => state.deleteCard)
  const isSelected = selectedCardId === card.id || selectedCardIds.includes(card.id)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const progress = card.subtasks.length
    ? Math.round((card.subtasks.filter((st) => st.completed).length / card.subtasks.length) * 100)
    : 0

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (isAddingSubtask && subtaskInputRef.current) {
      subtaskInputRef.current.focus()
    }
  }, [isAddingSubtask])

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

  const handleAddSubtask = () => {
    const trimmed = newSubtaskTitle.trim()
    if (trimmed) {
      addSubtask(card.id, trimmed)
    }
    setNewSubtaskTitle('')
    setIsAddingSubtask(false)
  }

  const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      handleAddSubtask()
    } else if (e.key === 'Escape') {
      e.stopPropagation()
      setIsAddingSubtask(false)
      setNewSubtaskTitle('')
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
        border: isSelected ? 2 : 0,
        borderColor: 'primary.main',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
      onClick={handleClick}
      onDoubleClick={() => setIsEditing(true)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="body2" sx={{ flex: 1 }}>{card.title}</Typography>
        <IconButton
          size="small"
          sx={{ p: 0.2 }}
          onClick={(e) => {
            e.stopPropagation()
            setConfirmOpen(true)
          }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>

      <Box sx={{ mt: 1 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 1 }} />

        {card.isChecklist && (
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
                  sx={{
                    flex: 1,
                    textDecoration: st.completed ? 'line-through' : 'none',
                    opacity: st.completed ? 0.6 : 1,
                  }}
                >
                  {st.title}
                </Typography>
                <IconButton
                  size="small"
                  sx={{ p: 0.2 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSubtask(card.id, st.id)
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}
            {isAddingSubtask ? (
              <TextField
                inputRef={subtaskInputRef}
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={handleSubtaskKeyDown}
                onBlur={handleAddSubtask}
                placeholder="New item..."
                size="small"
                fullWidth
              />
            ) : (
              <Button
                size="small"
                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsAddingSubtask(true)
                }}
              >
                + Add an item
              </Button>
            )}
          </Box>
        )}

        <Link
          component="button"
          variant="caption"
          underline="hover"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            toggleCardChecklist(card.id)
          }}
        >
          {card.isChecklist ? 'Remove checklist' : 'Add checklist'}
        </Link>
      </Box>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete card?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{card.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              deleteCard(card.id)
              setConfirmOpen(false)
            }}
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default Card
