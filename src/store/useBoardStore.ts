import { create } from 'zustand'
import type { BoardData, Board, Column, Card } from '../types'
import * as model from '../model/boardModel'

export type BoardStore = BoardData & {
  // Board actions
  addBoard: (title: string) => Board
  deleteBoard: (boardId: string) => void
  renameBoard: (boardId: string, title: string) => void

  // Column actions
  addColumn: (boardId: string, title: string) => Column
  deleteColumn: (columnId: string) => void
  renameColumn: (columnId: string, title: string) => void
  reorderColumn: (boardId: string, startIndex: number, endIndex: number) => void

  // Card actions
  addCard: (columnId: string, title: string) => Card
  deleteCard: (cardId: string) => void
  editCardTitle: (cardId: string, title: string) => void
  moveCardWithinColumn: (
    columnId: string,
    startIndex: number,
    endIndex: number
  ) => void
  moveCardBetweenColumns: (
    sourceColumnId: string,
    targetColumnId: string,
    sourceIndex: number,
    targetIndex: number
  ) => void
}

const initialState: BoardData = {
  boards: {},
  columns: {},
  cards: {},
  boardIds: [],
}

export const useBoardStore = create<BoardStore>((set) => ({
  ...initialState,

  addBoard: (title) => {
    const board = model.createBoard(title)
    set((state) => model.addBoard(state, board))
    return board
  },

  deleteBoard: (boardId) => {
    set((state) => model.deleteBoard(state, boardId))
  },

  renameBoard: (boardId, title) => {
    set((state) => model.editBoardTitle(state, boardId, title))
  },

  addColumn: (boardId, title) => {
    const column = model.createColumn(boardId, title)
    set((state) => model.addColumn(state, boardId, column))
    return column
  },

  deleteColumn: (columnId) => {
    set((state) => model.deleteColumn(state, columnId))
  },

  renameColumn: (columnId, title) => {
    set((state) => model.editColumnTitle(state, columnId, title))
  },

  reorderColumn: (boardId, startIndex, endIndex) => {
    set((state) => model.reorderColumns(state, boardId, startIndex, endIndex))
  },

  addCard: (columnId, title) => {
    const card = model.createCard(columnId, title)
    set((state) => model.addCard(state, columnId, card))
    return card
  },

  deleteCard: (cardId) => {
    set((state) => model.deleteCard(state, cardId))
  },

  editCardTitle: (cardId, title) => {
    set((state) => model.editCardTitle(state, cardId, title))
  },

  moveCardWithinColumn: (columnId, startIndex, endIndex) => {
    set((state) =>
      model.moveCardWithinColumn(state, columnId, startIndex, endIndex)
    )
  },

  moveCardBetweenColumns: (
    sourceColumnId,
    targetColumnId,
    sourceIndex,
    targetIndex
  ) => {
    set((state) =>
      model.moveCardBetweenColumns(
        state,
        sourceColumnId,
        targetColumnId,
        sourceIndex,
        targetIndex
      )
    )
  },
}))
