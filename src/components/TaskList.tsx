import { useEffect, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTasks } from '@/lib/store';
import { filterTasksDemo } from '@/lib/utils';
import type { Task, View } from '@/lib/types';
import TaskItem from './TaskItem';
import EmptyState from './EmptyState';
import UndoToast from './UndoToast';

export default function TaskList({ view, tagId, demo }: { view: View; tagId?: string; demo?: boolean }) {
  const [deleted, setDeleted] = useState<Task | null>(null);
  const [manualSort, setManualSort] = useState(false);
  const tasks = useTasks((s) => s.tasks);
  const search = useTasks((s) => s.search);
  const fp = useTasks((s) => s.filterPriority);
  const setFp = useTasks((s) => s.setFilterPriority);
  const load = useTasks((s) => s.load);
  const loadTags = useTasks((s) => s.loadTags);
  const setDemo = useTasks((s) => s.setDemo);
  const reorder = useTasks((s) => s.reorder);

  useEffect(() => {
    if (demo) setDemo(true);
  }, [demo]);

  useEffect(() => {
    loadTags();
    if (!demo) load(view, tagId);
  }, [view, tagId, search, fp, demo]);

  const visible = demo
    ? filterTasksDemo(tasks, view, { tagId, search, priority: fp })
    : tasks;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = visible.map((t) => t.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    reorder(arrayMove(ids, oldIndex, newIndex));
  }

  return (
    <div className="space-y-2.5 pt-4">
      <div className="flex items-center gap-1.5 flex-wrap mb-3 -mx-1 px-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setManualSort((v) => !v)}
          className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${manualSort ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted hover:text-text hover:border-border-strong'}`}
        >
          {manualSort ? 'Manual' : 'Auto'}
        </button>
        <span className="w-px h-5 bg-border mx-1" aria-hidden />
        {([null, 2, 1, 0] as const).map((p) => {
          const active = fp === p;
          const activeCls = active
            ? p === 2 ? 'border-warning bg-warning/10 text-warning'
            : p === 0 ? 'border-muted bg-surface-hover text-text'
            : 'border-primary bg-primary/10 text-primary'
            : 'border-border text-muted hover:text-text hover:border-border-strong';
          const dotCls = p === 2 ? 'bg-warning' : p === 0 ? 'bg-muted' : 'bg-primary';
          return (
            <button
              key={String(p)}
              onClick={() => setFp(p as any)}
              className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${activeCls}`}
            >
              {p !== null && <span className={`w-1.5 h-1.5 rounded-full ${dotCls}`} aria-hidden />}
              {p === null ? 'Todas' : p === 2 ? 'Alta' : p === 1 ? 'Media' : 'Baja'}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState view={view} />
      ) : manualSort ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={visible.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {visible.map((t, i) => <TaskItem key={t.id} task={t} onDeleted={setDeleted} sortable index={i} />)}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-2">
          {visible.map((t, i) => <TaskItem key={t.id} task={t} onDeleted={setDeleted} index={i} />)}
        </div>
      )}

      <UndoToast deleted={deleted} onDismiss={() => setDeleted(null)} />
    </div>
  );
}
