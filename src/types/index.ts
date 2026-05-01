export type Member = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type Label = {
  id: string;
  name: string;
  color: string;
};

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Card = {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  labels: Label[];
  members: Member[];
  dueDate?: Date;
  subtasks: Subtask[];
  isChecklist?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Column = {
  id: string;
  title: string;
  boardId: string;
  cardIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type Board = {
  id: string;
  title: string;
  description?: string;
  columnIds: string[];
  labels: Label[];
  members: Member[];
  createdAt: Date;
  updatedAt: Date;
};

export type BoardData = {
  boards: Record<string, Board>;
  columns: Record<string, Column>;
  cards: Record<string, Card>;
  boardIds: string[];
};
