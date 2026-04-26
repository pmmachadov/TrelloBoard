import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, IconButton, Fade } from '@mui/material'
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import ZenModeIcon from '@mui/icons-material/Fullscreen'
import ZenModeExitIcon from '@mui/icons-material/FullscreenExit'
import { useBoardStore } from '../../store/useBoardStore'
import { createBoard, createColumn, createCard } from '../../model/boardModel'
import { useAutoSave } from '../../controller/useAutoSave'
import { useKeyboardShortcuts } from '../../controller/useKeyboardShortcuts'
import SortableColumn from '../components/SortableColumn'
import SaveIndicator from '../components/SaveIndicator'
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
  useKeyboardShortcuts(() => setPaletteOpen(true))

  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()

  const boards = useBoardStore((state) => state.boards)
  const boardIds = useBoardStore((state) => state.boardIds)
  const columns = useBoardStore((state) => state.columns)
  const isLoaded = useBoardStore((state) => state.isLoaded)
  const viewMode = useBoardStore((state) => state.viewMode)
  const zenMode = useBoardStore((state) => state.zenMode)
  const selectedCardId = useBoardStore((state) => state.selectedCardId)
  const addBoard = useBoardStore((state) => state.addBoard)
  const addColumn = useBoardStore((state) => state.addColumn)
  const addCard = useBoardStore((state) => state.addCard)
  const moveCardWithinColumn = useBoardStore((state) => state.moveCardWithinColumn)
  const moveCardBetweenColumns = useBoardStore((state) => state.moveCardBetweenColumns)
  const reorderColumns = useBoardStore((state) => state.reorderColumns)
  const selectCard = useBoardStore((state) => state.selectCard)
  const setViewMode = useBoardStore((state) => state.setViewMode)
  const setZenMode = useBoardStore((state) => state.setZenMode)
  const clearCardSelection = useBoardStore((state) => state.clearCardSelection)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  useEffect(() => {
    if (!isLoaded) return

    if (boardId === 'default' && boardIds.length === 0) {
      const board = createBoard('Project Board')
      addBoard(board)

      const todo = createColumn(board.id, 'To Do')
      const inProgress = createColumn(board.id, 'In Progress')
      const done = createColumn(board.id, 'Done')
      addColumn(board.id, todo)
      addColumn(board.id, inProgress)
      addColumn(board.id, done)

      const card1 = { ...createCard(todo.id, 'Design homepage'), dueDate: new Date(2026, 3, 20), subtasks: [{ id: 'st-1', title: 'Wireframes', completed: true }, { id: 'st-2', title: 'Mockups', completed: false }] }
      const card2 = { ...createCard(todo.id, 'Setup CI/CD'), dueDate: new Date(2026, 3, 22), subtasks: [{ id: 'st-3', title: 'GitHub Actions', completed: true }, { id: 'st-4', title: 'Docker build', completed: true }] }
      const card3 = { ...createCard(inProgress.id, 'Implement auth'), dueDate: new Date(2026, 3, 25), subtasks: [] }
      const card4 = { ...createCard(done.id, 'Project scaffold'), dueDate: new Date(2026, 3, 15), subtasks: [] }
      addCard(todo.id, card1)
      addCard(todo.id, card2)
      addCard(inProgress.id, card3)
      addCard(done.id, card4)

      navigate(`/board/${board.id}`, { replace: true })
    }
  }, [isLoaded, boardId, boardIds.length, addBoard, addColumn, addCard, navigate])

  const board = boardId ? boards[boardId] : null
  const boardColumns = board
    ? board.columnIds.map((id) => columns[id]).filter(Boolean)
    : []

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
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext
              items={board?.columnIds ?? []}
              strategy={horizontalListSortingStrategy}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  overflowX: 'auto',
                  flex: 1,
                }}
              >
                {boardColumns.map((column) => (
                  <SortableColumn key={column.id} column={column} />
                ))}
              </Box>
            </SortableContext>
          </DndContext>
        )
    }
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: zenMode ? 'rgba(0,0,0,0.95)' : 'background.default',
        p: 2,
      }}
      onClick={() => {
        selectCard(null)
        clearCardSelection()
      }}
    >
      <Fade in={!zenMode}>
        <Box>
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
              {board?.title ?? 'Loading...'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SearchBar />
              <ImportExport />
              <IconButton onClick={() => setZenMode(!zenMode)} color="inherit">
                {zenMode ? <ZenModeExitIcon /> : <ZenModeIcon />}
              </IconButton>
              <SaveIndicator />
            </Box>
          </Box>

          <ViewSwitcher current={viewMode} onChange={setViewMode} />
        </Box>
      </Fade>

      <Box sx={{ flex: 1, mt: 2, opacity: zenMode && !selectedCardId ? 0.3 : 1 }}>
        {renderView()}
      </Box>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </Box>
  )
}

export default BoardPage
