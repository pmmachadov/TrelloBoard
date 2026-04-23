import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import BoardPage from '../../view/pages/BoardPage'
import { useBoardStore } from '../../store/useBoardStore'

function resetStore() {
  useBoardStore.setState({
    boards: {},
    columns: {},
    cards: {},
    boardIds: [],
    activeBoardId: null,
    undoStack: [],
    redoStack: [],
    isSaving: false,
    isLoaded: true,
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
    fireEvent.click(card)

    const input = screen.getByDisplayValue('Design homepage')
    expect(input).toBeInTheDocument()
    expect(input.tagName.toLowerCase()).toBe('input')
  })

  it('saves card title on Enter', async () => {
    renderWithRouter(<BoardPage />, ['/board/default'])

    await waitFor(() => {
      expect(screen.getByText('Design homepage')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Design homepage'))

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

    fireEvent.click(screen.getByText('Design homepage'))

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
})
