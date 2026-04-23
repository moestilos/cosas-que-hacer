import { CalendarDays, CalendarRange, ListTodo, CheckCheck, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { key: 'today', label: 'Hoy', href: '/today', Icon: CalendarDays },
  { key: 'upcoming', label: '7 días', href: '/upcoming', Icon: CalendarRange },
  { key: 'all', label: 'Todas', href: '/all', Icon: ListTodo },
  { key: 'done', label: 'Hechas', href: '/done', Icon: CheckCheck },
  { key: 'tags', label: 'Tags', href: '/tags', Icon: Tag },
] as const;

export default function BottomNav({ active }: { active: typeof items[number]['key'] }) {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur pb-safe-bottom"
    >
      <ul className="grid grid-cols-5 max-w-2xl mx-auto">
        {items.map(({ key, label, href, Icon }) => {
          const isActive = key === active;
          return (
            <li key={key}>
              <a
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 text-xs transition-colors',
                  isActive ? 'text-primary' : 'text-muted hover:text-text',
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
                <span>{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
