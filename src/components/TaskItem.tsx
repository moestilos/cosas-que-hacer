import { useState } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { Check, Trash2, Calendar, Flag, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTasks } from '@/lib/store';
import { formatDue, cn } from '@/lib/utils';
import type { Task } from '@/lib/types';

const priorityClass: Record<number, string> = {
  0: 'text-muted',
  1: 'text-primary',
  2: 'text-warning',
};

export default function TaskItem({ task, onDeleted, sortable = false }: { task: Task; onDeleted?: (t: Task) => void; sortable?: boolean }) {
  const toggle = useTasks((s) => s.toggle);
  const remove = useTasks((s) => s.remove);
  const tags = useTasks((s) => s.tags);
  const tag = task.tagId ? tags.find((t) => t.id === task.tagId) : null;
  const x = useMotionValue(0);
  const bg = useTransform(x, [-120, 0, 120], ['rgba(239,68,68,0.25)', 'rgba(0,0,0,0)', 'rgba(20,184,166,0.25)']);
  const [removing, setRemoving] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, disabled: !sortable });

  const style = sortable ? { transform: CSS.Transform.toString(transform), transition } : undefined;

  async function onDragEnd(_: any, info: PanInfo) {
    if (info.offset.x > 90) {
      await toggle(task.id);
      x.set(0);
    } else if (info.offset.x < -90) {
      setRemoving(true);
      const deleted = await remove(task.id);
      if (deleted && onDeleted) onDeleted(deleted);
    } else {
      x.set(0);
    }
  }

  const due = formatDue(task.dueDate);
  const done = !!task.completedAt;

  return (
    <motion.div ref={setNodeRef} style={{ ...style, background: bg }} className={cn('relative rounded-xl', isDragging && 'opacity-50')}>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        style={{ x }}
        onDragEnd={onDragEnd}
        animate={removing ? { opacity: 0, x: -400 } : {}}
        transition={{ duration: 0.2 }}
        className="card px-4 py-3 flex items-start gap-3 touch-pan-y"
      >
        {sortable && (
          <button {...attributes} {...listeners} aria-label="Reordenar" className="text-muted p-1 -ml-1 mt-1 touch-none">
            <GripVertical size={16} />
          </button>
        )}
        <button
          onClick={() => toggle(task.id)}
          aria-label={done ? 'Marcar pendiente' : 'Completar'}
          className={cn(
            'mt-0.5 w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors',
            done ? 'bg-primary border-primary' : 'border-border hover:border-primary',
          )}
        >
          {done && <Check size={14} className="text-white" strokeWidth={3} />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium break-words transition-colors', done && 'line-through text-muted')}>
            {task.title}
          </p>
          {task.notes && <p className="text-xs text-muted mt-0.5 break-words">{task.notes}</p>}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {due.label && (
              <span className={cn('inline-flex items-center gap-1 text-xs', due.tone === 'danger' && 'text-danger', due.tone === 'warning' && 'text-warning', due.tone === 'primary' && 'text-primary', due.tone === 'muted' && 'text-muted')}>
                <Calendar size={12} /> {due.label}
              </span>
            )}
            <span className={cn('inline-flex items-center gap-1 text-xs', priorityClass[task.priority])}>
              <Flag size={12} />
            </span>
            {tag && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border" style={{ color: tag.color, borderColor: tag.color }}>
                {tag.name}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
