'use client'
/**
 * PÁGINA DE LOGIN
 * Autenticación con Supabase (email + password)
 */
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos'
          : authError.message
      )
      setIsLoading(false)
      return
    }

    // Redirigir a inicio
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900">
            <span>📄</span>
            Presupuesto<span className="text-brand-600">Pro</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Bienvenido de vuelta</h1>
          <p className="text-sm text-gray-500">Inicia sesión en tu cuenta</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-gray-300"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-sm disabled:opacity-60"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-brand-600 hover:text-brand-800 font-medium">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
