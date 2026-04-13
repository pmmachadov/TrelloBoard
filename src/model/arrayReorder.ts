export function reorderArray<T>(
  items: T[],
  startIndex: number,
  endIndex: number
): T[] {
  const result = [...items];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}
