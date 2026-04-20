import { create } from 'zustand'
import type { BoardData, Board, Column, Card } from '../types'
import {
  addBoard as addBoardModel,
  addColumn as addColumnModel,
  addCard as addCardModel,
  moveCardBetweenColumns,
  moveCardWithinColumn,
  reorderColumns as reorderColumnsModel,
  deleteCard as deleteCardModel,
  editCardTitle as editCardTitleModel,
} from '../model/boardModel'

export type BoardStore = BoardData & {
  activeBoardId: string | null

  setActiveBoardId: (id: string | null) => void
  addBoard: (board: Board) => void
  addColumn: (boardId: string, column: Column) => void
  addCard: (columnId: string, card: Card) => void
  moveCardWithinColumn: (columnId: string, startIndex: number, endIndex: number) => void
  moveCardBetweenColumns: (
    sourceColumnId: string,
    targetColumnId: string,
    sourceIndex: number,
    targetIndex: number
  ) => void
  reorderColumns: (boardId: string, startIndex: number, endIndex: number) => void
  deleteCard: (cardId: string) => void
  editCardTitle: (cardId: string, title: string) => void
}

const initialState: BoardData = {
  boards: {},
  columns: {},
  cards: {},
  boardIds: [],
}

export const useBoardStore = create<BoardStore>((set) => ({
  ...initialState,
  activeBoardId: null,

  setActiveBoardId: (id) => set({ activeBoardId: id }),

  addBoard: (board) =>
    set((state) => addBoardModel(state, board)),

  addColumn: (boardId, column) =>
    set((state) => addColumnModel(state, boardId, column)),

  addCard: (columnId, card) =>
    set((state) => addCardModel(state, columnId, card)),

  moveCardWithinColumn: (columnId, startIndex, endIndex) =>
    set((state) => moveCardWithinColumn(state, columnId, startIndex, endIndex)),

  moveCardBetweenColumns: (sourceColumnId, targetColumnId, sourceIndex, targetIndex) =>
    set((state) =>
      moveCardBetweenColumns(state, sourceColumnId, targetColumnId, sourceIndex, targetIndex)
    ),

  reorderColumns: (boardId, startIndex, endIndex) =>
    set((state) => reorderColumnsModel(state, boardId, startIndex, endIndex)),

  deleteCard: (cardId) =>
    set((state) => deleteCardModel(state, cardId)),

  editCardTitle: (cardId, title) =>
    set((state) => editCardTitleModel(state, cardId, title)),
}))
