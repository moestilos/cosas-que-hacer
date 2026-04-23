export type Priority = 0 | 1 | 2;

export interface Task {
  id: string;
  userId?: string;
  parentId: string | null;
  title: string;
  notes: string | null;
  dueDate: string | null;
  priority: Priority;
  tagId: string | null;
  completedAt: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type View = 'today' | 'upcoming' | 'all' | 'done' | 'tag';
