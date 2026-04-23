import { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, Search, CheckCircle2, X } from 'lucide-react';
import { signOut } from '@/lib/auth-client';
import { useTasks } from '@/lib/store';

export default function TopBar({ userName, demo }: { userName?: string; demo?: boolean }) {
  const [dark, setDark] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const search = useTasks((s) => s.search);
  const setSearch = useTasks((s) => s.setSearch);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  async function logout() {
    if (demo) {
      localStorage.removeItem('cqh-demo');
      window.location.href = '/';
      return;
    }
    await signOut();
    window.location.href = '/';
  }

  return (
    <header className={`sticky top-0 z-30 bg-bg/80 backdrop-blur-xl transition-all ${scrolled ? 'border-b border-border shadow-sm' : 'border-b border-transparent'}`}>
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-2">
        <a href="/today" className="flex items-center gap-2 flex-1 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0" aria-hidden>
            <CheckCircle2 size={16} className="text-primary" strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-[15px] truncate leading-tight">
              {demo ? 'Modo demo' : userName ? userName : 'Cosas'}
            </h1>
            {demo && <p className="text-[10px] text-muted leading-tight">Solo este dispositivo</p>}
          </div>
        </a>
        <button onClick={() => setShowSearch((v) => !v)} aria-label="Buscar" className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-text transition-colors">
          {showSearch ? <X size={18} /> : <Search size={18} />}
        </button>
        <button onClick={toggleTheme} aria-label="Cambiar tema" className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-text transition-colors">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button onClick={logout} aria-label="Salir" className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-text transition-colors">
          <LogOut size={18} />
        </button>
      </div>
      {showSearch && (
        <div className="max-w-2xl mx-auto px-4 pb-3 animate-fade-up">
          <input
            type="search"
            placeholder="Buscar tareas…"
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      )}
    </header>
  );
}
