import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2 } from 'lucide-react';
import type { Task } from '@/lib/types';
import { useTasks } from '@/lib/store';

export default function UndoToast({ deleted, onDismiss }: { deleted: Task | null; onDismiss: () => void }) {
  const restore = useTasks((s) => s.restore);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!deleted) return;
    const start = Date.now();
    const iv = setInterval(() => {
      const p = Math.max(0, 100 - ((Date.now() - start) / 5000) * 100);
      setProgress(p);
      if (p <= 0) { clearInterval(iv); onDismiss(); }
    }, 50);
    return () => clearInterval(iv);
  }, [deleted]);

  return (
    <AnimatePresence>
      {deleted && (
        <motion.div
          initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
          className="fixed left-1/2 -translate-x-1/2 z-50 card px-4 py-3 shadow-lg flex items-center gap-3 min-w-[280px]"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}
          role="status"
        >
          <div className="flex-1 text-sm truncate">Eliminada: <span className="text-muted">{deleted.title}</span></div>
          <button onClick={() => { restore(deleted); onDismiss(); }} className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
            <Undo2 size={14} /> Deshacer
          </button>
          <div className="absolute left-0 bottom-0 h-0.5 bg-primary transition-[width] duration-75" style={{ width: `${progress}%` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
