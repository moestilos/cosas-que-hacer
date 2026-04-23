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
    <div className="pt-4 space-y-4">
      <form onSubmit={onAdd} className="flex gap-2 items-center">
        <input className="input flex-1" placeholder="Nombre del tag" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex gap-1">
          {palette.map((c) => (
            <button key={c} type="button" onClick={() => setColor(c)} aria-label={`Color ${c}`}
              className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-text' : 'border-transparent'}`}
              style={{ background: c }} />
          ))}
        </div>
        <button type="submit" className="btn-primary"><Plus size={16} /></button>
      </form>
      <ul className="space-y-2">
        {tags.map((t) => (
          <li key={t.id} className="card px-4 py-3 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full" style={{ background: t.color }} />
            <a href={`/tag/${t.id}`} className="flex-1 text-sm hover:text-primary">{t.name}</a>
            <button onClick={() => removeTag(t.id)} aria-label={`Borrar ${t.name}`} className="text-muted hover:text-danger p-1">
              <X size={16} />
            </button>
          </li>
        ))}
        {tags.length === 0 && <p className="text-sm text-muted text-center py-8">Sin tags aún.</p>}
      </ul>
    </div>
  );
}
