import { z } from 'zod'

export const subtaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
})

export const labelSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
})

export const memberSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().optional(),
})

export const cardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  columnId: z.string(),
  labels: z.array(labelSchema),
  members: z.array(memberSchema),
  dueDate: z.string().datetime().nullable().optional().transform((v) => v ? new Date(v) : undefined),
  subtasks: z.array(subtaskSchema),
  isChecklist: z.boolean().optional(),
  createdAt: z.string().datetime().transform((v) => new Date(v)),
  updatedAt: z.string().datetime().transform((v) => new Date(v)),
})

export const columnSchema = z.object({
  id: z.string(),
  title: z.string(),
  boardId: z.string(),
  cardIds: z.array(z.string()),
  createdAt: z.string().datetime().transform((v) => new Date(v)),
  updatedAt: z.string().datetime().transform((v) => new Date(v)),
})

export const boardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  columnIds: z.array(z.string()),
  labels: z.array(labelSchema),
  members: z.array(memberSchema),
  createdAt: z.string().datetime().transform((v) => new Date(v)),
  updatedAt: z.string().datetime().transform((v) => new Date(v)),
})

export const boardDataSchema = z.object({
  boards: z.record(z.string(), boardSchema),
  columns: z.record(z.string(), columnSchema),
  cards: z.record(z.string(), cardSchema),
  boardIds: z.array(z.string()),
})

export type ValidatedBoardData = z.infer<typeof boardDataSchema>
