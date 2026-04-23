import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useBoardStore } from '../../store/useBoardStore'
import { createBoard, createColumn, createCard } from '../../model/boardModel'
import { useAutoSave } from '../../controller/useAutoSave'
import SortableColumn from '../components/SortableColumn'
import SaveIndicator from '../components/SaveIndicator'

function BoardPage() {
  useAutoSave()

  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()

  const boards = useBoardStore((state) => state.boards)
  const boardIds = useBoardStore((state) => state.boardIds)
  const columns = useBoardStore((state) => state.columns)
  const isLoaded = useBoardStore((state) => state.isLoaded)
  const addBoard = useBoardStore((state) => state.addBoard)
  const addColumn = useBoardStore((state) => state.addColumn)
  const addCard = useBoardStore((state) => state.addCard)
  const moveCardWithinColumn = useBoardStore((state) => state.moveCardWithinColumn)
  const moveCardBetweenColumns = useBoardStore((state) => state.moveCardBetweenColumns)
  const reorderColumns = useBoardStore((state) => state.reorderColumns)

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

      const card1 = createCard(todo.id, 'Design homepage')
      const card2 = createCard(todo.id, 'Setup CI/CD')
      const card3 = createCard(inProgress.id, 'Implement auth')
      const card4 = createCard(done.id, 'Project scaffold')
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

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {board?.title ?? 'Loading...'}
        </Typography>
        <SaveIndicator />
      </Box>

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
    </Box>
  )
}

export default BoardPage
