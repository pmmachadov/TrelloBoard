import { useEffect, useRef } from 'react'
import { get, set } from 'idb-keyval'
import { useBoardStore } from '../store/useBoardStore'

const SAVE_KEY = 'board-data'

export function useAutoSave() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const load = async () => {
      const saved = await get(SAVE_KEY)
      if (saved) {
        useBoardStore.getState().loadData(saved)
      }
      useBoardStore.getState().setIsLoaded(true)
    }
    load()
  }, [])

  useEffect(() => {
    let prevBoards = useBoardStore.getState().boards
    let prevColumns = useBoardStore.getState().columns
    let prevCards = useBoardStore.getState().cards
    let prevBoardIds = useBoardStore.getState().boardIds

    const unsubscribe = useBoardStore.subscribe((state) => {
      if (
        state.boards !== prevBoards ||
        state.columns !== prevColumns ||
        state.cards !== prevCards ||
        state.boardIds !== prevBoardIds
      ) {
        prevBoards = state.boards
        prevColumns = state.columns
        prevCards = state.cards
        prevBoardIds = state.boardIds

        useBoardStore.getState().setIsSaving(true)

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(async () => {
          const data = {
            boards: state.boards,
            columns: state.columns,
            cards: state.cards,
            boardIds: state.boardIds,
          }
          await set(SAVE_KEY, data)
          useBoardStore.getState().setIsSaving(false)
        }, 500)
      }
    })

    return () => {
      unsubscribe()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          useBoardStore.getState().redo()
        } else {
          useBoardStore.getState().undo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
