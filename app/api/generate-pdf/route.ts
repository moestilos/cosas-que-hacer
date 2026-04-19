/**
 * API ROUTE: /api/generate-pdf
 * =============================
 * Genera y sirve PDFs. Usa Neon para persistir, pero cae en modo stateless
 * (datos codificados en el propio generation_id) si la BD no esta disponible.
 *
 * PUT  → Crea la generación (BD o stateless)
 * POST → Genera el PDF y lo devuelve como fichero descargable
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sql, isUserAdmin, isAdminByClerkEmail } from '@/lib/db'
import { ensureSchema } from '@/lib/db/schema'
import { generatePDF } from '@/lib/pdf/generator'
import crypto from 'crypto'

// Prefijo que marca un id "stateless" (sin BD) -> payload base64url embebido
const STATELESS_PREFIX = 'sl_'

function encodeStateless(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload)
  const b64 = Buffer.from(json, 'utf8').toString('base64url')
  return `${STATELESS_PREFIX}${b64}`
}

function decodeStateless(id: string): Record<string, unknown> | null {
  if (!id.startsWith(STATELESS_PREFIX)) return null
  try {
    const b64 = id.slice(STATELESS_PREFIX.length)
    const json = Buffer.from(b64, 'base64url').toString('utf8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

async function tryAuthUserId(): Promise<string | null> {
  try {
    const a = await auth()
    return a.userId ?? null
  } catch {
    return null
  }
}

// ============================================
// POST: Genera y descarga el PDF
// ============================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { generation_id, download_token } = body as {
      generation_id?: string
      download_token?: string
    }

    if (!generation_id) {
      return NextResponse.json({ error: 'generation_id requerido' }, { status: 400 })
    }

    type PdfPayload = {
      profile_type: string
      client_name: string
      service_desc: string
      price: number
      status: string
      download_token: string
      quote_data: Record<string, unknown>
    }

    let payload: PdfPayload | null = null

    // 1) Camino stateless (id autocontenido)
    const stateless = decodeStateless(generation_id)
    if (stateless) {
      payload = stateless as unknown as PdfPayload
    } else {
      // 2) Camino BD
      try {
        const rows = await sql`
          SELECT * FROM pdf_generations WHERE id = ${generation_id} LIMIT 1
        `
        const row = rows[0] as PdfPayload | undefined
        if (row) payload = row
      } catch (e) {
        console.warn('[generate-pdf POST] BD no disponible, sin fallback posible:', e)
      }
    }

    if (!payload) {
      return NextResponse.json({ error: 'Generación no encontrada' }, { status: 404 })
    }

    const userId = await tryAuthUserId()
    let adminCheck = userId ? await isUserAdmin(userId).catch(() => false) : false
    if (!adminCheck && userId) adminCheck = await isAdminByClerkEmail()

    // Verificar autorización
    if (!adminCheck) {
      if (payload.status === 'preview') {
        return NextResponse.json({ error: 'Pago requerido para descargar el PDF' }, { status: 403 })
      }
      if (payload.download_token !== download_token) {
        return NextResponse.json({ error: 'Token de descarga inválido' }, { status: 403 })
      }
    }

    const quoteData = {
      profile_type: payload.profile_type,
      ...payload.quote_data,
      client_name: payload.client_name,
      service_description: payload.service_desc,
      price: Number(payload.price),
    }

    const pdfBuffer = await generatePDF(quoteData as Parameters<typeof generatePDF>[0])

    const safeId = generation_id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16) || 'pdf'
    const filename = `presupuesto-${payload.profile_type}-${safeId}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('[generate-pdf POST]', error)
    const detail = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Error generando el PDF', detail }, { status: 500 })
  }
}

// ============================================
// PUT: Crea la generación (BD o stateless fallback)
// ============================================
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { profile_type, client_name, service_description, price, vat_percent, ...extraFields } = body

    if (!profile_type || !client_name || !service_description || !price) {
      return NextResponse.json(
        { error: 'Faltan campos: profile_type, client_name, service_description, price' },
        { status: 400 }
      )
    }

    const userId = await tryAuthUserId()
    let adminCheck = userId ? await isUserAdmin(userId).catch(() => false) : false
    if (!adminCheck && userId) adminCheck = await isAdminByClerkEmail()
    const quoteData = { vat_percent: vat_percent ?? 21, ...extraFields, service_description }
    const status = adminCheck ? 'free_admin' : 'preview'

    // Intentar persistir en BD. Si falla, caemos a modo stateless.
    try {
      await ensureSchema()
      const rows = await sql`
        INSERT INTO pdf_generations (
          clerk_user_id, profile_type, client_name, service_desc,
          price, status, quote_data
        )
        VALUES (
          ${userId ?? null},
          ${profile_type},
          ${client_name},
          ${service_description},
          ${Number(price)},
          ${status},
          ${JSON.stringify(quoteData)}
        )
        RETURNING id, download_token, status
      `
      const generation = rows[0] as { id: string; download_token: string; status: string }

      return NextResponse.json({
        generation_id: generation.id,
        download_token: generation.download_token,
        status: generation.status,
        is_admin: adminCheck,
      })
    } catch (dbError) {
      console.warn('[generate-pdf PUT] BD no disponible, usando modo stateless:', dbError)

      const downloadToken = crypto.randomBytes(16).toString('hex')
      const payload = {
        profile_type,
        client_name,
        service_desc: service_description,
        price: Number(price),
        status,
        download_token: downloadToken,
        quote_data: quoteData,
      }
      const generation_id = encodeStateless(payload)

      return NextResponse.json({
        generation_id,
        download_token: downloadToken,
        status,
        is_admin: adminCheck,
        stateless: true,
      })
    }
  } catch (error) {
    console.error('[generate-pdf PUT]', error)
    const detail = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Error guardando la generación', detail },
      { status: 500 }
    )
  }
}
