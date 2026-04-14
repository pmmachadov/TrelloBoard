import { describe, it, expect, beforeEach } from 'vitest'
import { useBoardStore } from '../../store/useBoardStore'

describe('useBoardStore', () => {
  beforeEach(() => {
    useBoardStore.setState({
      boards: {},
      columns: {},
      cards: {},
      boardIds: [],
    })
  })

  it('adds a board', () => {
    const board = useBoardStore.getState().addBoard('My Board')
    expect(useBoardStore.getState().boards[board.id].title).toBe('My Board')
    expect(useBoardStore.getState().boardIds).toContain(board.id)
  })

  it('deletes a board and its children', () => {
    const state = useBoardStore.getState()
    const board = state.addBoard('My Board')
    const column = state.addColumn(board.id, 'To Do')
    const card = state.addCard(column.id, 'Task')

    state.deleteBoard(board.id)

    expect(useBoardStore.getState().boards[board.id]).toBeUndefined()
    expect(useBoardStore.getState().columns[column.id]).toBeUndefined()
    expect(useBoardStore.getState().cards[card.id]).toBeUndefined()
  })

  it('renames a board', () => {
    const state = useBoardStore.getState()
    const board = state.addBoard('Old')
    state.renameBoard(board.id, 'New')
    expect(useBoardStore.getState().boards[board.id].title).toBe('New')
  })

  it('adds a column', () => {
    const state = useBoardStore.getState()
    const board = state.addBoard('My Board')
    const column = state.addColumn(board.id, 'To Do')
    expect(useBoardStore.getState().columns[column.id].title).toBe('To Do')
    expect(useBoardStore.getState().boards[board.id].columnIds).toContain(
      column.id
    )
  })

  it('deletes a column and its cards', () => {
    const state = useBoardStore.getState()
    const board = state.addBoard('My Board')
    const column = state.addColumn(board.id, 'To Do')
    const card = state.addCard(column.id, 'Task')
    state.deleteColumn(column.id)
    expect(useBoardStore.getState().columns[column.id]).toBeUndefined()
    expect(useBoardStore.getState().cards[card.id]).toBeUndefined()
  })

  it('renames a column', () => {
    const state = useBoardStore.getState()
    const board = state.addBoard('My Board')
    const column = state.addColumn(board.id, 'Old')
    state.renameColumn(column.id, 'New')
    expect(useBoardStore.getState().columns[column.id].title).toBe('New')
  })

  it('reorders columns', () => {
    const state = useBoardStore.getState()
    const board = state.addBoard('My Board')
    const colA = state.addColumn(board.id, 'A')
    const colB = state.addColumn(board.id, 'B')
    const colC = state.addColumn(board.id, 'C')
    state.reorderColumn(board.id, 2, 0)
    expect(useBoardStore.getState().boards[board.id].columnIds).toEqual([
      colC.id,
      colA.id,
      colB.id,
    ])
  })

  it('adds a card', () => {
    const state = useBoardStore.getState()
    const board = state.addBoard('My Board')
    const column = state.addColumn(board.id, 'To Do')
    const card = state.addCard(column.id, 'Task')
    expect(useBoardStore.getState().cards[card.id].title).toBe('Task')
    expect(useBoardStore.getState().columns[column.id].cardIds).toContain(
      card.id
    )
  })

  it('deletes a card', () => {
    const state = useBoardStore.getState()
    const board = state.addBoard('My Board')
    const column = state.addColumn(board.id, 'To Do')
    const card = state.addCard(column.id, 'Task')
    state.deleteCard(card.id)
    expect(useBoardStore.getState().cards[card.id]).toBeUndefined()
    expect(
      useBoardStore.getState().columns[column.id].cardIds
    ).not.toContain(card.id)
  })

  it('edits a card title', () => {
    const state = useBoardStore.getState()
    const board = state.addBoard('My Board')
    const column = state.addColumn(board.id, 'To Do')
    const card = state.addCard(column.id, 'Old')
    state.editCardTitle(card.id, 'New')
    expect(useBoardStore.getState().cards[card.id].title).toBe('New')
  })

  it('moves a card within a column', () => {
    const state = useBoardStore.getState()
    const board = state.addBoard('My Board')
    const column = state.addColumn(board.id, 'To Do')
    const cardA = state.addCard(column.id, 'A')
    const cardB = state.addCard(column.id, 'B')
    const cardC = state.addCard(column.id, 'C')
    state.moveCardWithinColumn(column.id, 0, 2)
    expect(useBoardStore.getState().columns[column.id].cardIds).toEqual([
      cardB.id,
      cardC.id,
      cardA.id,
    ])
  })

  it('moves a card between columns', () => {
    const state = useBoardStore.getState()
    const board = state.addBoard('My Board')
    const colA = state.addColumn(board.id, 'To Do')
    const colB = state.addColumn(board.id, 'Done')
    const card = state.addCard(colA.id, 'Task')
    state.moveCardBetweenColumns(colA.id, colB.id, 0, 0)
    expect(useBoardStore.getState().columns[colA.id].cardIds).toEqual([])
    expect(useBoardStore.getState().columns[colB.id].cardIds).toEqual([card.id])
    expect(useBoardStore.getState().cards[card.id].columnId).toBe(colB.id)
  })
})
