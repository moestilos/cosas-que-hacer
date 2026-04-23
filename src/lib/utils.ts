import type { Task, View } from './types';

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatDue(iso: string | null): { label: string; tone: 'muted' | 'warning' | 'danger' | 'primary' } {
  if (!iso) return { label: '', tone: 'muted' };
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (d < today && !isSameDay(d, today)) return { label: 'Vencida', tone: 'danger' };
  if (isSameDay(d, today)) return { label: 'Hoy', tone: 'warning' };
  if (isSameDay(d, tomorrow)) return { label: 'Mañana', tone: 'primary' };
  return { label: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), tone: 'muted' };
}

export function filterTasksDemo(tasks: Task[], view: View, opts: { tagId?: string; search?: string; priority?: number | null } = {}): Task[] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const in7 = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return tasks.filter((t) => {
    if (t.parentId) return false;
    if (view === 'done') { if (!t.completedAt) return false; }
    else if (t.completedAt) return false;

    if (view === 'today') {
      const d = t.dueDate ? new Date(t.dueDate) : null;
      if (d && d >= end) return false;
    } else if (view === 'upcoming') {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      if (d < start || d >= in7) return false;
    } else if (view === 'tag') {
      if (opts.tagId && t.tagId !== opts.tagId) return false;
    }
    if (opts.priority !== null && opts.priority !== undefined && t.priority !== opts.priority) return false;
    if (opts.search && !t.title.toLowerCase().includes(opts.search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => a.position - b.position || b.priority - a.priority);
}
