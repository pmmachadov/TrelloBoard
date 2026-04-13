import { describe, it, expect } from 'vitest'
import type { BoardData } from '../../types'
import {
  createBoard,
  createColumn,
  createCard,
  addBoard,
  addColumn,
  addCard,
  moveCardWithinColumn,
  moveCardBetweenColumns,
  reorderColumns,
  deleteCard,
  editCardTitle,
} from '../../model/boardModel'

describe('boardModel', () => {
  const emptyData: BoardData = {
    boards: {},
    columns: {},
    cards: {},
    boardIds: [],
  }

  describe('createBoard', () => {
    it('creates a board with the given title', () => {
      const board = createBoard('My Board')
      expect(board.title).toBe('My Board')
      expect(board.columnIds).toEqual([])
      expect(board.labels).toEqual([])
      expect(board.members).toEqual([])
    })
  })

  describe('createColumn', () => {
    it('creates a column with the given title and boardId', () => {
      const column = createColumn('board-1', 'To Do')
      expect(column.title).toBe('To Do')
      expect(column.boardId).toBe('board-1')
      expect(column.cardIds).toEqual([])
    })
  })

  describe('createCard', () => {
    it('creates a card with the given title and columnId', () => {
      const card = createCard('col-1', 'Task A')
      expect(card.title).toBe('Task A')
      expect(card.columnId).toBe('col-1')
      expect(card.subtasks).toEqual([])
    })
  })

  describe('addBoard', () => {
    it('adds a board to the data', () => {
      const board = createBoard('My Board')
      const data = addBoard(emptyData, board)
      expect(data.boards[board.id]).toEqual(board)
      expect(data.boardIds).toContain(board.id)
    })
  })

  describe('addColumn', () => {
    it('adds a column to the board', () => {
      const board = createBoard('My Board')
      let data = addBoard(emptyData, board)
      const column = createColumn(board.id, 'To Do')
      data = addColumn(data, board.id, column)

      expect(data.columns[column.id]).toEqual(column)
      expect(data.boards[board.id].columnIds).toContain(column.id)
    })

    it('returns original data if board does not exist', () => {
      const column = createColumn('missing', 'To Do')
      const data = addColumn(emptyData, 'missing', column)
      expect(data).toEqual(emptyData)
    })
  })

  describe('addCard', () => {
    it('adds a card to the column', () => {
      const board = createBoard('My Board')
      let data = addBoard(emptyData, board)
      const column = createColumn(board.id, 'To Do')
      data = addColumn(data, board.id, column)
      const card = createCard(column.id, 'Task A')
      data = addCard(data, column.id, card)

      expect(data.cards[card.id]).toEqual(card)
      expect(data.columns[column.id].cardIds).toContain(card.id)
    })

    it('returns original data if column does not exist', () => {
      const card = createCard('missing', 'Task A')
      const data = addCard(emptyData, 'missing', card)
      expect(data).toEqual(emptyData)
    })
  })

  describe('moveCardWithinColumn', () => {
    it('reorders cards within the same column', () => {
      const board = createBoard('My Board')
      let data = addBoard(emptyData, board)
      const column = createColumn(board.id, 'To Do')
      data = addColumn(data, board.id, column)

      const cardA = createCard(column.id, 'A')
      const cardB = createCard(column.id, 'B')
      const cardC = createCard(column.id, 'C')
      data = addCard(data, column.id, cardA)
      data = addCard(data, column.id, cardB)
      data = addCard(data, column.id, cardC)

      data = moveCardWithinColumn(data, column.id, 0, 2)
      expect(data.columns[column.id].cardIds).toEqual([cardB.id, cardC.id, cardA.id])
    })

    it('returns original data if column does not exist', () => {
      const data = moveCardWithinColumn(emptyData, 'missing', 0, 1)
      expect(data).toEqual(emptyData)
    })
  })

  describe('moveCardBetweenColumns', () => {
    it('moves a card from one column to another', () => {
      const board = createBoard('My Board')
      let data = addBoard(emptyData, board)
      const colA = createColumn(board.id, 'To Do')
      const colB = createColumn(board.id, 'Done')
      data = addColumn(data, board.id, colA)
      data = addColumn(data, board.id, colB)

      const card = createCard(colA.id, 'Task')
      data = addCard(data, colA.id, card)

      data = moveCardBetweenColumns(data, colA.id, colB.id, 0, 0)
      expect(data.columns[colA.id].cardIds).toEqual([])
      expect(data.columns[colB.id].cardIds).toEqual([card.id])
      expect(data.cards[card.id].columnId).toBe(colB.id)
    })

    it('moves a card within the same column', () => {
      const board = createBoard('My Board')
      let data = addBoard(emptyData, board)
      const col = createColumn(board.id, 'To Do')
      data = addColumn(data, board.id, col)

      const cardA = createCard(col.id, 'A')
      const cardB = createCard(col.id, 'B')
      data = addCard(data, col.id, cardA)
      data = addCard(data, col.id, cardB)

      data = moveCardBetweenColumns(data, col.id, col.id, 0, 1)
      expect(data.columns[col.id].cardIds).toEqual([cardB.id, cardA.id])
    })

    it('inserts a card at a specific index in the target column', () => {
      const board = createBoard('My Board')
      let data = addBoard(emptyData, board)
      const colA = createColumn(board.id, 'To Do')
      const colB = createColumn(board.id, 'Done')
      data = addColumn(data, board.id, colA)
      data = addColumn(data, board.id, colB)

      const cardA = createCard(colB.id, 'A')
      const cardB = createCard(colB.id, 'B')
      data = addCard(data, colB.id, cardA)
      data = addCard(data, colB.id, cardB)

      const movedCard = createCard(colA.id, 'Moved')
      data = addCard(data, colA.id, movedCard)

      data = moveCardBetweenColumns(data, colA.id, colB.id, 0, 1)
      expect(data.columns[colB.id].cardIds).toEqual([cardA.id, movedCard.id, cardB.id])
    })

    it('returns original data if source or target column does not exist', () => {
      const data = moveCardBetweenColumns(emptyData, 'missing', 'also-missing', 0, 0)
      expect(data).toEqual(emptyData)
    })
  })

  describe('reorderColumns', () => {
    it('reorders columns within a board', () => {
      const board = createBoard('My Board')
      let data = addBoard(emptyData, board)
      const colA = createColumn(board.id, 'A')
      const colB = createColumn(board.id, 'B')
      const colC = createColumn(board.id, 'C')
      data = addColumn(data, board.id, colA)
      data = addColumn(data, board.id, colB)
      data = addColumn(data, board.id, colC)

      data = reorderColumns(data, board.id, 2, 0)
      expect(data.boards[board.id].columnIds).toEqual([colC.id, colA.id, colB.id])
    })

    it('returns original data if board does not exist', () => {
      const data = reorderColumns(emptyData, 'missing', 0, 1)
      expect(data).toEqual(emptyData)
    })
  })

  describe('deleteCard', () => {
    it('removes a card from the column and cards map', () => {
      const board = createBoard('My Board')
      let data = addBoard(emptyData, board)
      const column = createColumn(board.id, 'To Do')
      data = addColumn(data, board.id, column)
      const card = createCard(column.id, 'Task')
      data = addCard(data, column.id, card)

      data = deleteCard(data, card.id)
      expect(data.cards[card.id]).toBeUndefined()
      expect(data.columns[column.id].cardIds).not.toContain(card.id)
    })

    it('returns original data if card does not exist', () => {
      const data = deleteCard(emptyData, 'missing')
      expect(data).toEqual(emptyData)
    })
  })

  describe('editCardTitle', () => {
    it('updates the card title', () => {
      const board = createBoard('My Board')
      let data = addBoard(emptyData, board)
      const column = createColumn(board.id, 'To Do')
      data = addColumn(data, board.id, column)
      const card = createCard(column.id, 'Old')
      data = addCard(data, column.id, card)

      data = editCardTitle(data, card.id, 'New')
      expect(data.cards[card.id].title).toBe('New')
    })

    it('returns original data if card does not exist', () => {
      const data = editCardTitle(emptyData, 'missing', 'New')
      expect(data).toEqual(emptyData)
    })
  })
})
