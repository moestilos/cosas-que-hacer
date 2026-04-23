import { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, Search } from 'lucide-react';
import { signOut } from '@/lib/auth-client';
import { useTasks } from '@/lib/store';

export default function TopBar({ userName, demo }: { userName?: string; demo?: boolean }) {
  const [dark, setDark] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const search = useTasks((s) => s.search);
  const setSearch = useTasks((s) => s.setSearch);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
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
    <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur border-b border-border">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-2">
        <h1 className="font-semibold text-base flex-1">
          {demo ? 'Modo demo' : userName ? `Hola, ${userName}` : 'Cosas'}
        </h1>
        <button onClick={() => setShowSearch((v) => !v)} aria-label="Buscar" className="p-2 rounded-lg hover:bg-surface">
          <Search size={18} />
        </button>
        <button onClick={toggleTheme} aria-label="Cambiar tema" className="p-2 rounded-lg hover:bg-surface">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button onClick={logout} aria-label="Salir" className="p-2 rounded-lg hover:bg-surface">
          <LogOut size={18} />
        </button>
      </div>
      {showSearch && (
        <div className="max-w-2xl mx-auto px-4 pb-3">
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
