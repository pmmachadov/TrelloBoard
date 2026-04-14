import type { BoardData, Board, Column, Card } from '../types'

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function createBoard(title: string): Board {
  const now = new Date()
  return {
    id: generateId(),
    title,
    columnIds: [],
    labels: [],
    members: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function createColumn(boardId: string, title: string): Column {
  const now = new Date()
  return {
    id: generateId(),
    title,
    boardId,
    cardIds: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function createCard(columnId: string, title: string): Card {
  const now = new Date()
  return {
    id: generateId(),
    title,
    columnId,
    labels: [],
    members: [],
    subtasks: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function addBoard(data: BoardData, board: Board): BoardData {
  return {
    ...data,
    boards: { ...data.boards, [board.id]: board },
    boardIds: [...data.boardIds, board.id],
  }
}

export function addColumn(
  data: BoardData,
  boardId: string,
  column: Column
): BoardData {
  const board = data.boards[boardId]
  if (!board) return data

  return {
    ...data,
    columns: { ...data.columns, [column.id]: column },
    boards: {
      ...data.boards,
      [boardId]: {
        ...board,
        columnIds: [...board.columnIds, column.id],
        updatedAt: new Date(),
      },
    },
  }
}

export function addCard(
  data: BoardData,
  columnId: string,
  card: Card
): BoardData {
  const column = data.columns[columnId]
  if (!column) return data

  return {
    ...data,
    cards: { ...data.cards, [card.id]: card },
    columns: {
      ...data.columns,
      [columnId]: {
        ...column,
        cardIds: [...column.cardIds, card.id],
        updatedAt: new Date(),
      },
    },
  }
}

export function moveCardWithinColumn(
  data: BoardData,
  columnId: string,
  startIndex: number,
  endIndex: number
): BoardData {
  const column = data.columns[columnId]
  if (!column) return data

  const cardIds = [...column.cardIds]
  const [removed] = cardIds.splice(startIndex, 1)
  cardIds.splice(endIndex, 0, removed)

  return {
    ...data,
    columns: {
      ...data.columns,
      [columnId]: { ...column, cardIds, updatedAt: new Date() },
    },
  }
}

export function moveCardBetweenColumns(
  data: BoardData,
  sourceColumnId: string,
  targetColumnId: string,
  sourceIndex: number,
  targetIndex: number
): BoardData {
  const sourceColumn = data.columns[sourceColumnId]
  const targetColumn = data.columns[targetColumnId]
  if (!sourceColumn || !targetColumn) return data

  const sourceCardIds = [...sourceColumn.cardIds]
  const [movedCardId] = sourceCardIds.splice(sourceIndex, 1)

  const targetCardIds =
    sourceColumnId === targetColumnId
      ? sourceCardIds
      : [...targetColumn.cardIds]

  if (sourceColumnId !== targetColumnId) {
    targetCardIds.splice(targetIndex, 0, movedCardId)
  } else {
    targetCardIds.splice(targetIndex, 0, movedCardId)
  }

  const now = new Date()
  const updatedColumns: Record<string, Column> = {
    ...data.columns,
    [sourceColumnId]: { ...sourceColumn, cardIds: sourceCardIds, updatedAt: now },
  }

  if (sourceColumnId !== targetColumnId) {
    updatedColumns[targetColumnId] = {
      ...targetColumn,
      cardIds: targetCardIds,
      updatedAt: now,
    }
    updatedColumns[sourceColumnId] = {
      ...sourceColumn,
      cardIds: sourceCardIds,
      updatedAt: now,
    }
  } else {
    updatedColumns[sourceColumnId] = {
      ...sourceColumn,
      cardIds: targetCardIds,
      updatedAt: now,
    }
  }

  const movedCard = data.cards[movedCardId]
  const updatedCards: Record<string, Card> = { ...data.cards }

  if (sourceColumnId !== targetColumnId && movedCard) {
    updatedCards[movedCardId] = { ...movedCard, columnId: targetColumnId, updatedAt: now }
  }

  return {
    ...data,
    columns: updatedColumns,
    cards: updatedCards,
  }
}

export function reorderColumns(
  data: BoardData,
  boardId: string,
  startIndex: number,
  endIndex: number
): BoardData {
  const board = data.boards[boardId]
  if (!board) return data

  const columnIds = [...board.columnIds]
  const [removed] = columnIds.splice(startIndex, 1)
  columnIds.splice(endIndex, 0, removed)

  return {
    ...data,
    boards: {
      ...data.boards,
      [boardId]: { ...board, columnIds, updatedAt: new Date() },
    },
  }
}

export function deleteCard(data: BoardData, cardId: string): BoardData {
  const card = data.cards[cardId]
  if (!card) return data

  const column = data.columns[card.columnId]
  const remainingCards: Record<string, Card> = {}
  for (const key in data.cards) {
    if (key !== cardId) {
      remainingCards[key] = data.cards[key]
    }
  }

  return {
    ...data,
    cards: remainingCards,
    columns: {
      ...data.columns,
      [card.columnId]: {
        ...column,
        cardIds: column.cardIds.filter((id) => id !== cardId),
        updatedAt: new Date(),
      },
    },
  }
}

export function editCardTitle(
  data: BoardData,
  cardId: string,
  title: string
): BoardData {
  const card = data.cards[cardId]
  if (!card) return data

  return {
    ...data,
    cards: {
      ...data.cards,
      [cardId]: { ...card, title, updatedAt: new Date() },
    },
  }
}
