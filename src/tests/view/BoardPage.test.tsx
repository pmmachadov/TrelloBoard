import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import BoardPage from '../../view/pages/BoardPage'
import { useBoardStore } from '../../store/useBoardStore'
import { createBoard, createColumn, createCard } from '../../model/boardModel'

function resetStore() {
  const board = { ...createBoard('Project Board'), id: 'default' }
  const todo = createColumn(board.id, 'To Do')
  const inProgress = createColumn(board.id, 'In Progress')
  const done = createColumn(board.id, 'Done')
  board.columnIds = [todo.id, inProgress.id, done.id]

  const card1 = createCard(todo.id, 'Design homepage')
  const card2 = createCard(todo.id, 'Setup CI/CD')
  const card3 = createCard(inProgress.id, 'Implement auth')
  const card4 = createCard(done.id, 'Project scaffold')
  todo.cardIds = [card1.id, card2.id]
  inProgress.cardIds = [card3.id]
  done.cardIds = [card4.id]

  useBoardStore.setState({
    boards: { [board.id]: board },
    columns: { [todo.id]: todo, [inProgress.id]: inProgress, [done.id]: done },
    cards: { [card1.id]: card1, [card2.id]: card2, [card3.id]: card3, [card4.id]: card4 },
    boardIds: [board.id],
    activeBoardId: null,
    undoStack: [],
    redoStack: [],
    isSaving: false,
    isLoaded: true,
    selectedCardId: null,
    viewMode: 'board',
    searchQuery: '',
    zenMode: false,
    selectedCardIds: [],
  })
}

function renderWithRouter(ui: React.ReactElement, initialEntries: string[] = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/board/:boardId" element={ui} />
      </Routes>
    </MemoryRouter>
  )
}

describe('BoardPage', () => {
  beforeEach(() => {
    resetStore()
  })

  it('renders board title and columns from URL', async () => {
    renderWithRouter(<BoardPage />, ['/board/default'])

    await waitFor(() => {
      expect(screen.getByText('Project Board')).toBeInTheDocument()
    })

    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('renders cards inside columns', async () => {
    renderWithRouter(<BoardPage />, ['/board/default'])

    await waitFor(() => {
      expect(screen.getByText('Design homepage')).toBeInTheDocument()
    })

    expect(screen.getByText('Setup CI/CD')).toBeInTheDocument()
    expect(screen.getByText('Implement auth')).toBeInTheDocument()
    expect(screen.getByText('Project scaffold')).toBeInTheDocument()
  })

  it('switches card to editing mode on click', async () => {
    renderWithRouter(<BoardPage />, ['/board/default'])

    await waitFor(() => {
      expect(screen.getByText('Design homepage')).toBeInTheDocument()
    })

    const card = screen.getByText('Design homepage')
    fireEvent.doubleClick(card)

    const input = screen.getByDisplayValue('Design homepage')
    expect(input).toBeInTheDocument()
    expect(input.tagName.toLowerCase()).toBe('input')
  })

  it('saves card title on Enter', async () => {
    renderWithRouter(<BoardPage />, ['/board/default'])

    await waitFor(() => {
      expect(screen.getByText('Design homepage')).toBeInTheDocument()
    })

    fireEvent.doubleClick(screen.getByText('Design homepage'))

    const input = screen.getByDisplayValue('Design homepage')
    fireEvent.change(input, { target: { value: 'New Title' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      expect(screen.getByText('New Title')).toBeInTheDocument()
    })
  })

  it('cancels card edit on Escape', async () => {
    renderWithRouter(<BoardPage />, ['/board/default'])

    await waitFor(() => {
      expect(screen.getByText('Design homepage')).toBeInTheDocument()
    })

    fireEvent.doubleClick(screen.getByText('Design homepage'))

    const input = screen.getByDisplayValue('Design homepage')
    fireEvent.change(input, { target: { value: 'Aborted Title' } })
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })

    await waitFor(() => {
      expect(screen.getByText('Design homepage')).toBeInTheDocument()
    })

    expect(screen.queryByText('Aborted Title')).not.toBeInTheDocument()
  })

  it('renders columns with sortable attributes', async () => {
    renderWithRouter(<BoardPage />, ['/board/default'])

    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeInTheDocument()
    })

    const todoColumn = screen.getByText('To Do').closest('[role="button"]')
    expect(todoColumn).toBeInTheDocument()
  })

  it('renders cards with sortable attributes', async () => {
    renderWithRouter(<BoardPage />, ['/board/default'])

    await waitFor(() => {
      expect(screen.getByText('Design homepage')).toBeInTheDocument()
    })

    const card = screen.getByText('Design homepage').closest('[role="button"]')
    expect(card).toBeInTheDocument()
  })

  it('shows not found for invalid board id', async () => {
    renderWithRouter(<BoardPage />, ['/board/invalid-id'])

    await waitFor(() => {
      expect(screen.getByText('Board not found')).toBeInTheDocument()
    })
  })

  it('selects card on click', async () => {
    renderWithRouter(<BoardPage />, ['/board/default'])

    await waitFor(() => {
      expect(screen.getByText('Design homepage')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Design homepage'))

    const state = useBoardStore.getState()
    const card = Object.values(state.cards).find((c) => c.title === 'Design homepage')
    expect(state.selectedCardId).toBe(card?.id ?? null)
  })

  it('moves selected card with keyboard shortcuts', async () => {
    renderWithRouter(<BoardPage />, ['/board/default'])

    await waitFor(() => {
      expect(screen.getByText('Design homepage')).toBeInTheDocument()
    })

    const card = Object.values(useBoardStore.getState().cards).find(
      (c) => c.title === 'Design homepage'
    )
    if (card) {
      useBoardStore.getState().selectCard(card.id)
    }

    fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true, shiftKey: true })

    await waitFor(() => {
      const state = useBoardStore.getState()
      const column = Object.values(state.columns).find((col) =>
        col.cardIds.includes(card?.id ?? '')
      )
      expect(column?.cardIds.indexOf(card?.id ?? '')).toBe(1)
    })
  })

  it('has accessible roles on columns', async () => {
    renderWithRouter(<BoardPage />, ['/board/default'])

    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeInTheDocument()
    })

    const columns = screen.getAllByRole('button')
    expect(columns.length).toBeGreaterThan(0)
  })
})
