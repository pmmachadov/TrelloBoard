import { useRef, useState } from 'react'
import { Paper, Typography, Box, Button, TextField, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { useVirtualizer } from '@tanstack/react-virtual'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Column as ColumnType } from '../../types'
import { useBoardStore } from '../../store/useBoardStore'
import { createCard } from '../../model/boardModel'
import SortableCard from './SortableCard'

interface ColumnProps {
  column: ColumnType
}

function Column({ column }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const cards = useBoardStore((state) => state.cards)
  const addCard = useBoardStore((state) => state.addCard)
  const deleteColumn = useBoardStore((state) => state.deleteColumn)
  const columnCards = column.cardIds.map((id) => cards[id]).filter(Boolean)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: columnCards.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const useVirtual = virtualItems.length > 0 && columnCards.length > 10

  const handleSave = () => {
    const trimmed = newTitle.trim()
    if (trimmed) {
      const card = createCard(column.id, trimmed)
      addCard(column.id, card)
    }
    setNewTitle('')
    setIsAdding(false)
  }

  const handleCancel = () => {
    setNewTitle('')
    setIsAdding(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

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
        borderRadius: 3,
      }}
    >
      <Box sx={{ p: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {column.title}
        </Typography>
        <IconButton
          size="small"
          sx={{ p: 0.2 }}
          onClick={() => setConfirmOpen(true)}
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <Box
        ref={parentRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          pb: 1,
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

      <Box sx={{ px: 2, pb: 2, pt: 1 }}>
        {isAdding ? (
          <TextField
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            placeholder="Enter a title..."
            size="small"
            fullWidth
          />
        ) : (
          <Button
            fullWidth
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setIsAdding(true)}
            sx={{ justifyContent: 'flex-start' }}
          >
            Add a card
          </Button>
        )}
      </Box>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete column?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{column.title}"? All {columnCards.length} cards inside will be removed. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              deleteColumn(column.id)
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

export default Column
