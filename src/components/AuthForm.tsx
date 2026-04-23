import { useState } from 'react';
import { signIn, signUp } from '@/lib/auth-client';

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      if (mode === 'signup') {
        const r = await signUp.email({ email, password, name: name || email.split('@')[0] });
        if (r.error) throw new Error(r.error.message);
      } else {
        const r = await signIn.email({ email, password });
        if (r.error) throw new Error(r.error.message);
      }
      window.location.href = '/today';
    } catch (e: any) {
      setErr(e.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-3">
      {mode === 'signup' && (
        <input className="input" type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      )}
      <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      <input className="input" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
      {err && <p className="text-sm text-danger" role="alert">{err}</p>}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? '...' : mode === 'signup' ? 'Crear cuenta' : 'Entrar'}
      </button>
    </form>
  );
}
