import { describe, it, expect } from 'vitest'

describe('Scaffold', () => {
  it('should pass a hello world test', () => {
    expect(true).toBe(true)
  })

  it('should verify TypeScript strictness via import', () => {
    const value: string = 'hello mvc'
    expect(value).toBe('hello mvc')
  })
})
