# Cosas Que Hacer

Todo app mobile-first PWA. Captura rápido, no pierdas nada.

## Stack

- **Astro 5** (SSR, output server) + React 19 islands
- **Tailwind v3** (dark-first, CSS vars)
- **Neon Postgres** + **Drizzle ORM**
- **better-auth** (email + password, sesiones cookie)
- **Zustand** (estado cliente + optimistic updates)
- **framer-motion** (swipe + sheet)
- **@dnd-kit** (reorder manual)
- **Lucide** iconos
- **@vite-pwa/astro** manifest + SW offline
- Deploy: **Vercel**

## Setup local

```bash
# 1. Instalar deps
npm install

# 2. Crear DB en neon.tech, copiar connection string
cp .env.example .env
# rellena DATABASE_URL, BETTER_AUTH_SECRET (openssl rand -base64 32), BETTER_AUTH_URL, PUBLIC_APP_URL

# 3. Generar + aplicar migraciones
npm run db:generate
npm run db:push      # o: npm run db:migrate (después de generate)

# 4. Dev
npm run dev
# http://localhost:4321
```

## Env vars

| Var | Descripción |
|-----|-------------|
| `DATABASE_URL` | Postgres connection string (Neon) |
| `BETTER_AUTH_SECRET` | Secreto sesiones (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | URL base del deploy (ej. `http://localhost:4321`) |
| `PUBLIC_APP_URL` | URL pública cliente (igual que arriba en dev) |

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing + enlaces auth / demo |
| `/login` · `/signup` | Auth email+password |
| `/demo` | Modo sin cuenta (localStorage) |
| `/today` | Vencidas + hoy + sin fecha |
| `/upcoming` | Próximos 7 días |
| `/all` | Todas pendientes |
| `/done` | Completadas |
| `/tags` | Gestión de tags |
| `/tag/[id]` | Tareas por tag |
| `/api/auth/*` | better-auth handler |
| `/api/tasks` · `/api/tasks/[id]` | CRUD tasks |
| `/api/tags` · `/api/tags/[id]` | CRUD tags |

## Interacciones

- **Añadir tarea**: FAB bottom-right o tecla `N`
- **Swipe izquierda**: eliminar (toast undo 5s)
- **Swipe derecha**: completar
- **Drag handle**: modo "orden manual"
- **Tecla `Esc`**: cerrar sheets
- Dark por defecto, toggle sol/luna en TopBar
- Búsqueda: icono lupa, filtra en vivo

## Schema DB

Ver `src/db/schema.ts`. Tablas:
- `user` · `session` · `account` · `verification` (better-auth)
- `tasks` (self-FK `parent_id` para subtareas, 1 nivel)
- `tags`

Índices: `tasks_user_due`, `tasks_user_parent`.
Autorización por `user_id = sesión` en cada query (ver `src/db/queries.ts`).

## Deploy Vercel

1. Push branch a GitHub.
2. Import en Vercel, framework detectado = Astro.
3. Env vars en Vercel idénticas a `.env`.
4. `BETTER_AUTH_URL` y `PUBLIC_APP_URL` = dominio Vercel.
5. Primer deploy aplica migrations vía `npm run db:push` (ejecutar manual primera vez).

## PWA

- Manifest auto-generado por `@vite-pwa/astro`
- SW cachea assets estáticos + google fonts
- Instalable iOS (Share → Add to Home Screen) y Android
- Safe-area-inset usado en FAB, BottomNav y sheets

## Accesibilidad

- Focus rings visibles (`:focus-visible`)
- Todos los iconos con `aria-label` o `aria-hidden`
- Touch targets ≥ 44x44
- `prefers-reduced-motion` respetado
- Contraste AA mínimo dark y light

## Scripts

```bash
npm run dev          # astro dev
npm run build        # astro build
npm run preview      # preview build
npm run db:generate  # drizzle-kit generate
npm run db:push      # push schema sin migration
npm run db:migrate   # aplicar migrations generadas
```
