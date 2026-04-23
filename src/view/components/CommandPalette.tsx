import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Box,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useBoardStore } from '../../store/useBoardStore'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const boards = useBoardStore((state) => state.boards)
  const boardIds = useBoardStore((state) => state.boardIds)
  const [search, setSearch] = useState('')

  const filteredBoards = boardIds
    .map((id) => boards[id])
    .filter((board) => board.title.toLowerCase().includes(search.toLowerCase()))

  const handleSelect = (boardId: string) => {
    navigate(`/board/${boardId}`)
    onClose()
    setSearch('')
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Command Palette</DialogTitle>
      <Box sx={{ px: 3, pb: 2 }}>
        <TextField
          autoFocus
          fullWidth
          placeholder="Search boards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <List dense>
          {filteredBoards.map((board) => (
            <ListItem key={board.id} disablePadding>
              <ListItemButton onClick={() => handleSelect(board.id)}>
                <ListItemText primary={board.title} />
              </ListItemButton>
            </ListItem>
          ))}
          {filteredBoards.length === 0 && (
            <ListItem>
              <ListItemText secondary="No boards found" />
            </ListItem>
          )}
        </List>
      </Box>
    </Dialog>
  )
}

export default CommandPalette
