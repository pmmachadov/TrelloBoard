import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('idb-keyval', () => ({
  get: vi.fn(() => Promise.resolve(undefined)),
  set: vi.fn(() => Promise.resolve()),
}))
