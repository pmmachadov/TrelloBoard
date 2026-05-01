# KanbanBoard

A Kanban-style board application built with React 19, TypeScript, and Vite. Supports multiple boards, drag-and-drop cards and columns, inline editing, checklists with progress bars, search, calendar/timeline views, and persistent storage via IndexedDB.

## Features

- **Multiple boards** with independent columns and cards
- **Drag & drop** for cards (between columns) and columns (reordering)
- **Checklist cards** with subtasks, checkboxes, and progress bars
- **Simple cards** with progress bar but no checklist items
- **Inline editing** for card titles, column titles, and board title
- **Add / delete** cards and columns with confirmation dialogs
- **Search** cards by title or description
- **View modes**: Board, Table, Calendar, Timeline
- **Command palette** (Ctrl/Cmd + K) to switch boards quickly
- **Import / Export** boards as JSON files
- **Persistent storage** via IndexedDB with auto-save
- **Undo / Redo** support (Ctrl/Cmd + Z, Ctrl/Cmd + Shift + Z)
- **Dark theme** with green color palette

## Tech Stack

- React 19 + TypeScript 6 (strict mode)
- Vite 8
- Material-UI v9 (MUI)
- Zustand v5 (global state)
- React Router v7
- @dnd-kit (drag & drop)
- Vitest + jsdom + Testing Library (tests)
- date-fns, fuse.js, zod, idb-keyval

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Open in browser
http://localhost:5173/board/default
```

## Build & Test

```bash
# Type-check and build for production
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run ESLint
pnpm lint
```

## Project Structure

```
src/
  types/          # Domain TypeScript types (Board, Column, Card, etc.)
  model/          # Pure functions for immutable data transformations
  store/          # Zustand global store with CRUD actions
  view/           # React components
    pages/        # Top-level routes (BoardPage)
    components/   # Reusable UI (Column, Card, CalendarView, etc.)
  controller/     # Custom hooks (useAutoSave, useKeyboardShortcuts)
  tests/          # Unit tests mirroring src/ structure
```

## Data Model

The app uses a normalized data shape with maps for O(1) lookups and ordered ID arrays for sequence:

```ts
type BoardData = {
  boards: Record<string, Board>
  columns: Record<string, Column>
  cards: Record<string, Card>
  boardIds: string[]
}
```

## Current Status

Implemented:
- Vite + React + TypeScript strict scaffold
- Domain types and pure model functions
- Zustand global store with undo/redo
- Auto-save to IndexedDB
- MUI dark theme (green palette)
- Board / Table / Calendar / Timeline views
- Drag-and-drop for cards and columns
- Checklist / simple card toggle
- Import / export JSON
- Command palette and keyboard shortcuts
- Unit tests (65 passing)

Planned:
- Multi-board navigation UI
- Labels and members on cards
- Due date notifications
- Board sharing / collaboration
