import { defineMiddleware } from 'astro:middleware';
import { auth } from '@/lib/auth';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/demo', '/api/auth'];

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname } = ctx.url;

  const session = await auth.api.getSession({ headers: ctx.request.headers });
  ctx.locals.user = session?.user ?? null;
  ctx.locals.session = session?.session ?? null;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (!isPublic && !session) {
    return ctx.redirect('/login');
  }
  if (session && (pathname === '/login' || pathname === '/signup')) {
    return ctx.redirect('/today');
  }
  return next();
});
