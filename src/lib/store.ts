import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { Task, Tag, View } from './types';

interface TaskStore {
  tasks: Task[];
  tags: Tag[];
  loading: boolean;
  demo: boolean;
  search: string;
  filterPriority: number | null;
  setSearch: (q: string) => void;
  setFilterPriority: (p: number | null) => void;
  setDemo: (v: boolean) => void;
  load: (view: View, tagId?: string) => Promise<void>;
  loadTags: () => Promise<void>;
  add: (input: Partial<Task>) => Promise<Task>;
  update: (id: string, patch: Partial<Task>) => Promise<void>;
  toggle: (id: string) => Promise<void>;
  remove: (id: string) => Promise<Task | undefined>;
  restore: (task: Task) => Promise<void>;
  reorder: (ids: string[]) => Promise<void>;
  addTag: (name: string, color: string) => Promise<Tag>;
  removeTag: (id: string) => Promise<void>;
}

async function api<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const r = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (!r.ok && r.status !== 204) throw new Error(await r.text());
  if (r.status === 204) return undefined as T;
  return r.json();
}

export const useTasks = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      tags: [],
      loading: false,
      demo: false,
      search: '',
      filterPriority: null,
      setSearch: (q) => set({ search: q }),
      setFilterPriority: (p) => set({ filterPriority: p }),
      setDemo: (v) => set({ demo: v }),

      load: async (view, tagId) => {
        set({ loading: true });
        try {
          if (get().demo) {
            // filter locally in demo mode in selectors
            set({ loading: false });
            return;
          }
          const params = new URLSearchParams({ view });
          if (tagId) params.set('tagId', tagId);
          const q = get().search;
          const fp = get().filterPriority;
          if (q) params.set('q', q);
          if (fp !== null) params.set('priority', String(fp));
          const tasks = await api<Task[]>(`/api/tasks?${params}`);
          set({ tasks, loading: false });
        } catch (e) {
          console.error(e);
          set({ loading: false });
        }
      },

      loadTags: async () => {
        if (get().demo) return;
        try {
          const tags = await api<Tag[]>('/api/tags');
          set({ tags });
        } catch {}
      },

      add: async (input) => {
        const now = new Date().toISOString();
        const temp: Task = {
          id: nanoid(),
          parentId: input.parentId ?? null,
          title: input.title ?? '',
          notes: input.notes ?? null,
          dueDate: input.dueDate ?? null,
          priority: (input.priority ?? 1) as any,
          tagId: input.tagId ?? null,
          completedAt: null,
          position: input.position ?? 0,
          createdAt: now,
          updatedAt: now,
        };
        set({ tasks: [temp, ...get().tasks] });
        if (get().demo) return temp;
        try {
          const saved = await api<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(input) });
          set({ tasks: get().tasks.map((t) => (t.id === temp.id ? saved : t)) });
          return saved;
        } catch {
          return temp;
        }
      },

      update: async (id, patch) => {
        set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
        if (get().demo) return;
        try {
          await api(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
        } catch (e) { console.error(e); }
      },

      toggle: async (id) => {
        const t = get().tasks.find((x) => x.id === id);
        if (!t) return;
        const completedAt = t.completedAt ? null : new Date().toISOString();
        await get().update(id, { completedAt });
      },

      remove: async (id) => {
        const t = get().tasks.find((x) => x.id === id);
        set({ tasks: get().tasks.filter((x) => x.id !== id) });
        if (get().demo) return t;
        try {
          await api(`/api/tasks/${id}`, { method: 'DELETE' });
        } catch {}
        return t;
      },

      restore: async (task) => {
        set({ tasks: [task, ...get().tasks] });
        if (get().demo) return;
        try {
          await api('/api/tasks', { method: 'POST', body: JSON.stringify(task) });
        } catch {}
      },

      reorder: async (ids) => {
        const map = new Map(get().tasks.map((t) => [t.id, t]));
        const updated = ids.map((id, i) => ({ ...(map.get(id)!), position: i }));
        const others = get().tasks.filter((t) => !ids.includes(t.id));
        set({ tasks: [...updated, ...others] });
        if (get().demo) return;
        await Promise.all(updated.map((t) => api(`/api/tasks/${t.id}`, { method: 'PATCH', body: JSON.stringify({ position: t.position }) })));
      },

      addTag: async (name, color) => {
        if (get().demo) {
          const tag: Tag = { id: nanoid(), name, color };
          set({ tags: [...get().tags, tag] });
          return tag;
        }
        const tag = await api<Tag>('/api/tags', { method: 'POST', body: JSON.stringify({ name, color }) });
        set({ tags: [...get().tags, tag] });
        return tag;
      },

      removeTag: async (id) => {
        set({ tags: get().tags.filter((t) => t.id !== id) });
        if (!get().demo) {
          await api(`/api/tags/${id}`, { method: 'DELETE' });
        }
      },
    }),
    {
      name: 'cqh-demo',
      partialize: (s) => (s.demo ? { tasks: s.tasks, tags: s.tags, demo: s.demo } : { demo: s.demo }),
    },
  ),
);
