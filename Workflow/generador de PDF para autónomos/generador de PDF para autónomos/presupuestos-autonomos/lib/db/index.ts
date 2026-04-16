/**
 * CLIENTE DE BASE DE DATOS — NEON SERVERLESS
 * ===========================================
 * Usa @neondatabase/serverless para queries SQL directas.
 * Funciona en Edge Runtime y serverless sin problema.
 *
 * Uso:
 *   import { sql } from '@/lib/db'
 *   const rows = await sql`SELECT * FROM pdf_generations WHERE id = ${id}`
 */
import { neon } from '@neondatabase/serverless'

// Conexión a Neon (se reutiliza automáticamente en el mismo request)
export const sql = neon(process.env.DATABASE_URL!)

// =============================================
// Helpers tipados para las queries más comunes
// =============================================

export interface UserProfile {
  clerk_user_id: string
  email: string
  full_name: string | null
  role: 'user' | 'admin'
  created_at: string
}

export interface PdfGeneration {
  id: string
  clerk_user_id: string | null
  profile_type: string
  client_name: string
  service_desc: string
  price: number
  status: 'preview' | 'paid' | 'free_admin'
  download_token: string
  quote_data: Record<string, unknown>
  created_at: string
}

export interface Payment {
  id: string
  clerk_user_id: string | null
  pdf_generation_id: string | null
  stripe_session_id: string
  stripe_payment_intent: string | null
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
  completed_at: string | null
}

/**
 * Obtiene el perfil de un usuario por su Clerk user ID
 */
export async function getUserProfile(clerkUserId: string): Promise<UserProfile | null> {
  const rows = await sql`
    SELECT * FROM user_profiles WHERE clerk_user_id = ${clerkUserId} LIMIT 1
  `
  return (rows[0] as UserProfile) ?? null
}

/** Emails que siempre tienen acceso de admin, independientemente del rol en BD */
const HARDCODED_ADMIN_EMAILS = ['gmateosoficial@gmail.com']

/**
 * Verifica si un usuario tiene rol admin.
 * Primero comprueba el email hardcoded, luego el rol en BD.
 */
export async function isUserAdmin(clerkUserId: string | null): Promise<boolean> {
  if (!clerkUserId) return false
  const profile = await getUserProfile(clerkUserId)
  if (!profile) return false
  if (HARDCODED_ADMIN_EMAILS.includes(profile.email)) return true
  return profile.role === 'admin'
}

/**
 * Crea o actualiza el perfil de un usuario (upsert)
 * Se llama desde el webhook de Clerk o en el primer acceso
 */
export async function upsertUserProfile(params: {
  clerkUserId: string
  email: string
  fullName?: string
}): Promise<void> {
  await sql`
    INSERT INTO user_profiles (clerk_user_id, email, full_name, role)
    VALUES (${params.clerkUserId}, ${params.email}, ${params.fullName ?? null}, 'user')
    ON CONFLICT (clerk_user_id)
    DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
      updated_at = now()
  `
}
