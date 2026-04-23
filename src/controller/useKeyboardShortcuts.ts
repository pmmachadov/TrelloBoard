import { useEffect, useCallback } from 'react'
import { useBoardStore } from '../store/useBoardStore'

export function useKeyboardShortcuts(openPalette: () => void) {
  const moveSelectedCardUp = useBoardStore((state) => state.moveSelectedCardUp)
  const moveSelectedCardDown = useBoardStore((state) => state.moveSelectedCardDown)
  const moveSelectedCardLeft = useBoardStore((state) => state.moveSelectedCardLeft)
  const moveSelectedCardRight = useBoardStore((state) => state.moveSelectedCardRight)
  const undo = useBoardStore((state) => state.undo)
  const redo = useBoardStore((state) => state.redo)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey

      if (isMeta && e.key === 'k') {
        e.preventDefault()
        openPalette()
        return
      }

      if (isMeta && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
        return
      }

      if (isMeta && e.shiftKey) {
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          moveSelectedCardUp()
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          moveSelectedCardDown()
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault()
          moveSelectedCardLeft()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          moveSelectedCardRight()
        }
      }
    },
    [moveSelectedCardUp, moveSelectedCardDown, moveSelectedCardLeft, moveSelectedCardRight, undo, redo, openPalette]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
