import type { View } from '@/lib/types';

const svgs: Record<string, JSX.Element> = {
  today: (
    <svg viewBox="0 0 120 120" fill="none" className="w-28 h-28 text-primary/70">
      <rect x="20" y="30" width="80" height="70" rx="10" stroke="currentColor" strokeWidth="3" />
      <path d="M20 48h80" stroke="currentColor" strokeWidth="3" />
      <path d="M40 20v20M80 20v20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="72" r="10" stroke="currentColor" strokeWidth="3" />
      <path d="M56 72l3 3 5-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  upcoming: (
    <svg viewBox="0 0 120 120" fill="none" className="w-28 h-28 text-primary/70">
      <path d="M20 90l25-30 20 15 35-45" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="100" cy="30" r="4" fill="currentColor" />
    </svg>
  ),
  all: (
    <svg viewBox="0 0 120 120" fill="none" className="w-28 h-28 text-primary/70">
      <rect x="20" y="25" width="80" height="14" rx="4" stroke="currentColor" strokeWidth="3" />
      <rect x="20" y="53" width="80" height="14" rx="4" stroke="currentColor" strokeWidth="3" />
      <rect x="20" y="81" width="80" height="14" rx="4" stroke="currentColor" strokeWidth="3" />
    </svg>
  ),
  done: (
    <svg viewBox="0 0 120 120" fill="none" className="w-28 h-28 text-primary/70">
      <circle cx="60" cy="60" r="38" stroke="currentColor" strokeWidth="3" />
      <path d="M42 60l12 12 24-26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  tag: (
    <svg viewBox="0 0 120 120" fill="none" className="w-28 h-28 text-primary/70">
      <path d="M60 20H30a10 10 0 0 0-10 10v30l50 50 40-40-50-50z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="40" cy="40" r="5" fill="currentColor" />
    </svg>
  ),
};

const copy: Record<View, { title: string; sub: string }> = {
  today: { title: 'Nada urgente hoy', sub: 'Aprovecha. O añade algo.' },
  upcoming: { title: 'Semana libre', sub: 'Planifica con tiempo.' },
  all: { title: 'Todo limpio', sub: 'Añade tu primera tarea.' },
  done: { title: 'Aún nada hecho', sub: 'Completa una para verla aquí.' },
  tag: { title: 'Sin tareas con este tag', sub: 'Añade o cambia filtro.' },
};

export default function EmptyState({ view }: { view: View }) {
  const c = copy[view];
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
      {svgs[view] ?? svgs.all}
      <div>
        <p className="text-lg font-semibold">{c.title}</p>
        <p className="text-sm text-muted mt-1">{c.sub}</p>
      </div>
    </div>
  );
}
