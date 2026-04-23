import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '@/lib/store';
import type { Priority } from '@/lib/types';

export default function FabSheet({ demo }: { demo?: boolean }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>(1);
  const [tagId, setTagId] = useState<string | null>(null);
  const tags = useTasks((s) => s.tags);
  const add = useTasks((s) => s.add);
  const loadTags = useTasks((s) => s.loadTags);
  const setDemo = useTasks((s) => s.setDemo);

  useEffect(() => { if (demo) setDemo(true); loadTags(); }, [demo]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === 'n' || e.key === 'N') && !open && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? '')) {
        e.preventDefault(); setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await add({
      title: title.trim(),
      notes: notes.trim() || null,
      dueDate: dueDate || null,
      priority,
      tagId,
    });
    setTitle(''); setNotes(''); setDueDate(''); setPriority(1); setTagId(null);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Nueva tarea"
        className="fixed right-4 bottom-20 z-40 mb-safe-bottom w-14 h-14 rounded-full bg-cta text-white shadow-lg shadow-cta/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              aria-hidden
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              role="dialog" aria-modal="true" aria-label="Nueva tarea"
              className="fixed left-0 right-0 bottom-0 z-50 bg-surface rounded-t-2xl border-t border-border p-4 pb-safe-bottom max-h-[90dvh] overflow-auto"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Nueva tarea</h2>
                <button onClick={() => setOpen(false)} aria-label="Cerrar" className="p-1 rounded-lg hover:bg-bg">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={submit} className="space-y-3">
                <input
                  autoFocus
                  className="input"
                  placeholder="¿Qué hay que hacer?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <textarea
                  className="input min-h-[70px] resize-none"
                  placeholder="Notas (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted mb-1 block">Fecha límite</label>
                    <input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Prioridad</label>
                    <select className="input" value={priority} onChange={(e) => setPriority(Number(e.target.value) as Priority)}>
                      <option value={0}>Baja</option>
                      <option value={1}>Media</option>
                      <option value={2}>Alta</option>
                    </select>
                  </div>
                </div>
                {tags.length > 0 && (
                  <div>
                    <label className="text-xs text-muted mb-1 block">Tag</label>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setTagId(null)} className={`px-3 py-1 rounded-full text-xs border ${tagId === null ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted'}`}>Ninguno</button>
                      {tags.map((t) => (
                        <button key={t.id} type="button" onClick={() => setTagId(t.id)}
                          className={`px-3 py-1 rounded-full text-xs border ${tagId === t.id ? 'border-primary bg-primary/10' : 'border-border text-muted'}`}
                          style={tagId === t.id ? { color: t.color, borderColor: t.color } : {}}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button type="submit" className="btn-primary w-full">Guardar</button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
