import { useEffect, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Filter } from 'lucide-react';
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
    <div className="space-y-2 pt-4">
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <button onClick={() => setManualSort((v) => !v)} className={`text-xs px-3 py-1.5 rounded-full border ${manualSort ? 'border-primary text-primary' : 'border-border text-muted'}`}>
          {manualSort ? 'Orden manual' : 'Orden auto'}
        </button>
        <span className="text-muted"><Filter size={14} /></span>
        {[null, 2, 1, 0].map((p) => (
          <button
            key={String(p)}
            onClick={() => setFp(p as any)}
            className={`text-xs px-3 py-1.5 rounded-full border ${fp === p ? 'border-primary text-primary' : 'border-border text-muted'}`}
          >
            {p === null ? 'Todas' : p === 2 ? 'Alta' : p === 1 ? 'Media' : 'Baja'}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState view={view} />
      ) : manualSort ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={visible.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {visible.map((t) => <TaskItem key={t.id} task={t} onDeleted={setDeleted} sortable />)}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-2">
          {visible.map((t) => <TaskItem key={t.id} task={t} onDeleted={setDeleted} />)}
        </div>
      )}

      <UndoToast deleted={deleted} onDismiss={() => setDeleted(null)} />
    </div>
  );
}
