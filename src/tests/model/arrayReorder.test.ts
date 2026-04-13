import { describe, it, expect } from 'vitest'
import { reorderArray } from '../../model/arrayReorder'

describe('reorderArray', () => {
  it('moves an item from start to end', () => {
    const items = ['a', 'b', 'c', 'd']
    const result = reorderArray(items, 0, 3)
    expect(result).toEqual(['b', 'c', 'd', 'a'])
  })

  it('moves an item from end to start', () => {
    const items = ['a', 'b', 'c', 'd']
    const result = reorderArray(items, 3, 0)
    expect(result).toEqual(['d', 'a', 'b', 'c'])
  })

  it('moves an item to the middle', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    const result = reorderArray(items, 4, 2)
    expect(result).toEqual(['a', 'b', 'e', 'c', 'd'])
  })

  it('does not mutate the original array', () => {
    const items = ['a', 'b', 'c']
    const result = reorderArray(items, 0, 2)
    expect(items).toEqual(['a', 'b', 'c'])
    expect(result).not.toBe(items)
  })

  it('returns a new array instance even if indices are the same', () => {
    const items = ['a', 'b', 'c']
    const result = reorderArray(items, 1, 1)
    expect(result).toEqual(['a', 'b', 'c'])
    expect(result).not.toBe(items)
  })
})
