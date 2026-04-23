import type { APIRoute } from 'astro';
import { listTags, createTag } from '@/db/queries';

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) return new Response('Unauthorized', { status: 401 });
  return Response.json(await listTags(user.id));
};

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) return new Response('Unauthorized', { status: 401 });
  const body = await request.json();
  const row = await createTag(user.id, body.name, body.color ?? '#14B8A6');
  return Response.json(row);
};
