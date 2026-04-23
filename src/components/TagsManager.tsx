import { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useTasks } from '@/lib/store';

const palette = ['#14B8A6', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#10B981'];

export default function TagsManager({ demo }: { demo?: boolean }) {
  const tags = useTasks((s) => s.tags);
  const loadTags = useTasks((s) => s.loadTags);
  const addTag = useTasks((s) => s.addTag);
  const removeTag = useTasks((s) => s.removeTag);
  const setDemo = useTasks((s) => s.setDemo);
  const [name, setName] = useState('');
  const [color, setColor] = useState(palette[0]);

  useEffect(() => { if (demo) setDemo(true); loadTags(); }, [demo]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await addTag(name.trim(), color);
    setName('');
  }

  return (
    <div className="pt-4 space-y-5">
      <form onSubmit={onAdd} className="card p-4 space-y-3">
        <input className="input" placeholder="Nombre del tag" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {palette.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
                className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-surface ring-text scale-110' : 'hover:scale-105'}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <button type="submit" disabled={!name.trim()} className="btn-primary">
            <Plus size={16} /> Añadir
          </button>
        </div>
      </form>
      <ul className="space-y-2">
        {tags.map((t, i) => (
          <li
            key={t.id}
            className="card-hover px-4 py-3.5 flex items-center gap-3 animate-fade-up"
            style={{ animationDelay: `${Math.min(i * 30, 200)}ms` }}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color }} aria-hidden />
            <a href={`/tag/${t.id}`} className="flex-1 text-sm font-medium hover:text-primary transition-colors min-w-0 truncate">{t.name}</a>
            <button onClick={() => removeTag(t.id)} aria-label={`Borrar ${t.name}`} className="text-muted hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </li>
        ))}
        {tags.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary" aria-hidden>
                <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l8.59-8.59a1 1 0 0 0 0-1.41L12 2Z"/>
                <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <p className="text-sm font-medium">Sin tags aún</p>
            <p className="text-xs text-muted mt-1">Crea uno para organizar tareas</p>
          </div>
        )}
      </ul>
    </div>
  );
}
