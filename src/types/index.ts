export type Id = string

export interface Label {
  id: Id
  name: string
  color: string
}

export interface Member {
  id: Id
  name: string
  avatarUrl?: string
}

export interface Subtask {
  id: Id
  title: string
  completed: boolean
}

export interface Card {
  id: Id
  title: string
  description: string
  columnId: Id
  order: number
  labels: Id[]
  members: Id[]
  dueDate?: Date
  subtasks: Subtask[]
}

export interface Column {
  id: Id
  title: string
  boardId: Id
  order: number
  cardIds: Id[]
}

export interface Board {
  id: Id
  title: string
  columnIds: Id[]
  labels: Label[]
  members: Member[]
}

export interface BoardState {
  boards: Record<Id, Board>
  columns: Record<Id, Column>
  cards: Record<Id, Card>
}
