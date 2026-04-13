export function reorderArray<T>(array: T[], startIndex: number, endIndex: number): T[] {
  if (startIndex < 0 || startIndex >= array.length) {
    throw new Error('Invalid startIndex')
  }
  if (endIndex < 0 || endIndex >= array.length) {
    throw new Error('Invalid endIndex')
  }

  const result = Array.from(array)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}
