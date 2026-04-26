import { describe, it, expect } from 'vitest'
import { boardDataSchema } from '../../model/boardSchema'
import { createBoard, createColumn, createCard } from '../../model/boardModel'

describe('boardDataSchema', () => {
  it('validates correct board data', () => {
    const board = createBoard('Test')
    const column = createColumn(board.id, 'Col')
    const card = createCard(column.id, 'Card')

    const data = {
      boards: { [board.id]: { ...board, createdAt: board.createdAt.toISOString(), updatedAt: board.updatedAt.toISOString() } },
      columns: { [column.id]: { ...column, createdAt: column.createdAt.toISOString(), updatedAt: column.updatedAt.toISOString() } },
      cards: { [card.id]: { ...card, createdAt: card.createdAt.toISOString(), updatedAt: card.updatedAt.toISOString() } },
      boardIds: [board.id],
    }

    const result = boardDataSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects invalid board data', () => {
    const result = boardDataSchema.safeParse({ boards: 'invalid' })
    expect(result.success).toBe(false)
  })
})
