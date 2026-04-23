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

const HISTORY_LIMIT = 50

type HistorySnapshot = BoardData

export type BoardStore = BoardData & {
  activeBoardId: string | null
  undoStack: HistorySnapshot[]
  redoStack: HistorySnapshot[]
  isSaving: boolean
  isLoaded: boolean
  selectedCardId: string | null

  setActiveBoardId: (id: string | null) => void
  undo: () => void
  redo: () => void
  setIsSaving: (value: boolean) => void
  setIsLoaded: (value: boolean) => void
  loadData: (data: BoardData) => void
  selectCard: (cardId: string | null) => void
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
  moveSelectedCardUp: () => void
  moveSelectedCardDown: () => void
  moveSelectedCardLeft: () => void
  moveSelectedCardRight: () => void
}

const initialState: BoardData = {
  boards: {},
  columns: {},
  cards: {},
  boardIds: [],
}

function takeSnapshot(state: BoardStore): HistorySnapshot {
  return {
    boards: state.boards,
    columns: state.columns,
    cards: state.cards,
    boardIds: state.boardIds,
  }
}

export const useBoardStore = create<BoardStore>((set) => ({
  ...initialState,
  activeBoardId: null,
  undoStack: [],
  redoStack: [],
  isSaving: false,
  isLoaded: false,
  selectedCardId: null,

  setActiveBoardId: (id) => set({ activeBoardId: id }),

  setIsSaving: (value) => set({ isSaving: value }),

  setIsLoaded: (value) => set({ isLoaded: value }),

  loadData: (data) =>
    set(() => ({
      boards: data.boards,
      columns: data.columns,
      cards: data.cards,
      boardIds: data.boardIds,
      undoStack: [],
      redoStack: [],
    })),

  selectCard: (cardId) => set({ selectedCardId: cardId }),

  undo: () =>
    set((state) => {
      if (state.undoStack.length === 0) return state
      const previous = state.undoStack[state.undoStack.length - 1]
      const currentSnapshot = takeSnapshot(state)
      return {
        boards: previous.boards,
        columns: previous.columns,
        cards: previous.cards,
        boardIds: previous.boardIds,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, currentSnapshot].slice(-HISTORY_LIMIT),
        activeBoardId: state.activeBoardId,
        isSaving: state.isSaving,
        isLoaded: state.isLoaded,
        selectedCardId: state.selectedCardId,
      }
    }),

  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state
      const next = state.redoStack[state.redoStack.length - 1]
      const currentSnapshot = takeSnapshot(state)
      return {
        boards: next.boards,
        columns: next.columns,
        cards: next.cards,
        boardIds: next.boardIds,
        undoStack: [...state.undoStack, currentSnapshot].slice(-HISTORY_LIMIT),
        redoStack: state.redoStack.slice(0, -1),
        activeBoardId: state.activeBoardId,
        isSaving: state.isSaving,
        isLoaded: state.isLoaded,
        selectedCardId: state.selectedCardId,
      }
    }),

  addBoard: (board) =>
    set((state) => {
      const snapshot = takeSnapshot(state)
      return {
        ...addBoardModel(state, board),
        undoStack: [...state.undoStack, snapshot].slice(-HISTORY_LIMIT),
        redoStack: [],
      }
    }),

  addColumn: (boardId, column) =>
    set((state) => {
      const snapshot = takeSnapshot(state)
      return {
        ...addColumnModel(state, boardId, column),
        undoStack: [...state.undoStack, snapshot].slice(-HISTORY_LIMIT),
        redoStack: [],
      }
    }),

  addCard: (columnId, card) =>
    set((state) => {
      const snapshot = takeSnapshot(state)
      return {
        ...addCardModel(state, columnId, card),
        undoStack: [...state.undoStack, snapshot].slice(-HISTORY_LIMIT),
        redoStack: [],
      }
    }),

  moveCardWithinColumn: (columnId, startIndex, endIndex) =>
    set((state) => {
      const snapshot = takeSnapshot(state)
      return {
        ...moveCardWithinColumn(state, columnId, startIndex, endIndex),
        undoStack: [...state.undoStack, snapshot].slice(-HISTORY_LIMIT),
        redoStack: [],
      }
    }),

  moveCardBetweenColumns: (sourceColumnId, targetColumnId, sourceIndex, targetIndex) =>
    set((state) => {
      const snapshot = takeSnapshot(state)
      return {
        ...moveCardBetweenColumns(
          state,
          sourceColumnId,
          targetColumnId,
          sourceIndex,
          targetIndex
        ),
        undoStack: [...state.undoStack, snapshot].slice(-HISTORY_LIMIT),
        redoStack: [],
      }
    }),

  reorderColumns: (boardId, startIndex, endIndex) =>
    set((state) => {
      const snapshot = takeSnapshot(state)
      return {
        ...reorderColumnsModel(state, boardId, startIndex, endIndex),
        undoStack: [...state.undoStack, snapshot].slice(-HISTORY_LIMIT),
        redoStack: [],
      }
    }),

  deleteCard: (cardId) =>
    set((state) => {
      const snapshot = takeSnapshot(state)
      return {
        ...deleteCardModel(state, cardId),
        undoStack: [...state.undoStack, snapshot].slice(-HISTORY_LIMIT),
        redoStack: [],
        selectedCardId: state.selectedCardId === cardId ? null : state.selectedCardId,
      }
    }),

  editCardTitle: (cardId, title) =>
    set((state) => {
      const snapshot = takeSnapshot(state)
      return {
        ...editCardTitleModel(state, cardId, title),
        undoStack: [...state.undoStack, snapshot].slice(-HISTORY_LIMIT),
        redoStack: [],
      }
    }),

  moveSelectedCardUp: () =>
    set((state) => {
      if (!state.selectedCardId) return state
      const card = state.cards[state.selectedCardId]
      if (!card) return state
      const column = state.columns[card.columnId]
      const index = column.cardIds.indexOf(state.selectedCardId)
      if (index <= 0) return state
      const snapshot = takeSnapshot(state)
      return {
        ...moveCardWithinColumn(state, card.columnId, index, index - 1),
        undoStack: [...state.undoStack, snapshot].slice(-HISTORY_LIMIT),
        redoStack: [],
      }
    }),

  moveSelectedCardDown: () =>
    set((state) => {
      if (!state.selectedCardId) return state
      const card = state.cards[state.selectedCardId]
      if (!card) return state
      const column = state.columns[card.columnId]
      const index = column.cardIds.indexOf(state.selectedCardId)
      if (index === -1 || index >= column.cardIds.length - 1) return state
      const snapshot = takeSnapshot(state)
      return {
        ...moveCardWithinColumn(state, card.columnId, index, index + 1),
        undoStack: [...state.undoStack, snapshot].slice(-HISTORY_LIMIT),
        redoStack: [],
      }
    }),

  moveSelectedCardLeft: () =>
    set((state) => {
      if (!state.selectedCardId) return state
      const card = state.cards[state.selectedCardId]
      if (!card) return state
      const board = state.boards[card.columnId]
      if (!board) return state

      const boardId = Object.values(state.boards).find((b) =>
        b.columnIds.includes(card.columnId)
      )?.id
      if (!boardId) return state

      const columnIndex = state.boards[boardId].columnIds.indexOf(card.columnId)
      if (columnIndex <= 0) return state

      const targetColumnId = state.boards[boardId].columnIds[columnIndex - 1]
      const sourceIndex = state.columns[card.columnId].cardIds.indexOf(state.selectedCardId)
      const targetIndex = state.columns[targetColumnId].cardIds.length

      const snapshot = takeSnapshot(state)
      return {
        ...moveCardBetweenColumns(state, card.columnId, targetColumnId, sourceIndex, targetIndex),
        undoStack: [...state.undoStack, snapshot].slice(-HISTORY_LIMIT),
        redoStack: [],
      }
    }),

  moveSelectedCardRight: () =>
    set((state) => {
      if (!state.selectedCardId) return state
      const card = state.cards[state.selectedCardId]
      if (!card) return state

      const boardId = Object.values(state.boards).find((b) =>
        b.columnIds.includes(card.columnId)
      )?.id
      if (!boardId) return state

      const columnIndex = state.boards[boardId].columnIds.indexOf(card.columnId)
      if (columnIndex === -1 || columnIndex >= state.boards[boardId].columnIds.length - 1) return state

      const targetColumnId = state.boards[boardId].columnIds[columnIndex + 1]
      const sourceIndex = state.columns[card.columnId].cardIds.indexOf(state.selectedCardId)
      const targetIndex = state.columns[targetColumnId].cardIds.length

      const snapshot = takeSnapshot(state)
      return {
        ...moveCardBetweenColumns(state, card.columnId, targetColumnId, sourceIndex, targetIndex),
        undoStack: [...state.undoStack, snapshot].slice(-HISTORY_LIMIT),
        redoStack: [],
      }
    }),
}))
