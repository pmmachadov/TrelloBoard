import { describe, it, expect, beforeEach } from 'vitest'
import { useBoardStore } from '../../store/useBoardStore'
import { createBoard, createColumn, createCard } from '../../model/boardModel'

function resetStore() {
  useBoardStore.setState({
    boards: {},
    columns: {},
    cards: {},
    boardIds: [],
    activeBoardId: null,
    undoStack: [],
    redoStack: [],
    isSaving: false,
    isLoaded: true,
    selectedCardId: null,
    viewMode: 'board',
    searchQuery: '',
    zenMode: false,
    selectedCardIds: [],
  })
}

describe('undo/redo', () => {
  beforeEach(() => {
    resetStore()
  })

  it('should undo adding a board', () => {
    const board = createBoard('Test Board')
    useBoardStore.getState().addBoard(board)

    expect(useBoardStore.getState().boards[board.id]).toBeDefined()

    useBoardStore.getState().undo()

    expect(useBoardStore.getState().boards[board.id]).toBeUndefined()
    expect(useBoardStore.getState().boardIds).toEqual([])
  })

  it('should redo after undo', () => {
    const board = createBoard('Test Board')
    useBoardStore.getState().addBoard(board)
    useBoardStore.getState().undo()

    expect(useBoardStore.getState().boards[board.id]).toBeUndefined()

    useBoardStore.getState().redo()

    expect(useBoardStore.getState().boards[board.id]).toBeDefined()
    expect(useBoardStore.getState().boardIds).toContain(board.id)
  })

  it('should clear redo stack on new action', () => {
    const board1 = createBoard('Board 1')
    const board2 = createBoard('Board 2')

    useBoardStore.getState().addBoard(board1)
    useBoardStore.getState().addBoard(board2)
    useBoardStore.getState().undo()

    expect(useBoardStore.getState().redoStack.length).toBe(1)

    const board3 = createBoard('Board 3')
    useBoardStore.getState().addBoard(board3)

    expect(useBoardStore.getState().redoStack.length).toBe(0)
  })

  it('should undo card title edit', () => {
    const board = createBoard('Board')
    useBoardStore.getState().addBoard(board)

    const column = createColumn(board.id, 'Col')
    useBoardStore.getState().addColumn(board.id, column)

    const card = createCard(column.id, 'Original')
    useBoardStore.getState().addCard(column.id, card)
    useBoardStore.getState().editCardTitle(card.id, 'Changed')

    expect(useBoardStore.getState().cards[card.id].title).toBe('Changed')

    useBoardStore.getState().undo()

    expect(useBoardStore.getState().cards[card.id].title).toBe('Original')
  })

  it('should limit undo stack to 50 items', () => {
    const board = createBoard('Board')
    useBoardStore.getState().addBoard(board)

    for (let i = 0; i < 55; i++) {
      const column = createColumn(board.id, `Col ${i}`)
      useBoardStore.getState().addColumn(board.id, column)
    }

    expect(useBoardStore.getState().undoStack.length).toBe(50)
  })

  it('should not undo when stack is empty', () => {
    const stateBefore = useBoardStore.getState()
    useBoardStore.getState().undo()
    const stateAfter = useBoardStore.getState()

    expect(stateAfter).toBe(stateBefore)
  })

  it('should not redo when stack is empty', () => {
    const stateBefore = useBoardStore.getState()
    useBoardStore.getState().redo()
    const stateAfter = useBoardStore.getState()

    expect(stateAfter).toBe(stateBefore)
  })
})
