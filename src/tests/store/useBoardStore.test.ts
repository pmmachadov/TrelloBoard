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

describe('useBoardStore', () => {
  beforeEach(() => {
    resetStore()
  })

  it('should start with empty state', () => {
    const state = useBoardStore.getState()
    expect(state.boards).toEqual({})
    expect(state.columns).toEqual({})
    expect(state.cards).toEqual({})
    expect(state.boardIds).toEqual([])
    expect(state.activeBoardId).toBeNull()
  })

  it('should add a board', () => {
    const board = createBoard('My Board')
    useBoardStore.getState().addBoard(board)

    const state = useBoardStore.getState()
    expect(state.boards[board.id]).toEqual(board)
    expect(state.boardIds).toContain(board.id)
  })

  it('should add a column to a board', () => {
    const board = createBoard('My Board')
    useBoardStore.getState().addBoard(board)

    const column = createColumn(board.id, 'To Do')
    useBoardStore.getState().addColumn(board.id, column)

    const state = useBoardStore.getState()
    expect(state.columns[column.id]).toEqual(column)
    expect(state.boards[board.id].columnIds).toContain(column.id)
  })

  it('should add a card to a column', () => {
    const board = createBoard('My Board')
    useBoardStore.getState().addBoard(board)

    const column = createColumn(board.id, 'To Do')
    useBoardStore.getState().addColumn(board.id, column)

    const card = createCard(column.id, 'Task A')
    useBoardStore.getState().addCard(column.id, card)

    const state = useBoardStore.getState()
    expect(state.cards[card.id]).toEqual(card)
    expect(state.columns[column.id].cardIds).toContain(card.id)
  })

  it('should move a card between columns', () => {
    const board = createBoard('My Board')
    useBoardStore.getState().addBoard(board)

    const colA = createColumn(board.id, 'To Do')
    const colB = createColumn(board.id, 'Done')
    useBoardStore.getState().addColumn(board.id, colA)
    useBoardStore.getState().addColumn(board.id, colB)

    const card = createCard(colA.id, 'Task')
    useBoardStore.getState().addCard(colA.id, card)

    useBoardStore.getState().moveCardBetweenColumns(colA.id, colB.id, 0, 0)

    const state = useBoardStore.getState()
    expect(state.columns[colA.id].cardIds).toEqual([])
    expect(state.columns[colB.id].cardIds).toEqual([card.id])
    expect(state.cards[card.id].columnId).toBe(colB.id)
  })

  it('should reorder cards within a column', () => {
    const board = createBoard('My Board')
    useBoardStore.getState().addBoard(board)

    const column = createColumn(board.id, 'To Do')
    useBoardStore.getState().addColumn(board.id, column)

    const cardA = createCard(column.id, 'A')
    const cardB = createCard(column.id, 'B')
    const cardC = createCard(column.id, 'C')
    useBoardStore.getState().addCard(column.id, cardA)
    useBoardStore.getState().addCard(column.id, cardB)
    useBoardStore.getState().addCard(column.id, cardC)

    useBoardStore.getState().moveCardWithinColumn(column.id, 0, 2)

    const state = useBoardStore.getState()
    expect(state.columns[column.id].cardIds).toEqual([cardB.id, cardC.id, cardA.id])
  })

  it('should reorder columns within a board', () => {
    const board = createBoard('My Board')
    useBoardStore.getState().addBoard(board)

    const colA = createColumn(board.id, 'A')
    const colB = createColumn(board.id, 'B')
    const colC = createColumn(board.id, 'C')
    useBoardStore.getState().addColumn(board.id, colA)
    useBoardStore.getState().addColumn(board.id, colB)
    useBoardStore.getState().addColumn(board.id, colC)

    useBoardStore.getState().reorderColumns(board.id, 2, 0)

    const state = useBoardStore.getState()
    expect(state.boards[board.id].columnIds).toEqual([colC.id, colA.id, colB.id])
  })

  it('should delete a card', () => {
    const board = createBoard('My Board')
    useBoardStore.getState().addBoard(board)

    const column = createColumn(board.id, 'To Do')
    useBoardStore.getState().addColumn(board.id, column)

    const card = createCard(column.id, 'Task')
    useBoardStore.getState().addCard(column.id, card)

    useBoardStore.getState().deleteCard(card.id)

    const state = useBoardStore.getState()
    expect(state.cards[card.id]).toBeUndefined()
    expect(state.columns[column.id].cardIds).not.toContain(card.id)
  })

  it('should edit a card title', () => {
    const board = createBoard('My Board')
    useBoardStore.getState().addBoard(board)

    const column = createColumn(board.id, 'To Do')
    useBoardStore.getState().addColumn(board.id, column)

    const card = createCard(column.id, 'Old Title')
    useBoardStore.getState().addCard(column.id, card)

    useBoardStore.getState().editCardTitle(card.id, 'New Title')

    const state = useBoardStore.getState()
    expect(state.cards[card.id].title).toBe('New Title')
  })

  it('should set active board id', () => {
    useBoardStore.getState().setActiveBoardId('board-123')

    const state = useBoardStore.getState()
    expect(state.activeBoardId).toBe('board-123')
  })
})
