import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, Paper, Button, TextField } from '@mui/material'
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import AddIcon from '@mui/icons-material/Add'
import { useBoardStore } from '../../store/useBoardStore'
import { createBoard, createColumn, createCard } from '../../model/boardModel'
import { useAutoSave } from '../../controller/useAutoSave'
import { useKeyboardShortcuts } from '../../controller/useKeyboardShortcuts'
import SortableColumn from '../components/SortableColumn'
import CommandPalette from '../components/CommandPalette'
import ViewSwitcher from '../components/ViewSwitcher'
import SearchBar from '../components/SearchBar'
import TableView from '../components/TableView'
import CalendarView from '../components/CalendarView'
import TimelineView from '../components/TimelineView'
import ImportExport from '../components/ImportExport'

function BoardPage() {
  useAutoSave()

  const [paletteOpen, setPaletteOpen] = useState(false)
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')
  useKeyboardShortcuts(() => setPaletteOpen(true))

  const { boardId } = useParams<{ boardId: string }>()

  const boards = useBoardStore((state) => state.boards)
  const columns = useBoardStore((state) => state.columns)
  const isLoaded = useBoardStore((state) => state.isLoaded)
  const viewMode = useBoardStore((state) => state.viewMode)
  const addBoard = useBoardStore((state) => state.addBoard)
  const addColumn = useBoardStore((state) => state.addColumn)
  const moveCardWithinColumn = useBoardStore((state) => state.moveCardWithinColumn)
  const moveCardBetweenColumns = useBoardStore((state) => state.moveCardBetweenColumns)
  const reorderColumns = useBoardStore((state) => state.reorderColumns)
  const selectCard = useBoardStore((state) => state.selectCard)
  const setViewMode = useBoardStore((state) => state.setViewMode)
  const clearCardSelection = useBoardStore((state) => state.clearCardSelection)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const addCard = useBoardStore((state) => state.addCard)

  useEffect(() => {
    if (!isLoaded) return

    const state = useBoardStore.getState()

    if (boardId === 'default') {
      let currentBoard = state.boards['default']

      if (!currentBoard) {
        currentBoard = { ...createBoard('Project Board'), id: 'default' }
        addBoard(currentBoard)
      }

      const hasValidColumns =
        currentBoard.columnIds.length > 0 &&
        currentBoard.columnIds.some((id) => state.columns[id])

      if (!hasValidColumns) {
        const todo = createColumn(currentBoard.id, 'To Do')
        const inProgress = createColumn(currentBoard.id, 'In Progress')
        const done = createColumn(currentBoard.id, 'Done')
        addColumn(currentBoard.id, todo)
        addColumn(currentBoard.id, inProgress)
        addColumn(currentBoard.id, done)

        const card1 = {
          ...createCard(todo.id, 'Design homepage'),
          dueDate: new Date(2026, 4, 5),
          subtasks: [
            { id: 'st-1', title: 'Wireframes', completed: true },
            { id: 'st-2', title: 'Mockups', completed: false },
            { id: 'st-3', title: 'Design system', completed: false },
          ],
          isChecklist: true,
        }
        const card2 = {
          ...createCard(todo.id, 'Setup CI/CD'),
          dueDate: new Date(2026, 4, 8),
          subtasks: [
            { id: 'st-4', title: 'GitHub Actions', completed: true },
            { id: 'st-5', title: 'Docker build', completed: true },
          ],
          isChecklist: true,
        }
        const card3 = {
          ...createCard(todo.id, 'Write API documentation'),
          dueDate: new Date(2026, 4, 12),
          subtasks: [],
          isChecklist: false,
        }
        const card4 = {
          ...createCard(todo.id, 'Research competitors'),
          dueDate: new Date(2026, 4, 15),
          subtasks: [
            { id: 'st-6', title: 'Analyze top 3 apps', completed: false },
            { id: 'st-7', title: 'Write report', completed: false },
          ],
          isChecklist: true,
        }
        const card5 = {
          ...createCard(inProgress.id, 'Implement auth'),
          dueDate: new Date(2026, 4, 10),
          subtasks: [],
          isChecklist: false,
        }
        const card6 = {
          ...createCard(inProgress.id, 'Database schema'),
          dueDate: new Date(2026, 4, 7),
          subtasks: [
            { id: 'st-8', title: 'ER diagram', completed: true },
            { id: 'st-9', title: 'Migrations', completed: false },
            { id: 'st-10', title: 'Seed data', completed: false },
          ],
          isChecklist: true,
        }
        const card7 = {
          ...createCard(inProgress.id, 'Unit tests coverage'),
          dueDate: new Date(2026, 4, 14),
          subtasks: [],
          isChecklist: false,
        }
        const card8 = {
          ...createCard(done.id, 'Project scaffold'),
          dueDate: new Date(2026, 3, 28),
          subtasks: [],
          isChecklist: false,
        }
        const card9 = {
          ...createCard(done.id, 'Team onboarding'),
          dueDate: new Date(2026, 3, 25),
          subtasks: [
            { id: 'st-11', title: 'Repo access', completed: true },
            { id: 'st-12', title: 'Local setup', completed: true },
            { id: 'st-13', title: 'Code guidelines', completed: true },
          ],
          isChecklist: true,
        }
        const card10 = {
          ...createCard(done.id, 'Define MVP scope'),
          dueDate: new Date(2026, 3, 20),
          subtasks: [],
          isChecklist: false,
        }
        addCard(todo.id, card1)
        addCard(todo.id, card2)
        addCard(todo.id, card3)
        addCard(todo.id, card4)
        addCard(inProgress.id, card5)
        addCard(inProgress.id, card6)
        addCard(inProgress.id, card7)
        addCard(done.id, card8)
        addCard(done.id, card9)
        addCard(done.id, card10)
      }
    }
  }, [isLoaded, boardId, addBoard, addColumn, addCard])

  const board = boardId ? boards[boardId] : null
  const boardColumns = board
    ? board.columnIds.map((id) => columns[id]).filter(Boolean)
    : []

  const handleSaveColumn = () => {
    const trimmed = newColumnTitle.trim()
    if (trimmed && board) {
      const column = createColumn(board.id, trimmed)
      addColumn(board.id, column)
    }
    setNewColumnTitle('')
    setIsAddingColumn(false)
  }

  const handleCancelColumn = () => {
    setNewColumnTitle('')
    setIsAddingColumn(false)
  }

  const handleColumnKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveColumn()
    } else if (e.key === 'Escape') {
      handleCancelColumn()
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeType = active.data.current?.type

    if (activeType === 'column' && board) {
      const oldIndex = board.columnIds.indexOf(active.id as string)
      const newIndex = board.columnIds.indexOf(over.id as string)
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderColumns(board.id, oldIndex, newIndex)
      }
      return
    }

    if (activeType === 'card') {
      const activeCardId = active.id as string
      const overId = over.id as string

      let sourceColumnId: string | null = null
      for (const col of Object.values(columns)) {
        if (col.cardIds.includes(activeCardId)) {
          sourceColumnId = col.id
          break
        }
      }
      if (!sourceColumnId) return

      const sourceIndex = columns[sourceColumnId].cardIds.indexOf(activeCardId)

      let targetColumnId: string | null = null
      let targetIndex: number

      if (columns[overId]) {
        targetColumnId = overId
        targetIndex = columns[overId].cardIds.length
      } else {
        for (const col of Object.values(columns)) {
          if (col.cardIds.includes(overId)) {
            targetColumnId = col.id
            break
          }
        }
        if (!targetColumnId) return
        targetIndex = columns[targetColumnId].cardIds.indexOf(overId)
      }

      if (sourceColumnId === targetColumnId) {
        moveCardWithinColumn(sourceColumnId, sourceIndex, targetIndex)
      } else {
        moveCardBetweenColumns(sourceColumnId, targetColumnId, sourceIndex, targetIndex)
      }
    }
  }

  if (!board && boardId !== 'default') {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="h5">Board not found</Typography>
      </Box>
    )
  }

  const renderView = () => {
    switch (viewMode) {
      case 'table':
        return <TableView />
      case 'calendar':
        return <CalendarView />
      case 'timeline':
        return <TimelineView />
      default:
        return (
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              flex: 1,
              alignItems: 'flex-start',
            }}
          >
            {boardColumns.length > 0 && (
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={board!.columnIds}
                  strategy={horizontalListSortingStrategy}
                >
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {boardColumns.map((column) => (
                      <SortableColumn key={column.id} column={column} />
                    ))}
                  </Box>
                </SortableContext>
              </DndContext>
            )}
            {board && (
              <Paper
                elevation={2}
                sx={{
                  minWidth: 280,
                  maxWidth: 280,
                  maxHeight: '100%',
                  bgcolor: 'background.paper',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                {isAddingColumn ? (
                  <TextField
                    autoFocus
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    onKeyDown={handleColumnKeyDown}
                    onBlur={handleSaveColumn}
                    placeholder="Enter column title..."
                    size="small"
                    fullWidth
                  />
                ) : (
                  <Button
                    fullWidth
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setIsAddingColumn(true)}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Add a column
                  </Button>
                )}
              </Paper>
            )}
          </Box>
        )
    }
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        p: 2,
      }}
      onClick={() => {
        selectCard(null)
        clearCardSelection()
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {board?.title ?? ''}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SearchBar />
          <ImportExport />
        </Box>
      </Box>

      <ViewSwitcher current={viewMode} onChange={setViewMode} />

      <Box sx={{ flex: 1, mt: 2 }}>
        {renderView()}
      </Box>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </Box>
  )
}

export default BoardPage
