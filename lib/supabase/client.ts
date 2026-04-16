/**
 * Cliente de Supabase para uso en el NAVEGADOR (componentes cliente)
 * Usa createBrowserClient de @supabase/ssr
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
